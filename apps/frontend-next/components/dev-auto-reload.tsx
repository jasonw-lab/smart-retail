/* eslint-disable no-console */
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * DevAutoReload コンポーネント
 * 開発環境限定で /api/dev/reload (SSE) に接続し、バックエンドの再起動やコミット完了を検知して
 * TanStack Query キャッシュの無効化（最新データの自動再取得）を実行します。
 */
export function DevAutoReload() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      const es = new EventSource('/api/dev/reload');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === 'connected') {
            console.log('[DevAutoReload] Connected to dev auto-reload SSE stream.');
            return;
          }

          console.log('[DevAutoReload] Received event:', data);

          if (data.action === 'refetch') {
            // 画面全体の強制リロードを避け、TanStack Query のキャッシュのみを一括無効化
            queryClient.invalidateQueries();
            toast.success('データ自動更新', {
              description: data.reason || 'バックエンド修正が反映されました',
              duration: 3000,
            });
          } else if (data.action === 'hard-reload') {
            // ルート変更や破壊的変更時はリロード
            window.location.reload();
          }
        } catch (e) {
          console.error('[DevAutoReload] Error parsing SSE message:', e);
        }
      };

      es.onerror = () => {
        es.close();
        // バックエンドや Next.js サーバー再起動時に 3 秒後に自動再接続を試行
        if (!isUnmounted) {
          setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isUnmounted = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [queryClient]);

  return null;
}
