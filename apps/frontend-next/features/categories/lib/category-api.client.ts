import { fetchApi } from '@/lib/api/client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

const BASE_URL = '/api/proxy/api/v1/retail/categories';

/**
 * Client Component専用のCategory API
 * Route Handler経由でBackendにアクセス
 */
export const categoryApiClient = {
  /**
   * カテゴリ全件取得
   */
  getAll: async (): Promise<Category[]> => {
    return fetchApi<Category[]>(BASE_URL);
  },

  /**
   * カテゴリ詳細取得
   */
  getById: async (id: number): Promise<Category> => {
    return fetchApi<Category>(`${BASE_URL}/${id}`);
  },

  /**
   * カテゴリ作成
   */
  create: async (data: CreateCategoryDto): Promise<Category> => {
    return fetchApi<Category>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * カテゴリ更新
   */
  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    return fetchApi<Category>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * カテゴリ削除
   */
  delete: async (id: number): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};
