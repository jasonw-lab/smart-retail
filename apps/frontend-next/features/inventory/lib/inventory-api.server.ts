import { fetchFromBackend } from '@/lib/api/server';
import type {
  Inventory,
  InventoryQuery,
  InventoryPageResult,
  InventoryPageItem,
  InventoryListQuery,
  InventoryTransactionQuery,
  InventoryTransaction,
} from '../types/inventory';
import { aggregateInventoryItems, mapInventoryItemToAggregate } from './inventory-mapper';

const frontendToBackendStatus: Record<string, string> = {
  EXPIRED: 'EXPIRED',
  OUT_OF_STOCK: 'LOW_STOCK',
  EXPIRING: 'EXPIRY_SOON',
  OVERSTOCK: 'HIGH_STOCK',
  NORMAL: 'NORMAL',
};

function buildInventoryQueryParams(params: InventoryQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.storeId) {
    searchParams.set('storeId', String(params.storeId));
  }
  if (params.productName) {
    searchParams.set('productName', params.productName);
  }
  if (params.status) {
    const backendStatus = frontendToBackendStatus[params.status] || params.status;
    searchParams.set('status', backendStatus);
  }
  return searchParams;
}

function buildInventoryListQuery(params: InventoryListQuery): string {
  const searchParams = new URLSearchParams();
  if (params.storeId) searchParams.set('storeId', String(params.storeId));
  if (params.productId) searchParams.set('productId', String(params.productId));
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function buildTransactionQuery(params: InventoryTransactionQuery): string {
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
  return `?${searchParams.toString()}`;
}

/**
 * Server Component専用のInventory API
 * Backend直接fetch（Route Handler経由しない）
 */
export const inventoryApiServer = {
  /**
   * 在庫一覧取得（ページネーション）
   * Backendはロット単位のリストを返すため、SKU単位に集約して返す
   */
  getPage: async (params: InventoryQuery): Promise<InventoryPageResult> => {
    const searchParams = buildInventoryQueryParams(params);
    const items = await fetchFromBackend<InventoryPageItem[]>(
      `retail/inventories?${searchParams.toString()}`
    );
    return aggregateInventoryItems(items);
  },

  /**
   * 在庫詳細取得
   */
  getById: async (id: number): Promise<Inventory> => {
    const item = await fetchFromBackend<InventoryPageItem>(`retail/inventories/${id}`);
    return mapInventoryItemToAggregate(item);
  },

  /**
   * 在庫リスト取得（ページングなし）
   */
  getList: (params: InventoryListQuery): Promise<InventoryPageItem[]> => {
    return fetchFromBackend<InventoryPageItem[]>(
      `retail/inventories${buildInventoryListQuery(params)}`
    );
  },

  /**
   * 在庫トランザクションページ取得
   */
  getTransactionsPage: (
    params: InventoryTransactionQuery
  ): Promise<{ list: InventoryTransaction[]; total: number }> => {
    return fetchFromBackend<{ list: InventoryTransaction[]; total: number }>(
      `retail/inventory-transactions/page${buildTransactionQuery(params)}`
    );
  },
};
