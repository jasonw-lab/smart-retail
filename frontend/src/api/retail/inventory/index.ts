import request from "@/utils/request";

const BASE_URL = "/api/v1/retail/inventory";

export interface Inventory {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  stock: number;
  expiryDate: string;
  status: "low" | "normal" | "high";
}

export interface InventoryQueryParams {
  page: number;
  pageSize: number;
  storeId?: number;
  productName?: string;
  stockStatus?: "low" | "normal" | "high";
}

export interface InventoryListResponse {
  list: Inventory[];
  total: number;
}

export interface RestockParams {
  id: number;
  amount: number;
  expiryDate: string;
}

export interface HistoryItem {
  id: number;
  type: string;
  quantity: number;
  date: string;
  reason: string;
  operator: string;
}

export interface HistoryResponse {
  list: HistoryItem[];
  total: number;
}

export const InventoryAPI = {
  getList: (params: InventoryQueryParams) => {
    return request.get<InventoryListResponse>(`${BASE_URL}/list`, { params });
  },

  restock: (params: RestockParams) => {
    return request.post(`${BASE_URL}/restock`, params);
  },

  getHistory: (id: number) => {
    return request.get<HistoryResponse>(`${BASE_URL}/history/${id}`);
  },
}; 