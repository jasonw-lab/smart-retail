import { fetchApi } from '@/lib/api/client';
import type { LogQuery, LogPageResult } from '../types/log';

const BASE_URL = '/api/proxy/api/v1/logs';

/**
 * Client Component専用のLog API
 * Route Handler経由でBackendにアクセス
 */
export async function getLogs(params: LogQuery): Promise<LogPageResult> {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.keywords) searchParams.set('keywords', params.keywords);
  if (params.startTime) searchParams.set('startTime', params.startTime);
  if (params.endTime) searchParams.set('endTime', params.endTime);

  return fetchApi<LogPageResult>(`${BASE_URL}?${searchParams.toString()}`);
}

export const logApiClient = {
  getPage: getLogs,
  getLogs,
};

