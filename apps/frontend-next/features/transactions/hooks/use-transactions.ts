'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionApiClient } from '../lib/transaction-api.client';
import type { TransactionQuery, TransactionPageResult } from '../types/transaction';

/**
 * Query Keys for transactions
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionQuery) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
};

/**
 * 決済履歴一覧取得フック
 */
export function useTransactions(
  params: TransactionQuery,
  options?: { placeholderData?: TransactionPageResult }
) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 決済詳細取得フック
 */
export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionApiClient.getById(id),
    enabled: !!id,
  });
}
