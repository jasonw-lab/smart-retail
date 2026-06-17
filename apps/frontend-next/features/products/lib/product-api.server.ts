import { fetchFromBackend } from '@/lib/api/server';
import type {
  Product,
  ProductQuery,
  ProductPageResult,
} from '../types/product';

/**
 * Server Component専用のProduct API
 * Backend直接fetch（Route Handler経由しない）
 */
export const productApiServer = {
  /**
   * 商品一覧取得（ページネーション）
   */
  getPage: (params: ProductQuery): Promise<ProductPageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.productName) {
      searchParams.set('productName', params.productName);
    }
    if (params.categoryId) {
      searchParams.set('categoryId', String(params.categoryId));
    }
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    return fetchFromBackend<ProductPageResult>(
      `retail/products/page?${searchParams.toString()}`
    );
  },

  /**
   * 商品詳細取得
   */
  getById: (id: number): Promise<Product> => {
    return fetchFromBackend<Product>(`retail/products/${id}`);
  },
};
