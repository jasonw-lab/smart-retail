import { fetchFromBackend } from '@/lib/api/server';
import type {
  Transaction,
  TransactionQuery,
  TransactionPageResult,
} from '../types/transaction';

/**
 * Server Component専用のTransaction API
 * Backend直接fetch（Route Handler経由しない）
 * Note: Backend uses "sales" terminology
 */
export const transactionApiServer = {
  /**
   * 決済履歴一覧取得（ページネーション）
   */
  getPage: async (params: TransactionQuery): Promise<TransactionPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.storeId) {
      searchParams.set('storeId', String(params.storeId));
    }
    if (params.startDate) {
      searchParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      searchParams.set('endDate', params.endDate);
    }
    return fetchFromBackend<TransactionPageResult>(
      `retail/sales?${searchParams.toString()}`
    );
  },

  /**
   * 決済詳細取得
   */
  getById: async (id: number): Promise<Transaction> => {
    return fetchFromBackend<Transaction>(`retail/sales/${id}`);
  },
};
