'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertApiClient } from '../lib/alert-api.client';
import type {
  Alert,
  AlertQuery,
  AlertPageResult,
  CreateAlertDto,
  UpdateAlertStatusDto,
} from '../types/alert';

/**
 * Query Keys for alerts
 */
export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params: AlertQuery) => [...alertKeys.lists(), params] as const,
  details: () => [...alertKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertKeys.details(), id] as const,
};

/**
 * アラート一覧取得フック
 */
export function useAlerts(
  params: AlertQuery,
  options?: { placeholderData?: AlertPageResult }
) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * アラート詳細取得フック
 */
export function useAlert(id: string) {
  return useQuery({
    queryKey: alertKeys.detail(id),
    queryFn: () => alertApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * アラート作成 Mutation
 */
export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlertDto) => alertApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

/**
 * アラート状態更新 Mutation
 */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlertStatusDto }) =>
      alertApiClient.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(id) });
    },
  });
}

/**
 * アラート削除 Mutation
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}
