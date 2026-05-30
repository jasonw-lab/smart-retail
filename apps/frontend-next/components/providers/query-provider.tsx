'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SSR時のハイドレーションエラーを防ぐ
            staleTime: 60 * 1000, // 1分
            // エラー時のリトライ制限
            retry: 1,
            // 自動リフェッチの設定
            refetchOnWindowFocus: false,
            // クエリエラーをError Boundaryにスローしない
            // エラーはuseQueryのisError/errorで処理する
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
