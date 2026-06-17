import { fetchFromBackend } from '@/lib/api/server';
import type { LogQuery, LogPageResult } from '../types/log';

/**
 * Server Component専用のLog API
 * Backend直接fetch（Route Handler経由しない）
 */
export const logApiServer = {
  /**
   * ログ一覧取得（ページネーション）
   */
  getPage: (params: LogQuery): Promise<LogPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params.startTime) {
      searchParams.set('startTime', params.startTime);
    }
    if (params.endTime) {
      searchParams.set('endTime', params.endTime);
    }
    return fetchFromBackend<LogPageResult>(`logs?${searchParams.toString()}`);
  },
};
