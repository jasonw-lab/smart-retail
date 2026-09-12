import { fetchApi } from '@/lib/api/client';
import type { Dept, DeptQuery, DeptForm, DeptOption } from '../types/dept';

const BASE_URL = '/api/proxy/api/v1/depts';

/**
 * Client Component専用のDept API
 * Route Handler経由でBackendにアクセス
 */
export const deptApiClient = {
  /**
   * 部門一覧取得（ツリー）
   */
  getList: async (params?: DeptQuery): Promise<Dept[]> => {
    const searchParams = new URLSearchParams();
    if (params?.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params?.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    const query = searchParams.toString();
    return fetchApi<Dept[]>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  /**
   * 部門ドロップダウン取得
   */
  getOptions: async (): Promise<DeptOption[]> => {
    return fetchApi<DeptOption[]>(`${BASE_URL}/options`);
  },

  /**
   * 部門編集フォーム用データ取得
   */
  getFormData: async (id: number): Promise<Dept> => {
    return fetchApi<Dept>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 部門作成
   */
  create: async (data: DeptForm): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 部門更新
   */
  update: async (id: number, data: DeptForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 部門一括削除
   * @param ids カンマ区切りの部門ID
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },
};
