import { fetchApi } from '@/lib/api/client';
import type {
  Dict,
  DictForm,
  DictQuery,
  DictPageResult,
  DictOption,
  DictItem,
  DictItemForm,
  DictItemQuery,
  DictItemPageResult,
} from '../types/dict';

const BASE_URL = '/api/proxy/api/v1/dicts';

/**
 * Client Component専用のDict API
 * Route Handler経由でBackendにアクセス
 */
export const dictApiClient = {
  /**
   * 辞書一覧取得（ページネーション）
   */
  getPage: async (params: DictQuery): Promise<DictPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    return fetchApi<DictPageResult>(`${BASE_URL}/page?${searchParams.toString()}`);
  },

  /**
   * 辞書オプション一覧取得
   */
  getOptions: async (): Promise<DictOption[]> => {
    return fetchApi<DictOption[]>(`${BASE_URL}/options`);
  },

  /**
   * 辞書詳細取得
   */
  getById: async (id: number): Promise<Dict> => {
    return fetchApi<Dict>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 辞書フォームデータ取得
   */
  getFormData: async (id: number): Promise<DictForm> => {
    return fetchApi<DictForm>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 辞書作成
   */
  create: async (data: DictForm): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 辞書更新
   */
  update: async (id: number, data: DictForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 辞書削除（複数はカンマ区切り）
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },

  /**
   * 辞書項目一覧取得（ページネーション）
   */
  getItems: async (dictCode: string, params: DictItemQuery): Promise<DictItemPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    return fetchApi<DictItemPageResult>(`${BASE_URL}/${dictCode}/items?${searchParams.toString()}`);
  },

  /**
   * 辞書項目フォームデータ取得
   */
  getItemFormData: async (dictCode: string, itemId: number): Promise<DictItemForm> => {
    return fetchApi<DictItemForm>(`${BASE_URL}/${dictCode}/items/${itemId}/form`);
  },

  /**
   * 辞書項目作成
   */
  createItem: async (dictCode: string, data: DictItemForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${dictCode}/items`, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 辞書項目更新
   */
  updateItem: async (dictCode: string, itemId: number, data: DictItemForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${dictCode}/items/${itemId}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 辞書項目削除（複数はカンマ区切り）
   */
  deleteItems: async (dictCode: string, ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${dictCode}/items/${ids}`, {
      method: 'DELETE',
    });
  },
};
