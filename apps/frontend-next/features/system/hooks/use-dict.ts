'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDicts,
  getDict,
  createDict,
  updateDict,
  deleteDicts,
  getDictItems,
  getDictItem,
  createDictItem,
  updateDictItem,
  deleteDictItems,
} from '../lib/dict-api.client';
import type {
  DictQuery,
  DictForm,
  DictItemQuery,
  DictItemForm,
} from '../types/dict';

export function useDicts(params: DictQuery) {
  return useQuery({
    queryKey: ['dicts', params],
    queryFn: () => getDicts(params),
  });
}

export function useDict(id: number | null) {
  return useQuery({
    queryKey: ['dict', id],
    queryFn: () => getDict(id!),
    enabled: !!id,
  });
}

export function useCreateDict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DictForm) => createDict(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
    },
  });
}

export function useUpdateDict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DictForm }) =>
      updateDict(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
    },
  });
}

export function useDeleteDicts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string) => deleteDicts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
    },
  });
}

// 字典項目
export function useDictItems(params: DictItemQuery) {
  return useQuery({
    queryKey: ['dict-items', params],
    queryFn: () => getDictItems(params),
    enabled: !!params.dictCode,
  });
}

export function useDictItem(dictCode: string | null, id: number | null) {
  return useQuery({
    queryKey: ['dict-item', dictCode, id],
    queryFn: () => getDictItem(dictCode!, id!),
    enabled: !!dictCode && !!id,
  });
}

export function useCreateDictItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dictCode,
      data,
    }: {
      dictCode: string;
      data: DictItemForm;
    }) => createDictItem(dictCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
  });
}

export function useUpdateDictItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dictCode,
      id,
      data,
    }: {
      dictCode: string;
      id: number;
      data: DictItemForm;
    }) => updateDictItem(dictCode, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
  });
}

export function useDeleteDictItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dictCode, ids }: { dictCode: string; ids: string }) =>
      deleteDictItems(dictCode, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dict-items'] });
    },
  });
}
