'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApiClient } from '../lib/inventory-api.client';
import type {
  Inventory,
  InventoryQuery,
  InventoryListQuery,
  InventoryPageResult,
  InventoryTransactionQuery,
  InventoryTransaction,
  InventoryTransactionForm,
  ReplenishDto,
  DisposeDto,
  CreateInventoryDto,
  UpdateInventoryDto,
} from '../types/inventory';

/**
 * Query Keys for inventory
 */
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: InventoryQuery) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventoryKeys.details(), id] as const,
  history: (storeId: number, productId: number) =>
    [...inventoryKeys.all, 'history', storeId, productId] as const,
  transactions: (params: InventoryTransactionQuery) =>
    [...inventoryKeys.all, 'transactions', params] as const,
  inbound: (params: InventoryTransactionQuery) =>
    [...inventoryKeys.all, 'inbound', params] as const,
  outbound: (params: InventoryTransactionQuery) =>
    [...inventoryKeys.all, 'outbound', params] as const,
};

/**
 * 在庫一覧取得フック
 */
export function useInventory(
  params: InventoryQuery,
  options?: { placeholderData?: InventoryPageResult }
) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 在庫詳細取得フック
 */
export function useInventoryDetail(id: number) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * 在庫トランザクション履歴取得フック
 */
export function useInventoryHistory(storeId: number, productId: number) {
  const params: InventoryTransactionQuery = {
    pageNum: 1,
    pageSize: 50,
    storeId,
    productId,
  };

  return useQuery({
    queryKey: inventoryKeys.history(storeId, productId),
    queryFn: () => inventoryApiClient.getTransactions(params),
    enabled: !!storeId && !!productId,
  });
}

/**
 * 在庫トランザクションページ取得フック
 */
export function useInventoryTransactions(
  params: InventoryTransactionQuery,
  options?: { placeholderData?: { list: InventoryTransaction[]; total: number } }
) {
  return useQuery({
    queryKey: inventoryKeys.transactions(params),
    queryFn: () => inventoryApiClient.getTransactionsPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 入庫トランザクションページ取得フック
 */
export function useInboundTransactions(
  params: InventoryTransactionQuery,
  options?: { placeholderData?: { list: InventoryTransaction[]; total: number } }
) {
  return useQuery({
    queryKey: inventoryKeys.inbound(params),
    queryFn: () => inventoryApiClient.getInboundPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 出庫トランザクションページ取得フック
 */
export function useOutboundTransactions(
  params: InventoryTransactionQuery,
  options?: { placeholderData?: { list: InventoryTransaction[]; total: number } }
) {
  return useQuery({
    queryKey: inventoryKeys.outbound(params),
    queryFn: () => inventoryApiClient.getOutboundPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * 在庫トランザクション更新Mutation
 */
export function useUpdateInventoryTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryTransactionForm }) =>
      inventoryApiClient.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

/**
 * 在庫作成Mutation
 */
export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryDto) => inventoryApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

/**
 * 在庫更新Mutation
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInventoryDto }) =>
      inventoryApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
    },
  });
}

/**
 * 在庫削除Mutation
 */
export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

/**
 * 補充Mutation
 */
export function useReplenish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReplenishDto) => inventoryApiClient.replenish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

/**
 * 廃棄Mutation
 */
export function useDispose() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DisposeDto) => inventoryApiClient.dispose(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
