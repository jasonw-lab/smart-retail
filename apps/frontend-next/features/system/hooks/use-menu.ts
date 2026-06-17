'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMenus,
  getMenu,
  getMenuOptions,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../lib/menu-api.client';
import type { MenuQuery, MenuForm } from '../types/menu';

export function useMenus(params?: MenuQuery) {
  return useQuery({
    queryKey: ['menus', params],
    queryFn: () => getMenus(params),
  });
}

export function useMenu(id: number | null) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => getMenu(id!),
    enabled: !!id,
  });
}

export function useMenuOptionsQuery(onlyParent?: boolean) {
  return useQuery({
    queryKey: ['menu-options', onlyParent],
    queryFn: () => getMenuOptions(onlyParent),
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MenuForm) => createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu-options'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MenuForm }) =>
      updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu-options'] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu-options'] });
    },
  });
}
