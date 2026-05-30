import type { LogQuery, LogPageResult } from '../types/log';

const BASE_URL = '/api/proxy/api/v1/logs';

export async function getLogs(params: LogQuery): Promise<LogPageResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.keywords) searchParams.set('keywords', params.keywords);
  if (params.startTime) searchParams.set('startTime', params.startTime);
  if (params.endTime) searchParams.set('endTime', params.endTime);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}
