'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApiClient } from '../lib/role-api.client';
import { getMenuOptions } from '../lib/menu-api.client';
import type { RoleQuery, RoleForm } from '../types/role';
import type { MenuOption } from '../types/menu';

export function useRoles(params: RoleQuery) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleApiClient.getPage(params),
  });
}

export function useRole(id: number | null) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleApiClient.getById(id!),
    enabled: !!id,
  });
}

export function useRoleOptions() {
  return useQuery({
    queryKey: ['role-options'],
    queryFn: () => roleApiClient.getOptions(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleForm) => roleApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleForm }) => roleApiClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useDeleteRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string) => roleApiClient.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useRoleMenuIds(roleId: number | null) {
  return useQuery({
    queryKey: ['role-menu-ids', roleId],
    queryFn: () => roleApiClient.getMenuIds(roleId!),
    enabled: !!roleId,
  });
}

export function useUpdateRoleMenus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: number; menuIds: number[] }) =>
      roleApiClient.updateMenus(roleId, menuIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menu-ids'] });
    },
  });
}

export function useMenuOptions() {
  return useQuery<MenuOption[]>({
    queryKey: ['menu-options'],
    queryFn: () => getMenuOptions(),
  });
}
