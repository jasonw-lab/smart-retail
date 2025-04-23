import request from "@/utils/request";

const GOODS_BASE_URL = "/api/v1/retail/product";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  sales: number;
  imageUrl: string;
  description?: string;
  expiryDate: string;
}

export interface CreateProductDto {
  name: string;
  categoryId: number;
  price: number;
  expiryDays: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number;
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

  /** 商品を新規作成 */
  create(data: CreateProductDto) {
    return request<any, Product>({
      url: GOODS_BASE_URL,
      method: "post",
      data,
    });
  },

  /** 商品を更新 */
  update(data: UpdateProductDto) {
    return request<any, Product>({
      url: `${GOODS_BASE_URL}/${data.id}`,
      method: "put",
      data,
    });
  },

  /** 商品を削除 */
  delete(id: number) {
    return request<any, null>({
      url: `${GOODS_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default RetailProductAPI; 