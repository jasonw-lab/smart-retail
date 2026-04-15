import request from "@/utils/request";

const INVENTORY_BASE_URL = "/api/v1/retail/inventory";

export interface Inventory {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  productCode: string;
  lotNumber: string;
  quantity: number;
  minStock?: number;
  maxStock?: number;
  expiryDate: string;
  location?: string;
  status: "low" | "normal" | "high" | "expired";
  lastCountDate?: string;
  remarks?: string;
  createTime?: string;
  updateTime?: string;
}

export interface InventoryQueryParams {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  productId?: number;
  lotNumber?: string;
  status?: "low" | "normal" | "high" | "expired";
  location?: string;
}

export interface InventoryPageResult {
  list: Inventory[];
  total: number;
}

export interface ReplenishForm {
  quantity: number;
  reason?: string;
  operator?: string;
}

export interface InventoryHistory {
  id: number;
  inventoryId: number;
  type: string;
  quantity: number;
  date: string;
  reason?: string;
  operator?: string;
  createTime?: string;
}

export const InventoryAPI = {
  /**
   * 在庫一覧取得（ページング）
   */
  getPage: (params: InventoryQueryParams) => {
    return request<any, InventoryPageResult>({
      url: `${INVENTORY_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /**
   * 在庫詳細取得
   */
  getDetail: (id: number) => {
    return request<any, Inventory>({
      url: `${INVENTORY_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 在庫補充記録
   */
  replenish: (id: number, data: ReplenishForm) => {
    return request({
      url: `${INVENTORY_BASE_URL}/${id}/replenish`,
      method: "post",
      data,
    });
  },

  /**
   * 在庫履歴取得
   */
  getHistory: (id: number) => {
    return request<any, InventoryHistory[]>({
      url: `${INVENTORY_BASE_URL}/${id}/history`,
      method: "get",
    });
  },

  /**
   * 在庫アラート検出
   */
  detectAlerts: () => {
    return request({
      url: `${INVENTORY_BASE_URL}/detect-alerts`,
      method: "post",
    });
  },
};
