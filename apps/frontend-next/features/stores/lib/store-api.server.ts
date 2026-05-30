import { fetchFromBackend } from '@/lib/api/server';
import type { Store, StoreQuery, StorePageResult } from '../types/store';

/**
 * Server Component専用のStore API
 * Backend直接fetch（Route Handler経由しない）
 */
export const storeApiServer = {
  /**
   * 店舗一覧取得（ページネーション）
   */
  getPage: async (params: StoreQuery): Promise<StorePageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.storeName) {
      searchParams.set('storeName', params.storeName);
    }
    if (params.status) {
      searchParams.set('status', params.status);
    }
    return fetchFromBackend<StorePageResult>(
      `retail/stores?${searchParams.toString()}`
    );
  },

  /**
   * 店舗詳細取得
   */
  getById: async (id: number): Promise<Store> => {
    return fetchFromBackend<Store>(`retail/stores/${id}`);
  },
};
