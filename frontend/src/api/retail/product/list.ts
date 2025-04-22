import request from "@/utils/request";

const GOODS_BASE_URL = "/api/v1/retail/product";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  expiryDays: number;
  description?: string;
}

export interface ProductListResponse {
  list: Product[];
  total: number;
}

export interface ProductListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: number;
}

const RetailProductAPI = {
  /** 商品一覧を取得 */
  getList(params: ProductListParams) {
    return request<any, ProductListResponse>({
      url: `${GOODS_BASE_URL}/list`,
      method: "get",
      params,
    });
  },
};

export default RetailProductAPI; 