import { fetchFromBackend } from '@/lib/api/server';
import type { ConfigQuery, ConfigPageResult, ConfigForm } from '../types/config';

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
 * Server Component専用のConfig API
 * Backend直接fetch（Route Handler経由しない）
 */
export const configApiServer = {
  /**
   * 設定一覧取得（ページネーション）
   */
  getPage: (params: ConfigQuery): Promise<ConfigPageResult> => {
    return fetchFromBackend<ConfigPageResult>(`config?${buildQueryParams(params).toString()}`);
  },

  /**
   * 編集フォーム用データ取得
   */
  getFormData: (id: string): Promise<ConfigForm> => {
    return fetchFromBackend<ConfigForm>(`config/${id}/form`);
  },
};
