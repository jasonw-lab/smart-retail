import request, { ApiResponse } from "@/utils/request";

const GOODS_BASE_URL = "/api/v1/retail/products";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  price: number;
  stock: number;
  expiryDate: string;
  description: string;
  imageUrl: string;
  sales: number;
}

export interface CreateProductDto {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  expiryDate: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  expiryDate: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductListData {
  records: Product[];
  total: number;
  size: number;
  current: number;
}

export interface ProductListParams {
  pageNum: number;
  pageSize: number;
  productName?: string;
  categoryId?: number;
}

const RetailProductAPI = {
  /** 商品一覧を取得 */
  getList(params: ProductListParams) {
    return request.get<ApiResponse<ProductListData>>(`${GOODS_BASE_URL}/page`, { params });
  },

  /** 商品を新規作成 */
  create(data: CreateProductDto) {
    return request.post<ApiResponse<boolean>>(`${GOODS_BASE_URL}`, data);
  },

  /** 商品を更新 */
  update(data: UpdateProductDto) {
    return request.put<ApiResponse<boolean>>(`${GOODS_BASE_URL}/${data.id}`, data);
  },

  /** 商品を削除 */
  delete(id: number) {
    return request.delete<ApiResponse<boolean>>(`${GOODS_BASE_URL}/${id}`);
  }
};

export default RetailProductAPI; 