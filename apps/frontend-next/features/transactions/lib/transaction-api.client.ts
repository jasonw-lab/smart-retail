import { fetchApi } from '@/lib/api/client';
import type {
  Transaction,
  TransactionQuery,
  TransactionPageResult,
  CreateSalesDto,
} from '../types/transaction';

import { aggregateTransactions, mapTransactionItem } from './transaction-mapper';

// Backend: /api/v1/retail/sales (売上履歴)
const BASE_URL = '/api/proxy/api/v1/retail/sales';

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

export const transactionApiClient = {
  /**
   * 売上一覧取得（リスト）
   * Backend: GET /api/v1/retail/sales?storeId=
   */
  async getList(params: { storeId?: number }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    const query = searchParams.toString();
    const data = await fetchApi<unknown>(`${BASE_URL}${query ? `?${query}` : ''}`);
    const result = aggregateTransactions(data, { storeId: params.storeId, pageNum: 1, pageSize: 9999 });
    return result.list;
  },

  /**
   * 決済履歴一覧取得(ページング)
   * Note: Backend uses "sales" terminology
   */
  async getPage(params: TransactionQuery): Promise<TransactionPageResult> {
    const searchParams = buildSearchParams(params);
    const data = await fetchApi<unknown>(`${BASE_URL}?${searchParams.toString()}`);
    return aggregateTransactions(data, params);
  },

  /**
   * 決済詳細取得
   */
  async getById(id: number): Promise<Transaction> {
    const data = await fetchApi<unknown>(`${BASE_URL}/${id}`);
    return mapTransactionItem(data);
  },

  /**
   * 売上作成
   * Backend: POST /api/v1/retail/sales
   */
  async create(data: CreateSalesDto): Promise<Transaction> {
    return fetchApi<Transaction>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 決済履歴 CSV エクスポート（Backend /export エンドポイント）
   * エンドポイントが未実装の場合は呼び出し側でフロントエンド生成にフォールバックする
   */
  async exportTransactions(params: TransactionQuery): Promise<Blob> {
    const searchParams = buildSearchParams(params);
    // CSV ダウンロードは生の fetch でレスポンスボディをそのまま返す
    const response = await fetch(`${BASE_URL}/export?${searchParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    return response.blob();
  },
};
