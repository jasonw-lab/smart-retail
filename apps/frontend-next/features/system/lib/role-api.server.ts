import { fetchFromBackend } from '@/lib/api/server';
import type { RoleQuery, RolePageResult } from '../types/role';

/**
 * Server Component専用のRole API
 * Backend直接fetch（Route Handler経由しない）
 */
export const roleApiServer = {
  /**
   * 役割一覧取得（ページネーション）
   */
  getPage: (params: RoleQuery): Promise<RolePageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    return fetchFromBackend<RolePageResult>(`roles/page?${searchParams.toString()}`);
  },
};
