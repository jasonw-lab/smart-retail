'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictApiClient } from '../lib/dict-api.client';
import type { DictQuery, DictForm, DictPageResult } from '../types/dict';

/**
 * Query Keys for dictionaries
 */
export const dictKeys = {
  all: ['dicts'] as const,
  lists: () => [...dictKeys.all, 'list'] as const,
  list: (params: DictQuery) => [...dictKeys.lists(), params] as const,
  details: () => [...dictKeys.all, 'detail'] as const,
  detail: (id: number) => [...dictKeys.details(), id] as const,
};

/**
 * 辞書一覧取得フック
 */
export function useDicts(params: DictQuery, options?: { placeholderData?: DictPageResult }) {
  return useQuery({
    queryKey: dictKeys.list(params),
    queryFn: () => dictApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 辞書詳細取得フック
 */
export function useDict(id: number) {
  return useQuery({
    queryKey: dictKeys.detail(id),
    queryFn: () => dictApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * 辞書作成Mutation
 */
export function useCreateDict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DictForm) => dictApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictKeys.lists() });
    },
  });
}

/**
 * 辞書更新Mutation
 */
export function useUpdateDict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DictForm }) => dictApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: dictKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dictKeys.detail(id) });
    },
  });
}

/**
 * 辞書削除Mutation
 */
export function useDeleteDicts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string) => dictApiClient.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictKeys.lists() });
    },
  });
}
