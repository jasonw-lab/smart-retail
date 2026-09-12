'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApiClient } from '../lib/transaction-api.client';
import { buildTransactionQuery } from '../lib/transaction-query';
import type { TransactionQuery, TransactionPageResult, CreateSalesDto } from '../types/transaction';

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
 * period 指定時は startDate / endDate に変換して API を呼び出す
 */
export function useTransactions(
  params: TransactionQuery,
  options?: { placeholderData?: TransactionPageResult }
) {
  const apiParams = buildTransactionQuery(params);
  return useQuery({
    queryKey: transactionKeys.list(apiParams),
    queryFn: () => transactionApiClient.getPage(apiParams),
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

/**
 * 売上一覧取得フック（リスト）
 */
export function useSalesList(storeId?: number) {
  return useQuery({
    queryKey: [...transactionKeys.all, 'sales-list', storeId ?? 'all'] as const,
    queryFn: () => transactionApiClient.getList({ storeId }),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 売上作成Mutation
 */
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesDto) => transactionApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'sales-list'] });
    },
  });
}
