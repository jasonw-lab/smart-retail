import { fetchFromBackend } from '@/lib/api/server';
import type { Role, RoleQuery, RolePageResult } from '../types/role';

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

  /**
   * 役割詳細取得（編集フォーム用）
   */
  getById: (id: number): Promise<Role> => {
    return fetchFromBackend<Role>(`roles/${id}/form`);
  },
};
