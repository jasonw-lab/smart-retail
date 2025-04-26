export interface RestockListParams {
  page: number;
  pageSize: number;
  productName?: string;
  storeId?: number;
  stockStatus?: string;
  lotNumber?: string;
  restockType?: string;
}

export interface RestockItem {
  id: number;
  productId: number;
  productName: string;
  storeId: number;
  storeName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  suggestedRestockAmount: number;
  lastRestockDate: string;
  status: string;
}

export interface RestockListResponse {
  items: RestockItem[];
  total: number;
}