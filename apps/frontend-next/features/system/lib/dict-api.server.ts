import { fetchFromBackend } from '@/lib/api/server';
import type { DictQuery, DictPageResult } from '../types/dict';

/**
 * Server Component専用のDict API
 * Backend直接fetch（Route Handler経由しない）
 */
export const dictApiServer = {
  /**
   * 辞書一覧取得（ページネーション）
   */
  getPage: (params: DictQuery): Promise<DictPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    return fetchFromBackend<DictPageResult>(`dicts?${searchParams.toString()}`);
  },
};
