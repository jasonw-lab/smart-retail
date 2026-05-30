'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepts,
  getDept,
  getDeptOptions,
  createDept,
  updateDept,
  deleteDepts,
} from '../lib/dept-api.client';
import type { DeptQuery, DeptForm } from '../types/dept';

export function useDepts(params?: DeptQuery) {
  return useQuery({
    queryKey: ['depts', params],
    queryFn: () => getDepts(params),
  });
}

export function useDept(id: number | null) {
  return useQuery({
    queryKey: ['dept', id],
    queryFn: () => getDept(id!),
    enabled: !!id,
  });
}

export function useDeptOptions() {
  return useQuery({
    queryKey: ['dept-options'],
    queryFn: getDeptOptions,
  });
}

export function useCreateDept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeptForm) => createDept(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] });
      queryClient.invalidateQueries({ queryKey: ['dept-options'] });
    },
  });
}

export function useUpdateDept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeptForm }) => updateDept(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] });
      queryClient.invalidateQueries({ queryKey: ['dept-options'] });
    },
  });
}

export function useDeleteDepts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string) => deleteDepts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] });
      queryClient.invalidateQueries({ queryKey: ['dept-options'] });
    },
  });
}
