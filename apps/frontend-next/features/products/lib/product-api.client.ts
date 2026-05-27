import { fetchApi } from '@/lib/api/client';
import type {
  Product,
  ProductQuery,
  ProductPageResult,
  CreateProductDto,
  UpdateProductDto,
} from '../types/product';

const BASE_URL = '/api/proxy/retail/products';

/**
 * Client Component専用のProduct API
 * Route Handler経由でBackendにアクセス
 */
export const productApiClient = {
  /**
   * 商品一覧取得（ページネーション）
   */
  getPage: async (params: ProductQuery): Promise<ProductPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.productName) {
      searchParams.set('productName', params.productName);
    }
    if (params.categoryId) {
      searchParams.set('categoryId', String(params.categoryId));
    }
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    return fetchApi<ProductPageResult>(`${BASE_URL}/page?${searchParams.toString()}`);
  },

  /**
   * 商品詳細取得
   */
  getById: async (id: number): Promise<Product> => {
    return fetchApi<Product>(`${BASE_URL}/${id}`);
  },

  /**
   * 商品作成
   */
  create: async (data: CreateProductDto): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 商品更新
   */
  update: async (id: number, data: UpdateProductDto): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 商品削除
   */
  delete: async (id: number): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};
