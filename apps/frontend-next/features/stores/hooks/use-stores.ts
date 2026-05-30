'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApiClient } from '../lib/store-api.client';
import type {
  Store,
  StoreQuery,
  StorePageResult,
  CreateStoreDto,
  UpdateStoreDto,
} from '../types/store';

/**
 * Query Keys for stores
 */
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (params: StoreQuery) => [...storeKeys.lists(), params] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: number) => [...storeKeys.details(), id] as const,
  options: () => [...storeKeys.all, 'options'] as const,
};

/**
 * 店舗一覧取得フック
 */
export function useStores(
  params: StoreQuery,
  options?: { placeholderData?: StorePageResult }
) {
  return useQuery({
    queryKey: storeKeys.list(params),
    queryFn: () => storeApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 全店舗リスト取得フック(セレクトボックス用)
 */
export function useStoreOptions() {
  return useQuery({
    queryKey: storeKeys.options(),
    queryFn: () => storeApiClient.getAll(),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * 店舗詳細取得フック
 */
export function useStore(id: number) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storeApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * 店舗作成Mutation
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreDto) => storeApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeKeys.options() });
    },
  });
}

/**
 * 店舗更新Mutation
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreDto }) =>
      storeApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: storeKeys.options() });
    },
  });
}

/**
 * 店舗削除Mutation
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => storeApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeKeys.options() });
    },
  });
}
