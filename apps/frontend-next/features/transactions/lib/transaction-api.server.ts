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

import { aggregateTransactions, mapTransactionItem } from './transaction-mapper';

/**
 * Server Component専用のTransaction/Sales API
 * Backend直接fetch（Route Handler経由しない）
 */
export const transactionApiServer = {
  /**
   * 売上一覧取得（リスト）
   */
  getList: async (params: { storeId?: number }): Promise<Transaction[]> => {
    const searchParams = new URLSearchParams();
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    const query = searchParams.toString();
    const data = await fetchFromBackend<unknown>(`retail/sales${query ? `?${query}` : ''}`);
    const result = aggregateTransactions(data, { storeId: params.storeId, pageNum: 1, pageSize: 9999 });
    return result.list;
  },

  /**
   * 決済履歴一覧取得（ページング）
   */
  getPage: async (params: TransactionQuery): Promise<TransactionPageResult> => {
    const searchParams = buildSearchParams(params);
    const data = await fetchFromBackend<unknown>(`retail/sales?${searchParams.toString()}`);
    return aggregateTransactions(data, params);
  },

  /**
   * 決済詳細取得
   */
  getById: async (id: number): Promise<Transaction> => {
    const data = await fetchFromBackend<unknown>(`retail/sales/${id}`);
    return mapTransactionItem(data);
  },
};
