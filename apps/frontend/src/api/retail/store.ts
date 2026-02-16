import request from "@/utils/request";

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
  manager?: string;
  status?: string;
}

const StoreAPI = {
  /** 店舗一覧を取得（ページング） */
  getPage(params: StoreListParams) {
    return request<any, StoreListData>({
      url: `${STORE_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 店舗一覧を取得（全件） */
  getList() {
    return request<any, Store[]>({
      url: `${STORE_BASE_URL}`,
      method: "get",
    });
  },

  /** 店舗詳細を取得 */
  getDetail(id: number) {
    return request<any, Store>({
      url: `${STORE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 店舗を新規作成 */
  create(data: StoreForm) {
    return request({
      url: `${STORE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 店舗を更新 */
  update(id: number, data: StoreForm) {
    return request({
      url: `${STORE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** 店舗を削除 */
  delete(id: number) {
    return request({
      url: `${STORE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default StoreAPI;
