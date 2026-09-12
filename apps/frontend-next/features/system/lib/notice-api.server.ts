import { fetchFromBackend } from '@/lib/api/server';
import type {
  NoticeQuery,
  NoticePageResult,
  NoticeForm,
  NoticeDetail,
} from '../types/notice';

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
 * Server Component専用のNotice API
 * Backend直接fetch（Route Handler経由しない）
 */
export const noticeApiServer = {
  /**
   * 通知一覧取得（ページネーション）
   */
  getPage: (params: NoticeQuery): Promise<NoticePageResult> => {
    return fetchFromBackend<NoticePageResult>(`notices?${buildQueryParams(params).toString()}`);
  },

  /**
   * 編集フォーム用データ取得
   */
  getFormData: (id: string): Promise<NoticeForm> => {
    return fetchFromBackend<NoticeForm>(`notices/${id}/form`);
  },

  /**
   * 通知詳細取得
   */
  getDetail: (id: string): Promise<NoticeDetail> => {
    return fetchFromBackend<NoticeDetail>(`notices/${id}/detail`);
  },
};
