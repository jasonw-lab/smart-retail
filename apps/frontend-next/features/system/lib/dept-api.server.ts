import { fetchFromBackend } from '@/lib/api/server';
import type { Dept, DeptQuery } from '../types/dept';

/**
 * Server Component専用のDept API
 * Backend直接fetch（Route Handler経由しない）
 */
export const deptApiServer = {
  /**
   * 部門一覧取得（ツリー形式）
   */
  getList: (params?: DeptQuery): Promise<Dept[]> => {
    const searchParams = new URLSearchParams();
    if (params?.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params?.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    const query = searchParams.toString();
    return fetchFromBackend<Dept[]>(`depts${query ? `?${query}` : ''}`);
  },

  /**
   * 部門詳細取得（フォーム用）
   */
  getById: (id: number): Promise<Dept> => {
    return fetchFromBackend<Dept>(`depts/${id}/form`);
  },
};
