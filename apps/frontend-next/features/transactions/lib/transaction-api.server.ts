import { fetchFromBackend } from '@/lib/api/server';
import type { Transaction, TransactionQuery, TransactionPageResult } from '../types/transaction';

function buildSearchParams(params: TransactionQuery): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.storeId) searchParams.set('storeId', String(params.storeId));
  if (params.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod);
  if (params.orderNumber) searchParams.set('orderNumber', params.orderNumber);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  return searchParams;
}

/**
 * Server Component専用のTransaction/Sales API
 * Backend直接fetch（Route Handler経由しない）
 */
export const transactionApiServer = {
  /**
   * 売上一覧取得（リスト）
   */
  getList: (params: { storeId?: number }): Promise<Transaction[]> => {
    const searchParams = new URLSearchParams();
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    const query = searchParams.toString();
    return fetchFromBackend<Transaction[]>(`retail/sales${query ? `?${query}` : ''}`);
  },

  /**
   * 決済履歴一覧取得（ページング）
   */
  getPage: (params: TransactionQuery): Promise<TransactionPageResult> => {
    const searchParams = buildSearchParams(params);
    return fetchFromBackend<TransactionPageResult>(`retail/sales?${searchParams.toString()}`);
  },

  /**
   * 決済詳細取得
   */
  getById: (id: number): Promise<Transaction> => {
    return fetchFromBackend<Transaction>(`retail/sales/${id}`);
  },
};
