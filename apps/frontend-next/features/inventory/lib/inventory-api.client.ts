import { fetchApi } from '@/lib/api/client';
import type {
  Inventory,
  InventoryQuery,
  InventoryListQuery,
  InventoryPageResult,
  InventoryPageItem,
  CreateInventoryDto,
  UpdateInventoryDto,
  ReplenishDto,
  DisposeDto,
  InventoryTransactionQuery,
  InventoryTransaction,
  InventoryTransactionForm,
  StockHistory,
} from '../types/inventory';
import {
  aggregateInventoryItems,
  mapInventoryItemToAggregate,
  mapTransactionToHistory,
} from './inventory-mapper';

const BASE_URL = '/api/proxy/api/v1/retail/inventories';
const TXN_URL = '/api/proxy/api/v1/retail/inventory-transactions';

const frontendToBackendStatus: Record<string, string> = {
  EXPIRED: 'EXPIRED',
  OUT_OF_STOCK: 'LOW_STOCK',
  EXPIRING: 'EXPIRY_SOON',
  OVERSTOCK: 'HIGH_STOCK',
  NORMAL: 'NORMAL',
};

function buildInventoryQueryParams(params: InventoryQuery): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.storeId) searchParams.set('storeId', String(params.storeId));
  if (params.productName) searchParams.set('productName', params.productName);
  if (params.status) {
    const backendStatus = frontendToBackendStatus[params.status] || params.status;
    searchParams.set('status', backendStatus);
  }
  return searchParams;
}

function buildInventoryListQueryParams(params: InventoryListQuery): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.storeId) searchParams.set('storeId', String(params.storeId));
  if (params.productId) searchParams.set('productId', String(params.productId));
  return searchParams;
}

function buildTransactionQueryParams(params: InventoryTransactionQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.storeId) searchParams.set('storeId', String(params.storeId));
  if (params.productId) searchParams.set('productId', String(params.productId));
  if (params.lotNumber) searchParams.set('lotNumber', params.lotNumber);
  if (params.txnType) searchParams.set('txnType', params.txnType);
  if (params.sourceType) searchParams.set('sourceType', params.sourceType);
  if (params.referenceNo) searchParams.set('referenceNo', params.referenceNo);
  return searchParams;
}

export const inventoryApiClient = {
  /**
   * 在庫リスト取得（ページングなし）
   * Backendはロット単位のリストを返す
   */
  getList: async (params: InventoryListQuery): Promise<InventoryPageItem[]> => {
    const searchParams = buildInventoryListQueryParams(params);
    const query = searchParams.toString();
    return fetchApi<InventoryPageItem[]>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  /**
   * 在庫一覧取得（ページング）
   * Backendはロット単位のリストを返すため、SKU単位に集約して返す
   */
  getPage: async (params: InventoryQuery): Promise<InventoryPageResult> => {
    const searchParams = buildInventoryQueryParams(params);
    const items = await fetchApi<InventoryPageItem[]>(`${BASE_URL}?${searchParams.toString()}`);
    return aggregateInventoryItems(items);
  },

  /**
   * 在庫詳細取得
   */
  getById: async (id: number): Promise<Inventory> => {
    const item = await fetchApi<InventoryPageItem>(`${BASE_URL}/${id}`);
    return mapInventoryItemToAggregate(item);
  },

  /**
   * 在庫作成
   */
  create: async (data: CreateInventoryDto): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 在庫更新
   */
  update: async (id: number, data: UpdateInventoryDto): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 在庫削除
   */
  delete: async (id: number): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 補充記録（入庫）
   * Backend: POST /api/v1/retail/inventory-transactions/inbound
   */
  replenish: async (data: ReplenishDto): Promise<void> => {
    await fetchApi<void>(`${TXN_URL}/inbound`, {
      method: 'POST',
      body: {
        inventoryId: data.inventoryId,
        storeId: data.storeId,
        productId: data.productId,
        lotNumber: data.lotNumber || `LOT-${Date.now()}`,
        txnType: 'INBOUND',
        quantityDelta: data.quantity,
        sourceType: 'MANUAL',
        note: data.note,
      },
    });
  },

  /**
   * 廃棄記録（出庫）
   * Backend: POST /api/v1/retail/inventory-transactions/outbound
   */
  dispose: async (data: DisposeDto): Promise<void> => {
    await fetchApi<void>(`${TXN_URL}/outbound`, {
      method: 'POST',
      body: {
        inventoryId: data.lotId,
        storeId: data.storeId,
        productId: data.productId,
        lotNumber: data.lotNumber,
        txnType: 'DISPOSAL',
        quantityDelta: -data.quantity,
        sourceType: 'MANUAL',
        reason: data.reason,
        note: data.note,
      },
    });
  },

  /**
   * 在庫トランザクションページ取得
   * Backend: GET /api/v1/retail/inventory-transactions/page
   */
  getTransactionsPage: async (
    params: InventoryTransactionQuery
  ): Promise<{ list: InventoryTransaction[]; total: number }> => {
    const searchParams = buildTransactionQueryParams(params);
    return fetchApi<{ list: InventoryTransaction[]; total: number }>(
      `${TXN_URL}/page?${searchParams.toString()}`
    );
  },

  /**
   * 在庫トランザクション履歴取得（StockHistory へ変換）
   */
  getTransactions: async (params: InventoryTransactionQuery): Promise<StockHistory[]> => {
    const result = await inventoryApiClient.getTransactionsPage(params);
    return (result.list || []).map(mapTransactionToHistory);
  },

  /**
   * 入庫トランザクションページ取得
   * Backend: GET /api/v1/retail/inventory-transactions/inbound/page
   */
  getInboundPage: async (
    params: InventoryTransactionQuery
  ): Promise<{ list: InventoryTransaction[]; total: number }> => {
    const searchParams = buildTransactionQueryParams(params);
    return fetchApi<{ list: InventoryTransaction[]; total: number }>(
      `${TXN_URL}/inbound/page?${searchParams.toString()}`
    );
  },

  /**
   * 出庫トランザクションページ取得
   * Backend: GET /api/v1/retail/inventory-transactions/outbound/page
   */
  getOutboundPage: async (
    params: InventoryTransactionQuery
  ): Promise<{ list: InventoryTransaction[]; total: number }> => {
    const searchParams = buildTransactionQueryParams(params);
    return fetchApi<{ list: InventoryTransaction[]; total: number }>(
      `${TXN_URL}/outbound/page?${searchParams.toString()}`
    );
  },

  /**
   * 在庫トランザクション更新
   * Backend: PUT /api/v1/retail/inventory-transactions/{id}
   */
  updateTransaction: async (id: number, data: InventoryTransactionForm): Promise<void> => {
    await fetchApi<void>(`${TXN_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
};
