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
  /** 店舗一覧を取得（ページング） - クライアントサイドページング */
  async getPage(params: StoreListParams): Promise<StoreListData> {
    const allStores = await request<any, Store[]>({
      url: `${STORE_BASE_URL}`,
      method: "get",
    });

    // フィルタリング
    let filtered = allStores || [];
    if (params.storeName) {
      filtered = filtered.filter((s) =>
        s.storeName?.toLowerCase().includes(params.storeName!.toLowerCase())
      );
    }
    if (params.manager) {
      filtered = filtered.filter((s) =>
        s.manager?.toLowerCase().includes(params.manager!.toLowerCase())
      );
    }
    if (params.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }

    // ページング
    const total = filtered.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const list = filtered.slice(start, end) as StorePageVO[];

    return { list, total };
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
