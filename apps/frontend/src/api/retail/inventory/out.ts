import request from "@/utils/request";

const INVENTORY_OUT_BASE_URL = "/api/v1/retail/inventory/out";

export interface OutboundItem {
  id: number;
  createTime: string;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
  outboundType: "通常出庫" | "返品出庫" | "調整出庫";
  status: "処理中" | "完了";
  shippingTime: string;
  operator: string;
  remarks?: string;
}

export interface CreateOutboundDto {
  storeId: number;
  productId: number;
  quantity: number;
  lotNumber: string;
  shippingType: string;
  remarks?: string;
}

export interface UpdateOutboundDto {
  id: number;
  status: string;
  shippingTime: string;
  remarks?: string;
}

export interface OutboundListResponse {
  list: OutboundItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OutboundListParams {
  page: number;
  pageSize: number;
  storeId?: number;
  productName?: string;
  lotNumber?: string;
  shippingType?: string;
}

const OutboundInventoryAPI = {
  /** 出庫一覧を取得 */
  getList(params: OutboundListParams) {
    return request<any, OutboundListResponse>({
      url: `${INVENTORY_OUT_BASE_URL}/list`,
      method: "get",
      params,
    });
  },

  /** 出庫を新規作成 */
  create(data: CreateOutboundDto) {
    return request<any, OutboundItem>({
      url: INVENTORY_OUT_BASE_URL,
      method: "post",
      data,
    });
  },

  /** 出庫を更新 */
  update(data: UpdateOutboundDto) {
    return request<any, OutboundItem>({
      url: `${INVENTORY_OUT_BASE_URL}/${data.id}`,
      method: "put",
      data,
    });
  },

  /** 出庫を削除 */
  delete(id: number) {
    return request<any, null>({
      url: `${INVENTORY_OUT_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default OutboundInventoryAPI; 