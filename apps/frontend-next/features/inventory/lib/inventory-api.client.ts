import { fetchApi } from '@/lib/api/client';
import type {
  Inventory,
  InventoryQuery,
  InventoryPageResult,
  ReplenishDto,
  DisposeDto,
  StockHistory,
} from '../types/inventory';

const BASE_URL = '/api/proxy/api/v1/retail/inventories';
const TXN_URL = '/api/proxy/api/v1/retail/inventory-transactions';

export const inventoryApiClient = {
  /**
   * 在庫一覧取得(ページング)
   */
  async getPage(params: InventoryQuery): Promise<InventoryPageResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    if (params.productName) searchParams.set('productName', params.productName);
    if (params.status) searchParams.set('status', params.status);

    return fetchApi<InventoryPageResult>(`${BASE_URL}?${searchParams.toString()}`);
  },

  /**
   * 在庫詳細取得(ロット含む)
   */
  async getById(id: number): Promise<Inventory> {
    return fetchApi<Inventory>(`${BASE_URL}/${id}`);
  },

  /**
   * 補充記録 (入庫)
   * Backend: POST /api/v1/retail/inventory-transactions/inbound
   */
  async replenish(data: ReplenishDto): Promise<void> {
    const form = {
      storeId: data.storeId,
      productId: data.productId,
      lotNumber: data.lotNumber || `LOT-${Date.now()}`,
      txnType: 'INBOUND',
      quantityDelta: data.quantity,
      sourceType: 'MANUAL',
      referenceNo: data.note || undefined,
    };
    return fetchApi<void>(`${TXN_URL}/inbound`, {
      method: 'POST',
      body: form,
    });
  },

  /**
   * 廃棄記録 (出庫)
   * Backend: POST /api/v1/retail/inventory-transactions/outbound
   */
  async dispose(data: DisposeDto): Promise<void> {
    const form = {
      lotId: data.lotId,
      txnType: 'DISPOSAL',
      quantityDelta: -data.quantity, // negative for outbound
      sourceType: 'MANUAL',
      referenceNo: `${data.reason}: ${data.note || ''}`,
    };
    return fetchApi<void>(`${TXN_URL}/outbound`, {
      method: 'POST',
      body: form,
    });
  },

  /**
   * 在庫履歴取得
   * Backend: GET /api/v1/retail/inventory-transactions/page with filters
   */
  async getHistory(storeId: number, productId: number): Promise<StockHistory[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('storeId', String(storeId));
    searchParams.set('productId', String(productId));
    searchParams.set('pageNum', '1');
    searchParams.set('pageSize', '50');

    const result = await fetchApi<{ list: StockHistory[] }>(
      `${TXN_URL}/page?${searchParams.toString()}`
    );
    return result.list || [];
  },
};
