import request, { ApiResponse } from "@/utils/request";

const STORE_BASE_URL = "/api/v1/retail/stores";

export interface Store {
  id: number;
  storeCode: string;
  storeName: string;
  address: string;
  phone: string;
  manager: string;
  status: string;
  openingHours: string;
  createTime: string;
  updateTime: string;
}

export interface StoreForm {
  storeCode: string;
  storeName: string;
  address?: string;
  phone?: string;
  manager?: string;
  status?: string;
  openingHours?: string;
}

export interface StorePageVO {
  id: number;
  storeCode: string;
  storeName: string;
  address: string;
  phone: string;
  manager: string;
  status: string;
  openingHours: string;
  createTime: string;
  updateTime: string;
}

export interface StoreListData {
  list: StorePageVO[];
  total: number;
}

export interface StoreListParams {
  pageNum: number;
  pageSize: number;
  storeName?: string;
  status?: string;
}

const StoreAPI = {
  /** 店舗一覧を取得（ページング） */
  getPage(params: StoreListParams) {
    return request.get<any, StoreListData>(`${STORE_BASE_URL}/page`, { params });
  },

  /** 店舗一覧を取得（全件） */
  getList() {
    return request.get<ApiResponse<Store[]>>(`${STORE_BASE_URL}`);
  },

  /** 店舗詳細を取得 */
  getDetail(id: number) {
    return request.get<ApiResponse<Store>>(`${STORE_BASE_URL}/${id}`);
  },

  /** 店舗を新規作成 */
  create(data: StoreForm) {
    return request.post<ApiResponse<boolean>>(`${STORE_BASE_URL}`, data);
  },

  /** 店舗を更新 */
  update(id: number, data: StoreForm) {
    return request.put<ApiResponse<boolean>>(`${STORE_BASE_URL}/${id}`, data);
  },

  /** 店舗を削除 */
  delete(id: number) {
    return request.delete<ApiResponse<boolean>>(`${STORE_BASE_URL}/${id}`);
  }
};

export default StoreAPI;
