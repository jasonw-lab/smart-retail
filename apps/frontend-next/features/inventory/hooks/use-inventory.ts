'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApiClient } from '../lib/inventory-api.client';
import type {
  Inventory,
  InventoryQuery,
  InventoryPageResult,
  ReplenishDto,
  DisposeDto,
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
 * 在庫履歴取得フック
 */
export function useInventoryHistory(storeId: number, productId: number) {
  return useQuery({
    queryKey: inventoryKeys.history(storeId, productId),
    queryFn: () => inventoryApiClient.getHistory(storeId, productId),
    enabled: !!storeId && !!productId,
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
