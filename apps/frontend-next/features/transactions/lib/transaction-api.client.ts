import { fetchApi } from '@/lib/api/client';
import type {
  Transaction,
  TransactionQuery,
  TransactionPageResult,
} from '../types/transaction';

// Backend: /api/v1/retail/sales (売上履歴)
const BASE_URL = '/api/proxy/api/v1/retail/sales';

export const transactionApiClient = {
  /**
   * 決済履歴一覧取得(ページング)
   * Note: Backend uses "sales" terminology
   */
  async getPage(params: TransactionQuery): Promise<TransactionPageResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    // Map frontend params to backend params as needed
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    return fetchApi<TransactionPageResult>(
      `${BASE_URL}?${searchParams.toString()}`
    );
  },

  /**
   * 決済詳細取得
   */
  async getById(id: number): Promise<Transaction> {
    return fetchApi<Transaction>(`${BASE_URL}/${id}`);
  },
};
