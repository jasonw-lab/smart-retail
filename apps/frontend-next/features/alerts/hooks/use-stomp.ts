'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useConnectionStore } from '../store/connection-store';

interface UseStompOptions {
  brokerURL: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

interface SubscriptionRequest {
  destination: string;
  callback: (message: IMessage) => void;
}

export function useStomp(options: UseStompOptions) {
  const clientRef = useRef<Client | null>(null);
  const pendingSubscriptionsRef = useRef<SubscriptionRequest[]>([]);
  const activeSubscriptionsRef = useRef<Map<string, StompSubscription>>(
    new Map()
  );

  // Store callbacks in refs to avoid re-renders
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { setConnected, setReconnectCount, incrementReconnectCount } =
    useConnectionStore();

  const stableOptions = useMemo(
    () => ({
      brokerURL: options.brokerURL,
      reconnectDelay: options.reconnectDelay ?? 15000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 3,
      debug: options.debug ?? false,
    }),
    [
      options.brokerURL,
      options.reconnectDelay,
      options.maxReconnectAttempts,
      options.debug,
    ]
  );

  // 接続チケットを取得してaccessTokenに交換
  const getConnectionToken = useCallback(async (): Promise<string | null> => {
    try {
      // 1. 短寿命チケットを取得
      const ticketResponse = await fetch('/api/auth/ws-ticket');
      if (!ticketResponse.ok) {
        console.error('WebSocket接続チケット取得失敗');
        return null;
      }
      const { ticket } = await ticketResponse.json();

      // 2. チケットをaccessTokenに交換
      const tokenResponse = await fetch('/api/ws/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket }),
      });
      if (!tokenResponse.ok) {
        console.error('WebSocket接続トークン交換失敗');
        return null;
      }
      const { token } = await tokenResponse.json();
      return token;
    } catch (error) {
      console.error('WebSocket認証エラー:', error);
      return null;
    }
  }, []);

  // 保留中の購読を実行
  const executePendingSubscriptions = useCallback(() => {
    if (!clientRef.current?.connected) return;

    for (const { destination, callback } of pendingSubscriptionsRef.current) {
      try {
        const subscription = clientRef.current.subscribe(destination, callback);
        activeSubscriptionsRef.current.set(destination, subscription);
        console.log(`購読成功: ${destination}`);
      } catch (error) {
        console.error(`購読失敗(${destination}):`, error);
      }
    }
    pendingSubscriptionsRef.current = [];
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current?.connected || clientRef.current?.active) {
      console.log('既に接続中または接続処理中');
      return;
    }

    const token = await getConnectionToken();
    if (!token) {
      console.error('WebSocket接続失敗: トークン取得不可');
      return;
    }

    const client = new Client({
      brokerURL: stableOptions.brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 0, // 自前で制御
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: stableOptions.debug ? console.log : () => {},
    });

    client.onConnect = () => {
      setConnected(true);
      setReconnectCount(0);
      console.log('WebSocket接続確立');
      optionsRef.current.onConnect?.();

      // 接続確立後に保留中の購読を実行
      executePendingSubscriptions();
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.log('WebSocket切断');
      optionsRef.current.onDisconnect?.();
    };

    client.onWebSocketClose = async (event) => {
      setConnected(false);
      console.log(`WebSocket Close: ${event?.code}`);

      // 再接続処理
      const reconnectCount = useConnectionStore.getState().reconnectCount;
      if (reconnectCount < stableOptions.maxReconnectAttempts) {
        incrementReconnectCount();
        console.log(
          `再接続試行 (${reconnectCount + 1}/${stableOptions.maxReconnectAttempts})`
        );

        setTimeout(async () => {
          // 再接続時は新しいトークンを取得
          clientRef.current = null;
          await connect();
        }, stableOptions.reconnectDelay);
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers, frame.body);
      optionsRef.current.onError?.(new Error(frame.body || 'STOMP Error'));
    };

    clientRef.current = client;
    client.activate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getConnectionToken,
    stableOptions,
    setConnected,
    setReconnectCount,
    incrementReconnectCount,
    executePendingSubscriptions,
    // options is intentionally excluded - callbacks are stable via refs
  ]);

  const disconnect = useCallback(() => {
    // アクティブな購読を全て解除
    for (const subscription of activeSubscriptionsRef.current.values()) {
      subscription.unsubscribe();
    }
    activeSubscriptionsRef.current.clear();
    pendingSubscriptionsRef.current = [];

    clientRef.current?.deactivate();
    clientRef.current = null;
    setConnected(false);
    setReconnectCount(0);
  }, [setConnected, setReconnectCount]);

  // 購読登録（接続前でも呼び出し可能）
  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      // 既に購読済みの場合はスキップ
      if (activeSubscriptionsRef.current.has(destination)) {
        console.log(`既に購読中: ${destination}`);
        return;
      }

      if (clientRef.current?.connected) {
        // 接続済みなら即座に購読
        try {
          const subscription = clientRef.current.subscribe(
            destination,
            callback
          );
          activeSubscriptionsRef.current.set(destination, subscription);
          console.log(`購読成功: ${destination}`);
        } catch (error) {
          console.error(`購読失敗(${destination}):`, error);
        }
      } else {
        // 未接続なら保留リストに追加
        pendingSubscriptionsRef.current.push({ destination, callback });
        console.log(`購読保留: ${destination}`);
      }
    },
    []
  );

  const unsubscribe = useCallback((destination: string) => {
    const subscription = activeSubscriptionsRef.current.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptionsRef.current.delete(destination);
    }
    // 保留リストからも削除
    pendingSubscriptionsRef.current = pendingSubscriptionsRef.current.filter(
      (s) => s.destination !== destination
    );
  }, []);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Get isConnected at hook level (correct hook usage)
  const isConnected = useConnectionStore((state) => state.isConnected);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected,
  };
}
