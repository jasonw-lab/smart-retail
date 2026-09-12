'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApiClient } from '../lib/user-api.client';
import type { UserQuery, PasswordChangeRequest } from '../types/user';
import type { UserFormValues, ProfileFormValues } from '../schemas/user-schema';

export function useUsers(params: UserQuery) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApiClient.getPage(params),
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApiClient.getById(id!),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormValues) => userApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormValues }) =>
      userApiClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string) => userApiClient.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      userApiClient.resetPassword(userId, password),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userApiClient.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileFormValues) => userApiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => userApiClient.changePassword(data),
  });
}
