'use client';

import { useEffect, useRef } from 'react';
import { useStomp } from './use-stomp';
import { useAlertStore } from '../store/alert-store';
import type { Alert } from '../types/alert';

export function useAlertSubscription() {
  const isInitializedRef = useRef(false);

  const { connect, subscribe, disconnect, isConnected } = useStomp({
    brokerURL: process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8091/ws',
    onConnect: () => console.log('アラート購読準備完了'),
    onError: (error) => console.error('STOMP接続エラー:', error),
  });

  const addAlert = useAlertStore((state) => state.addAlert);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // 購読を先に登録（接続完了後に自動実行される）
    subscribe('/topic/alerts', (message) => {
      try {
        const alert: Alert = JSON.parse(message.body);
        addAlert(alert);
      } catch (error) {
        console.error('アラートパースエラー:', error);
      }
    });

    // 接続開始
    connect();

    return () => {
      disconnect();
      isInitializedRef.current = false;
    };
  }, [connect, subscribe, disconnect, addAlert]);

  return { isConnected };
}
