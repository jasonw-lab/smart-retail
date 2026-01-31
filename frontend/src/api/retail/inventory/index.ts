import request from "@/utils/request";

const INVENTORY_BASE_URL = "/api/v1/retail/inventories";
const INV_TXN_BASE_URL = "/api/v1/retail/inventory-transactions";

export interface Inventory {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  productCode: string;
  lotNumber: string;
  quantity: number;
  expiryDate: string;
  status: "low" | "normal" | "high" | "expired";
}

export interface InventoryQueryParams {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  lotNumber?: string;
  status?: "low" | "normal" | "high" | "expired";
}

export interface InventoryListResponse {
  list: Inventory[];
  total: number;
}

export interface RestockParams {
  storeId: number;
  productId: number;
  lotNumber: string;
  quantity: number;
  expiryDate: string;
  remarks?: string;
}

export interface HistoryItem {
  id: number;
  transactionType: string;
  quantity: number;
  lotNumber: string;
  transactionDate: string;
  operator?: string;
  remarks?: string;
}

export interface HistoryResponse {
  list: HistoryItem[];
  total: number;
}

export const InventoryAPI = {
  getList: (params: InventoryQueryParams) => {
    return request<any, InventoryListResponse>({
      url: `${INVENTORY_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  restock: (params: RestockParams) => {
    return request({
      url: `${INV_TXN_BASE_URL}/inbound`,
      method: "post",
      data: {
        storeId: params.storeId,
        productId: params.productId,
        lotNumber: params.lotNumber,
        quantity: params.quantity,
        transactionDate: new Date().toISOString(),
        expiryDate: params.expiryDate,
        status: "completed",
        remarks: params.remarks,
      },
    });
  },

  getHistory: (params: { pageNum: number; pageSize: number; storeId: number; productId: number }) => {
    return request<any, HistoryResponse>({
      url: `${INV_TXN_BASE_URL}/page`,
      method: "get",
      params,
    });
  },
}; 
