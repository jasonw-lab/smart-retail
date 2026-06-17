import { fetchFromBackend } from '@/lib/api/server';
import type { User, UserQuery, UserPageResult } from '../types/user';

/**
 * Server Component専用のUser API
 * Backend直接fetch（Route Handler経由しない）
 */
export const userApiServer = {
  /**
   * ユーザー一覧取得（ページネーション）
   */
  getPage: (params: UserQuery): Promise<UserPageResult> => {
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
    if (params.deptId) {
      searchParams.set('deptId', String(params.deptId));
    }
    if (params.startTime) {
      searchParams.set('startTime', params.startTime);
    }
    if (params.endTime) {
      searchParams.set('endTime', params.endTime);
    }
    return fetchFromBackend<UserPageResult>(`users?${searchParams.toString()}`);
  },

  /**
   * ユーザー詳細取得
   */
  getById: (id: number): Promise<User> => {
    return fetchFromBackend<User>(`users/${id}`);
  },
};
