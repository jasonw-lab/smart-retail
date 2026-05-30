import type { PageQuery, PageResult } from '@/types/api';

/**
 * 商品エンティティ
 */
export interface Product {
  id: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName?: string;
  unitPrice: number;
  description?: string;
  imageUrl?: string;
  status: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 商品検索クエリ
 */
export interface ProductQuery extends PageQuery {
  productCode?: string;
  productName?: string;
  categoryId?: number;
  status?: number;
}

/**
 * 商品作成DTO
 */
export interface CreateProductDto {
  productCode: string;
  productName: string;
  categoryId: number;
  unitPrice: number;
  description?: string;
  imageUrl?: string;
  status?: number;
}

/**
 * 商品更新DTO
 */
export interface UpdateProductDto {
  productName?: string;
  categoryId?: number;
  unitPrice?: number;
  description?: string;
  imageUrl?: string;
  status?: number;
}

export type ProductPageResult = PageResult<Product>;
