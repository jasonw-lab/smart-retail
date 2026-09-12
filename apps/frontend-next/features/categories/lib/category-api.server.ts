import { fetchFromBackend } from '@/lib/api/server';
import type { Category } from '../types/category';

/**
 * Server Component専用のCategory API
 * Backend直接fetch（Route Handler経由しない）
 */
export const categoryApiServer = {
  /**
   * カテゴリ全件取得
   */
  getAll: (): Promise<Category[]> => {
    return fetchFromBackend<Category[]>('retail/categories');
  },

  /**
   * カテゴリ詳細取得
   */
  getById: (id: number): Promise<Category> => {
    return fetchFromBackend<Category>(`retail/categories/${id}`);
  },
};
