'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApiClient } from '../lib/menu-api.client';
import type { MenuQuery, MenuForm } from '../types/menu';

const {
  getList: getMenus,
  getFormData: getMenu,
  getOptions: getMenuOptions,
  create: createMenu,
  update: updateMenu,
  delete: deleteMenu,
} = menuApiClient;

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

export function useMenuRoutes() {
  return useQuery({
    queryKey: ['menu-routes'],
    queryFn: () => menuApiClient.getRoutes(),
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
    mutationFn: ({ id, data }: { id: number; data: MenuForm }) => updateMenu(id, data),
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
