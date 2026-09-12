'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApiClient } from '../lib/config-api.client';
import type { ConfigQuery, ConfigPageResult } from '../types/config';
import type { ConfigFormValues } from '../schemas/config-schema';

/**
 * Query Keys for system configs
 */
export const configKeys = {
  all: ['configs'] as const,
  lists: () => [...configKeys.all, 'list'] as const,
  list: (params: ConfigQuery) => [...configKeys.lists(), params] as const,
  details: () => [...configKeys.all, 'detail'] as const,
  detail: (id: string) => [...configKeys.details(), id] as const,
};

/**
 * 設定一覧取得フック
 */
export function useConfigs(params: ConfigQuery, options?: { placeholderData?: ConfigPageResult }) {
  return useQuery({
    queryKey: configKeys.list(params),
    queryFn: () => configApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 設定詳細取得フック
 */
export function useConfig(id: string) {
  return useQuery({
    queryKey: configKeys.detail(id),
    queryFn: () => configApiClient.getFormData(id),
    enabled: !!id,
  });
}

/**
 * 設定作成Mutation
 */
export function useCreateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigFormValues) => configApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
    },
  });
}

/**
 * 設定更新Mutation
 */
export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfigFormValues }) =>
      configApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
      queryClient.invalidateQueries({ queryKey: configKeys.detail(id) });
    },
  });
}

/**
 * 設定削除Mutation
 */
export function useDeleteConfigs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string) => configApiClient.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
    },
  });
}

/**
 * 設定キャッシュ再読込Mutation
 */
export function useRefreshConfigCache() {
  return useMutation({
    mutationFn: () => configApiClient.refreshCache(),
  });
}
