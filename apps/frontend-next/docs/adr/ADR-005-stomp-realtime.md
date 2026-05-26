# ADR-005: STOMPリアルタイムをReactでどう扱うか

## ステータス
承認済み (2025-05)

## 背景
既存のVue3版フロントエンドでは、@stomp/stompjsを使用してWebSocket経由のリアルタイム通信を実装している。用途は以下:
- 在庫アラート（在庫切れ、期限切れ間近、在庫過多）
- 辞書データの同期
- 通知プッシュ

バックエンドはSpring Boot + STOMP（WebSocket）で、JWT認証を要求。Vue版では`useStomp`フックとして実装され、接続/切断/再接続/クリーンアップを管理している。

App Router環境では、Server ComponentsとClient Componentsの境界が存在するため、WebSocket接続をどこで管理するかを決定する必要がある。

### セキュリティ上の考慮事項
ADR-002ではhttpOnly Cookieを採用してXSS対策を強化したが、WebSocket/STOMP接続時にはJWTトークンをヘッダーに付与する必要がある。この経路ではJavaScriptからトークンにアクセスせざるを得ない。

## 検討した選択肢

### 選択肢1: 短TTL接続チケット方式（採用）
- Route Handlerが短寿命・ワンタイムの接続チケットを発行
- Client ComponentはチケットでSTOMP接続
- 生のaccessTokenをJavaScriptに露出しない

### 選択肢2: accessTokenを直接返す方式
- `/api/auth/ws-token`がaccessTokenをJSONで返す
- Client Componentがそれを使ってSTOMP接続
- XSS時にトークン漏洩リスクあり

### 選択肢3: Cookie認証対応をバックエンドに要求
- WebSocket handshake時にCookieで認証
- バックエンド変更が必要

## 決定
**短TTL接続チケット方式（選択肢1）を採用する。**

### 採用理由

1. **XSSリスクの軽減**
   - 生のaccessToken/refreshTokenをJavaScriptに露出しない
   - 接続チケットは短寿命（30秒）かつワンタイム使用
   - 万が一XSSでチケットが漏洩しても、被害を限定できる

2. **既存バックエンドとの互換性**
   - バックエンドはJWT検証ロジックをそのまま使用
   - チケット発行はRoute Handler側で完結

3. **明確なClient境界**
   - WebSocketはブラウザAPIであり、Server Componentでは利用不可
   - `useStomp`フックを使う箇所が必然的にClient Componentになる

### 接続チケット設計

```typescript
// app/api/auth/ws-ticket/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL;

// 短寿命チケットストア（本番ではRedis等を使用）
const ticketStore = new Map<string, { accessToken: string; expiresAt: number }>();

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 短寿命（30秒）のワンタイムチケットを発行
  const ticket = randomUUID();
  const expiresAt = Date.now() + 30 * 1000; // 30秒

  ticketStore.set(ticket, { accessToken, expiresAt });

  // 古いチケットをクリーンアップ
  for (const [key, value] of ticketStore.entries()) {
    if (value.expiresAt < Date.now()) {
      ticketStore.delete(key);
    }
  }

  return NextResponse.json({ ticket, expiresIn: 30 });
}

// ========================================
// 本番環境向け: Redis実装
// ========================================
// 上記のMap実装はシングルインスタンス環境専用。
// Docker/K8sでのマルチインスタンス展開時は、
// インスタンス間でチケットを共有するためRedisを使用する。
//
// import { Redis } from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
//
// async function createTicket(accessToken: string): Promise<string> {
//   const ticket = crypto.randomUUID();
//   await redis.setex(`ws-ticket:${ticket}`, 30, accessToken); // 30秒TTL
//   return ticket;
// }
//
// async function validateAndConsumeTicket(ticket: string): Promise<string | null> {
//   const accessToken = await redis.get(`ws-ticket:${ticket}`);
//   if (accessToken) {
//     await redis.del(`ws-ticket:${ticket}`); // ワンタイム使用
//   }
//   return accessToken;
// }
// ========================================

// チケット検証用（内部使用）
export function validateAndConsumeTicket(ticket: string): string | null {
  const entry = ticketStore.get(ticket);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    ticketStore.delete(ticket);
    return null;
  }

  // ワンタイム使用：検証後に削除
  ticketStore.delete(ticket);
  return entry.accessToken;
}
```

```typescript
// app/api/ws/connect/route.ts
// WebSocket接続用のトークン交換エンドポイント（バックエンド転送用）
import { NextResponse } from 'next/server';
import { validateAndConsumeTicket } from '../auth/ws-ticket/route';

export async function POST(request: Request) {
  const { ticket } = await request.json();

  const accessToken = validateAndConsumeTicket(ticket);
  if (!accessToken) {
    return NextResponse.json({ error: 'Invalid or expired ticket' }, { status: 401 });
  }

  // accessTokenを返す（この呼び出しは短寿命チケット検証後のみ）
  return NextResponse.json({ token: accessToken });
}
```

### useStomp フック設計

```typescript
// features/alerts/hooks/use-stomp.ts
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
  const activeSubscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  const { setConnected, setReconnectCount, incrementReconnectCount } = useConnectionStore();

  // optionsをメモ化（依存配列の安定化）
  const stableOptions = useMemo(() => ({
    brokerURL: options.brokerURL,
    reconnectDelay: options.reconnectDelay ?? 15000,
    maxReconnectAttempts: options.maxReconnectAttempts ?? 3,
    debug: options.debug ?? false,
  }), [options.brokerURL, options.reconnectDelay, options.maxReconnectAttempts, options.debug]);

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
      options.onConnect?.();

      // 接続確立後に保留中の購読を実行
      executePendingSubscriptions();
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.log('WebSocket切断');
      options.onDisconnect?.();
    };

    client.onWebSocketClose = async (event) => {
      setConnected(false);
      console.log(`WebSocket Close: ${event?.code}`);

      // 再接続処理
      const reconnectCount = useConnectionStore.getState().reconnectCount;
      if (reconnectCount < stableOptions.maxReconnectAttempts) {
        incrementReconnectCount();
        console.log(`再接続試行 (${reconnectCount + 1}/${stableOptions.maxReconnectAttempts})`);

        setTimeout(async () => {
          // 再接続時は新しいトークンを取得
          clientRef.current = null;
          await connect();
        }, stableOptions.reconnectDelay);
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers, frame.body);
      options.onError?.(new Error(frame.body || 'STOMP Error'));
    };

    clientRef.current = client;
    client.activate();
  }, [
    getConnectionToken,
    stableOptions,
    setConnected,
    setReconnectCount,
    incrementReconnectCount,
    executePendingSubscriptions,
    options.onConnect,
    options.onDisconnect,
    options.onError,
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
  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
    // 既に購読済みの場合はスキップ
    if (activeSubscriptionsRef.current.has(destination)) {
      console.log(`既に購読中: ${destination}`);
      return;
    }

    if (clientRef.current?.connected) {
      // 接続済みなら即座に購読
      try {
        const subscription = clientRef.current.subscribe(destination, callback);
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
  }, []);

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

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected: useConnectionStore((state) => state.isConnected),
  };
}
```

### アラート購読フック

```typescript
// features/alerts/hooks/use-alert-subscription.ts
'use client';

import { useEffect, useRef } from 'react';
import { useStomp } from './use-stomp';
import { useAlertStore } from '../store/alert-store';
import type { Alert } from '../types/alert';

export function useAlertSubscription() {
  const isInitializedRef = useRef(false);

  const { connect, subscribe, disconnect, isConnected } = useStomp({
    brokerURL: process.env.NEXT_PUBLIC_WS_ENDPOINT!,
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
```

### 接続状態Store

```typescript
// features/alerts/store/connection-store.ts
import { create } from 'zustand';

interface ConnectionState {
  isConnected: boolean;
  reconnectCount: number;
  setConnected: (connected: boolean) => void;
  setReconnectCount: (count: number) => void;
  incrementReconnectCount: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  reconnectCount: 0,
  setConnected: (connected) => set({ isConnected: connected }),
  setReconnectCount: (count) => set({ reconnectCount: count }),
  incrementReconnectCount: () => set((state) => ({ reconnectCount: state.reconnectCount + 1 })),
}));
```

### Client Componentへの閉じ込め

```typescript
// app/(dashboard)/alerts/page.tsx [Server Component]
import { fetchFromProxy } from '@/lib/api/server';
import { AlertListClient } from '@/features/alerts/components/alert-list-client';
import type { Alert } from '@/features/alerts/types/alert';

export default async function AlertsPage() {
  // 初期データはServer Componentで取得
  const initialAlerts = await fetchFromProxy<Alert[]>('retail/alerts?status=unread');

  return (
    <div>
      <h1>アラート一覧</h1>
      {/* Client ComponentでSTOMP購読 */}
      <AlertListClient initialAlerts={initialAlerts} />
    </div>
  );
}
```

```typescript
// features/alerts/components/alert-list-client.tsx
'use client';

import { useMemo } from 'react';
import { useAlertSubscription } from '../hooks/use-alert-subscription';
import { useAlertStore } from '../store/alert-store';
import type { Alert } from '../types/alert';

interface Props {
  initialAlerts: Alert[];
}

export function AlertListClient({ initialAlerts }: Props) {
  // STOMP接続・購読
  const { isConnected } = useAlertSubscription();

  // Zustandから最新のアラートを取得
  const realtimeAlerts = useAlertStore((state) => state.alerts);

  // 初期データとリアルタイムデータをマージ（重複排除）
  const allAlerts = useMemo(() => {
    const alertMap = new Map<string, Alert>();
    for (const alert of initialAlerts) {
      alertMap.set(alert.id, alert);
    }
    for (const alert of realtimeAlerts) {
      alertMap.set(alert.id, alert);
    }
    return Array.from(alertMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initialAlerts, realtimeAlerts]);

  return (
    <div>
      <div className="mb-4">
        接続状態: {isConnected ? '🟢 接続中' : '🔴 切断'}
      </div>
      <ul>
        {allAlerts.map((alert) => (
          <li key={alert.id} className={alert.read ? 'opacity-50' : ''}>
            [{alert.type}] {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 却下した選択肢の理由

### accessTokenを直接返す方式を却下した理由
- **XSSリスク**: accessTokenがJavaScriptから取得可能になり、httpOnly Cookie採用の効果が減少
- **ADR-002との矛盾**: 「XSS耐性向上」を採用理由にしながら、STOMP経路でトークン露出は一貫性がない
- **トークン漏洩時の影響**: accessTokenの有効期限全体でセッションハイジャックのリスク

### Cookie認証対応を却下した理由
- **バックエンド変更必要**: 既存バックエンド変更不要の方針に反する
- **WebSocket + Cookieの複雑性**: SameSite、CORS設定が複雑になる
- **将来的な選択肢として残す**: バックエンド改修の機会があれば検討

## トレードオフ

### 受け入れるリスク
- 接続チケット方式でも、短時間（30秒以内）のXSS攻撃では漏洩リスクがある
- チケットストアの永続化が必要（本番ではRedis等）
- 接続ごとにチケット取得のオーバーヘッド

### 軽減策
- チケットTTLを30秒に設定し、ワンタイム使用で即時無効化
- CSP（Content Security Policy）の適切な設定
- 重要な操作はWebSocketではなくHTTPS経由（REST API）で実行

### セキュリティ上の制限事項
- WebSocket経路では完全なXSS耐性は実現できない
- 短TTLチケット方式はリスク軽減であり、リスク排除ではない
- 機密性の高い操作はSTOMPではなくREST API経由を推奨

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| チケット発行 | Route Handler `/api/auth/ws-ticket` |
| トークン交換 | Route Handler `/api/ws/connect` |
| STOMP接続 | features/alerts/hooks/use-stomp.ts |
| アラート購読 | features/alerts/hooks/use-alert-subscription.ts |
| 接続状態管理 | features/alerts/store/connection-store.ts |
| 受信データ管理 | features/alerts/store/alert-store.ts |
| 利用コンポーネント | Client Componentのみ |

## アラート種別

| 種別 | 説明 | 購読先 |
|------|------|-------|
| 在庫切れ | 在庫が補充点を下回った | /topic/alerts |
| 期限切れ間近 | 賞味期限が近い商品 | /topic/alerts |
| 在庫過多 | 在庫が最大在庫を超過 | /topic/alerts |
| 通信断 | デバイス接続エラー | /topic/alerts |
| 決済端末異常 | 決済端末のエラー | /topic/alerts |

## 関連ADR
- ADR-002: JWT認証（httpOnly Cookie方針、セキュリティ考慮事項）
- ADR-003: Server/Client境界（STOMP利用コンポーネントはClient）
