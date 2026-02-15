import request from "@/utils/request";
import { OutboundItem } from "@/api/retail/inventory/out";

const INVENTORY_IN_BASE_URL = "/api/v1/retail/inventory/in";

export interface InboundItem {
  id: number;
  createTime: string;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
  restockType: string;
  status: string;
  shippingTime: string;
  operator: string;
  remarks?: string;
}

export interface CreateInboundDto {
  storeId: number;
  productId: number;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
  restockType: string;
  remarks?: string;
}

export interface UpdateInboundDto {
  id: number;
  status: string;
  shippingTime: string;
  remarks?: string;
}

export interface InboundListResponse {
  // code: string;
  // message: string;
  // data: {
  //   list: InboundItem[];
  //   total: number;
  // };

  list: OutboundItem[];
  total: number;
  page: number;
}

export interface InboundListParams {
  page: number;
  pageSize: number;
  storeId?: number;
  productName?: string;
  lotNumber?: string;
  restockType?: string;
}

const InboundInventoryAPI = {
  /** 入庫一覧を取得 */
  getList(params: InboundListParams) {
    return request<any, InboundListResponse>({
      url: `${INVENTORY_IN_BASE_URL}/list`,
      method: "get",
      params,
    });
  },

  /** 入庫を新規作成 */
  create(data: CreateInboundDto) {
    return request<any, InboundItem>({
      url: INVENTORY_IN_BASE_URL,
      method: "post",
      data,
    });
  },

  /** 入庫を更新 */
  update(data: UpdateInboundDto) {
    return request<any, InboundItem>({
      url: `${INVENTORY_IN_BASE_URL}/${data.id}`,
      method: "put",
      data,
    });
  },

  /** 入庫を削除 */
  delete(id: number) {
    return request<any, null>({
      url: `${INVENTORY_IN_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default InboundInventoryAPI;
