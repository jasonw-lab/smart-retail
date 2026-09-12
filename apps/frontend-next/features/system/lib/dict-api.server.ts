import { fetchFromBackend } from '@/lib/api/server';
import type {
  DictQuery,
  DictPageResult,
  DictOption,
  DictForm,
  DictItemQuery,
  DictItemPageResult,
  DictItemForm,
} from '../types/dict';

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
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    return fetchFromBackend<DictPageResult>(`dicts/page?${searchParams.toString()}`);
  },

  /**
   * 辞書オプション一覧取得
   */
  getOptions: (): Promise<DictOption[]> => {
    return fetchFromBackend<DictOption[]>('dicts/options');
  },

  /**
   * 辞書詳細取得
   */
  getById: (id: number): Promise<DictForm> => {
    return fetchFromBackend<DictForm>(`dicts/${id}/form`);
  },

  /**
   * 辞書フォームデータ取得
   */
  getFormData: (id: number): Promise<DictForm> => {
    return fetchFromBackend<DictForm>(`dicts/${id}/form`);
  },

  /**
   * 辞書項目一覧取得（ページネーション）
   */
  getItems: (dictCode: string, params: DictItemQuery): Promise<DictItemPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    return fetchFromBackend<DictItemPageResult>(
      `dicts/${dictCode}/items?${searchParams.toString()}`
    );
  },

  /**
   * 辞書項目フォームデータ取得
   */
  getItemFormData: (dictCode: string, itemId: number): Promise<DictItemForm> => {
    return fetchFromBackend<DictItemForm>(`dicts/${dictCode}/items/${itemId}/form`);
  },
};
