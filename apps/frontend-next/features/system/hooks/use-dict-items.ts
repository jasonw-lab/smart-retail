'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictApiClient } from '../lib/dict-api.client';
import type { DictItemQuery, DictItemForm, DictItemPageResult } from '../types/dict';

/**
 * Query Keys for dictionary items
 */
export const dictItemKeys = {
  all: (dictCode: string) => ['dict-items', dictCode] as const,
  lists: (dictCode: string) => [...dictItemKeys.all(dictCode), 'list'] as const,
  list: (dictCode: string, params: DictItemQuery) =>
    [...dictItemKeys.lists(dictCode), params] as const,
  details: (dictCode: string) => [...dictItemKeys.all(dictCode), 'detail'] as const,
  detail: (dictCode: string, id: number) => [...dictItemKeys.details(dictCode), id] as const,
};

/**
 * 辞書項目一覧取得フック
 */
export function useDictItems(
  dictCode: string,
  params: DictItemQuery,
  options?: { placeholderData?: DictItemPageResult }
) {
  return useQuery({
    queryKey: dictItemKeys.list(dictCode, params),
    queryFn: () => dictApiClient.getItems(dictCode, params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
    enabled: !!dictCode,
  });
}

/**
 * 辞書項目フォームデータ取得フック
 */
export function useDictItem(dictCode: string, id: number | null) {
  return useQuery({
    queryKey: dictItemKeys.detail(dictCode, id ?? 0),
    queryFn: () => dictApiClient.getItemFormData(dictCode, id!),
    enabled: !!dictCode && !!id,
  });
}

/**
 * 辞書項目作成Mutation
 */
export function useCreateDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dictCode, data }: { dictCode: string; data: DictItemForm }) =>
      dictApiClient.createItem(dictCode, data),
    onSuccess: (_, { dictCode }) => {
      queryClient.invalidateQueries({ queryKey: dictItemKeys.lists(dictCode) });
    },
  });
}

/**
 * 辞書項目更新Mutation
 */
export function useUpdateDictItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dictCode, id, data }: { dictCode: string; id: number; data: DictItemForm }) =>
      dictApiClient.updateItem(dictCode, id, data),
    onSuccess: (_, { dictCode, id }) => {
      queryClient.invalidateQueries({ queryKey: dictItemKeys.lists(dictCode) });
      queryClient.invalidateQueries({ queryKey: dictItemKeys.detail(dictCode, id) });
    },
  });
}

/**
 * 辞書項目削除Mutation
 */
export function useDeleteDictItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dictCode, ids }: { dictCode: string; ids: string }) =>
      dictApiClient.deleteItems(dictCode, ids),
    onSuccess: (_, { dictCode }) => {
      queryClient.invalidateQueries({ queryKey: dictItemKeys.lists(dictCode) });
    },
  });
}
