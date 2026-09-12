import { fetchFromBackend } from '@/lib/api/server';
import type { Store, StoreQuery, StorePageResult } from '../types/store';

/**
 * Server Component専用のStore API
 * Backend直接fetch（Route Handler経由しない）
 */
export const storeApiServer = {
  /**
   * 全店舗リスト取得
   */
  getAll: (): Promise<Store[]> => {
    return fetchFromBackend<Store[]>('retail/stores');
  },

  /**
   * 店舗一覧取得（ページネーション）
   */
  getPage: (params: StoreQuery): Promise<StorePageResult> => {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.storeName) searchParams.set('storeName', params.storeName);
    if (params.address) searchParams.set('address', params.address);
    if (params.status) searchParams.set('status', params.status);

    return fetchFromBackend<StorePageResult>(`retail/stores?${searchParams.toString()}`);
  },

  /**
   * 店舗詳細取得
   */
  getById: (id: number): Promise<Store> => {
    return fetchFromBackend<Store>(`retail/stores/${id}`);
  },
};
