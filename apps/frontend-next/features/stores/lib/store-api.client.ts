import { fetchApi } from '@/lib/api/client';
import type {
  Store,
  StoreQuery,
  StorePageResult,
  CreateStoreDto,
  UpdateStoreDto,
} from '../types/store';

const BASE_URL = '/api/proxy/api/v1/retail/stores';

export const storeApiClient = {
  /**
   * 店舗一覧取得(ページング)
   */
  async getPage(params: StoreQuery): Promise<StorePageResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.storeName) searchParams.set('storeName', params.storeName);
    if (params.status) searchParams.set('status', params.status);

    return fetchApi<StorePageResult>(`${BASE_URL}?${searchParams.toString()}`);
  },

  /**
   * 全店舗リスト取得(セレクトボックス用)
   */
  async getAll(): Promise<Store[]> {
    return fetchApi<Store[]>(`${BASE_URL}/list`);
  },

  /**
   * 店舗詳細取得
   */
  async getById(id: number): Promise<Store> {
    return fetchApi<Store>(`${BASE_URL}/${id}`);
  },

  /**
   * 店舗作成
   */
  async create(data: CreateStoreDto): Promise<Store> {
    return fetchApi<Store>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 店舗更新
   */
  async update(id: number, data: UpdateStoreDto): Promise<Store> {
    return fetchApi<Store>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 店舗削除
   */
  async delete(id: number): Promise<void> {
    return fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};
