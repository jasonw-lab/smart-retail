'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStomp } from './use-stomp';
import { useAlertStore } from '../store/alert-store';
import { clientEnv } from '@/lib/env/client';
import { alertKeys } from './use-alerts';
import type { Alert, AlertPageResult } from '../types/alert';

export function useAlertSubscription() {
  const isInitializedRef = useRef(false);
  const queryClient = useQueryClient();

  const { connect, subscribe, disconnect, isConnected } = useStomp({
    brokerURL: clientEnv.NEXT_PUBLIC_WS_ENDPOINT,
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

        // REST 一覧の Query Cache も更新して整合性を保つ
        queryClient.setQueriesData<AlertPageResult>(
          { queryKey: alertKeys.lists() },
          (old) => {
            if (!old) return old;
            const exists = old.list.some((item) => item.id === alert.id);
            if (exists) return old;
            return {
              ...old,
              list: [alert, ...old.list],
              total: old.total + 1,
            };
          }
        );
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
  }, [connect, subscribe, disconnect, addAlert, queryClient]);

  return { isConnected };
}
