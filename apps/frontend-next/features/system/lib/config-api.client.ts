import { fetchApi } from '@/lib/api/client';
import type { ConfigQuery, ConfigForm, ConfigPageResult } from '../types/config';
import type { ConfigFormValues } from '../schemas/config-schema';

const BASE_URL = '/api/proxy/api/v1/config';

function buildQueryParams(params: ConfigQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.keywords) {
    searchParams.set('keywords', params.keywords);
  }
  return searchParams;
}

/**
 * Client Component専用のConfig API
 * Route Handler経由でBackendにアクセス
 */
export const configApiClient = {
  /**
   * 設定一覧取得（ページネーション）
   */
  getPage: async (params: ConfigQuery): Promise<ConfigPageResult> => {
    return fetchApi<ConfigPageResult>(`${BASE_URL}?${buildQueryParams(params).toString()}`);
  },

  /**
   * 編集フォーム用データ取得
   */
  getFormData: async (id: string): Promise<ConfigForm> => {
    return fetchApi<ConfigForm>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 設定作成
   */
  create: async (data: ConfigFormValues): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 設定更新
   */
  update: async (id: string, data: ConfigFormValues): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 設定削除（複数はカンマ区切り）
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },

  /**
   * 設定キャッシュ再読込
   */
  refreshCache: async (): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/refresh`, {
      method: 'PUT',
    });
  },
};
