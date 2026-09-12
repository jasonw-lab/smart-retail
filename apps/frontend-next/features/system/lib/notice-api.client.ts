import { fetchApi } from '@/lib/api/client';
import type {
  NoticeQuery,
  NoticeForm,
  NoticeDetail,
  NoticePageResult,
} from '../types/notice';
import type { NoticeFormValues } from '../schemas/notice-schema';

const BASE_URL = '/api/proxy/api/v1/notices';

function buildQueryParams(params: NoticeQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.title) {
    searchParams.set('title', params.title);
  }
  if (params.publishStatus !== undefined) {
    searchParams.set('publishStatus', String(params.publishStatus));
  }
  if (params.isRead !== undefined) {
    searchParams.set('isRead', String(params.isRead));
  }
  return searchParams;
}

/**
 * Client Component専用のNotice API
 * Route Handler経由でBackendにアクセス
 */
export const noticeApiClient = {
  /**
   * 通知一覧取得（ページネーション）
   */
  getPage: async (params: NoticeQuery): Promise<NoticePageResult> => {
    return fetchApi<NoticePageResult>(`${BASE_URL}?${buildQueryParams(params).toString()}`);
  },

  /**
   * 編集フォーム用データ取得
   */
  getFormData: async (id: string): Promise<NoticeForm> => {
    return fetchApi<NoticeForm>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 通知詳細取得
   */
  getDetail: async (id: string): Promise<NoticeDetail> => {
    return fetchApi<NoticeDetail>(`${BASE_URL}/${id}/detail`);
  },

  /**
   * マイ通知一覧取得
   */
  getMyNotices: async (params: NoticeQuery): Promise<NoticePageResult> => {
    return fetchApi<NoticePageResult>(`${BASE_URL}/my?${buildQueryParams(params).toString()}`);
  },

  /**
   * 通知作成
   */
  create: async (data: NoticeFormValues): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 通知更新
   */
  update: async (id: string, data: NoticeFormValues): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 通知一括削除（複数はカンマ区切り）
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },

  /**
   * 通知発行
   */
  publish: async (id: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}/publish`, {
      method: 'PUT',
    });
  },

  /**
   * 通知撤回
   */
  revoke: async (id: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}/revoke`, {
      method: 'PUT',
    });
  },

  /**
   * 全通知既読
   */
  readAll: async (): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/read-all`, {
      method: 'PUT',
    });
  },
};
