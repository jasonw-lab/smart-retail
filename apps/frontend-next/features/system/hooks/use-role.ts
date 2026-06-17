'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRole,
  getRoleOptions,
  createRole,
  updateRole,
  deleteRoles,
  getRoleMenuIds,
  updateRoleMenus,
  getMenuOptions,
} from '../lib/role-api.client';
import type { RoleQuery, RoleForm } from '../types/role';

export function useRoles(params: RoleQuery) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRoles(params),
  });
}

export function useRole(id: number | null) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRole(id!),
    enabled: !!id,
  });
}

export function useRoleOptions() {
  return useQuery({
    queryKey: ['role-options'],
    queryFn: getRoleOptions,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleForm) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleForm }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useDeleteRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string) => deleteRoles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-options'] });
    },
  });
}

export function useRoleMenuIds(roleId: number | null) {
  return useQuery({
    queryKey: ['role-menu-ids', roleId],
    queryFn: () => getRoleMenuIds(roleId!),
    enabled: !!roleId,
  });
}

export function useUpdateRoleMenus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: number; menuIds: number[] }) =>
      updateRoleMenus(roleId, menuIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menu-ids'] });
    },
  });
}

export function useMenuOptions() {
  return useQuery({
    queryKey: ['menu-options'],
    queryFn: getMenuOptions,
  });
}
