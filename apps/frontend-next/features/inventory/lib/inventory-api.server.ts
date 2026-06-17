import { fetchFromBackend } from '@/lib/api/server';
import type {
  Inventory,
  InventoryQuery,
  InventoryPageResult,
} from '../types/inventory';

/**
 * Server Component専用のInventory API
 * Backend直接fetch（Route Handler経由しない）
 */
export const inventoryApiServer = {
  /**
   * 在庫一覧取得（ページネーション）
   */
  getPage: async (params: InventoryQuery): Promise<InventoryPageResult> => {
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
      searchParams.set('status', params.status);
    }
    return fetchFromBackend<InventoryPageResult>(
      `retail/inventories?${searchParams.toString()}`
    );
  },

  /**
   * 在庫詳細取得
   */
  getById: async (id: number): Promise<Inventory> => {
    return fetchFromBackend<Inventory>(`retail/inventories/${id}`);
  },
};
