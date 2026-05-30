'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApiClient } from '../lib/device-api.client';
import type {
  Device,
  DeviceQuery,
  DevicePageResult,
  CreateDeviceDto,
  UpdateDeviceDto,
} from '../types/device';

/**
 * Query Keys for devices
 */
export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (params: DeviceQuery) => [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (id: number) => [...deviceKeys.details(), id] as const,
};

/**
 * デバイス一覧取得フック
 */
export function useDevices(
  params: DeviceQuery,
  options?: { placeholderData?: DevicePageResult }
) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => deviceApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * デバイス詳細取得フック
 */
export function useDevice(id: number) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => deviceApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * デバイス作成Mutation
 */
export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeviceDto) => deviceApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}

/**
 * デバイス更新Mutation
 */
export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeviceDto }) =>
      deviceApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) });
    },
  });
}

/**
 * デバイス削除Mutation
 */
export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deviceApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}
