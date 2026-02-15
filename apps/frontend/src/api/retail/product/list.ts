import request from "@/utils/request";

const GOODS_BASE_URL = "/api/v1/retail/products";

export interface Product {
  id: number;
  name: string;
  code: string;
  barcode?: string;
  categoryId: number;
  categoryName?: string;
  price: number;
  description: string;
  imageUrl: string;
  status?: string;

  // UI fields (not persisted by current backend ProductForm)
  stock?: number;
  expiryDate?: string;
  sales?: number;
}

// Backend `/api/v1/retail/products/page` record shape (ProductPageVO)
export interface ProductPageRecord {
  id: number;
  productCode: string;
  productName: string;
  barcode?: string;
  categoryId?: number;
  categoryName?: string;
  unitPrice?: number;
  costPrice?: number;
  unit?: string;
  shelfLifeDays?: number;
  supplierId?: number;
  supplierName?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

export interface CreateProductDto {
  name: string;
  code: string;
  barcode?: string;
  categoryId: number;
  price: number;
  description?: string;
  imageUrl?: string;
  status?: string;
}

export interface UpdateProductDto {
  name: string;
  code: string;
  barcode?: string;
  categoryId: number;
  price: number;
  description?: string;
  imageUrl?: string;
  status?: string;
}

export interface ProductListData {
  list: ProductPageRecord[];
  total: number;
}

export interface ProductListParams {
  pageNum: number;
  pageSize: number;
  productName?: string;
  categoryId?: number;
}

const RetailProductAPI = {
  /** 商品一覧を取得 */
  getPage(params: ProductListParams) {
    return request<any, ProductListData>({
      url: `${GOODS_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 商品を新規作成 */
  create(data: CreateProductDto) {
    return request({
      url: `${GOODS_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 商品を更新 */
  update(id: number, data: UpdateProductDto) {
    return request({
      url: `${GOODS_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** 商品を削除 */
  delete(id: number) {
    return request({
      url: `${GOODS_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default RetailProductAPI;
