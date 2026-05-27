'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApiClient } from '../lib/product-api.client';
import type {
  Product,
  ProductQuery,
  ProductPageResult,
  CreateProductDto,
  UpdateProductDto,
} from '../types/product';

/**
 * Query Keys for products
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductQuery) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * 商品一覧取得フック
 */
export function useProducts(
  params: ProductQuery,
  options?: { placeholderData?: ProductPageResult }
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApiClient.getPage(params),
    placeholderData: options?.placeholderData,
    staleTime: 1000 * 60 * 5, // 5分
  });
}

/**
 * 商品詳細取得フック
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApiClient.getById(id),
    enabled: !!id,
  });
}

/**
 * 商品作成Mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productApiClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * 商品更新Mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      productApiClient.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

/**
 * 商品削除Mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
