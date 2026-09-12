'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeApiClient } from '../lib/notice-api.client';
import type { NoticeQuery, NoticePageResult } from '../types/notice';
import type { NoticeFormValues } from '../schemas/notice-schema';

/**
 * Query Keys for notices
 */
export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (params: NoticeQuery) => [...noticeKeys.lists(), params] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: string) => [...noticeKeys.details(), id] as const,
  myLists: () => [...noticeKeys.all, 'my'] as const,
};

/**
 * 通知一覧取得フック
 */
export function useNotices(params: NoticeQuery, options?: { placeholderData?: NoticePageResult }) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => noticeApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * マイ通知一覧取得フック
 */
export function useMyNotices(params: NoticeQuery, options?: { placeholderData?: NoticePageResult }) {
  return useQuery({
    queryKey: [...noticeKeys.myLists(), params],
    queryFn: () => noticeApiClient.getMyNotices(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 通知詳細取得フック
 */
export function useNotice(id: string) {
  return useQuery({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticeApiClient.getFormData(id),
    enabled: !!id,
  });
}

/**
 * 通知作成Mutation
 */
export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoticeFormValues) => noticeApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/**
 * 通知更新Mutation
 */
export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoticeFormValues }) =>
      noticeApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(id) });
    },
  });
}

/**
 * 通知削除Mutation
 */
export function useDeleteNotices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string) => noticeApiClient.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/**
 * 通知発行Mutation
 */
export function usePublishNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noticeApiClient.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/**
 * 通知撤回Mutation
 */
export function useRevokeNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noticeApiClient.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/**
 * 全通知既読Mutation
 */
export function useReadAllNotices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => noticeApiClient.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.myLists() });
    },
  });
}
