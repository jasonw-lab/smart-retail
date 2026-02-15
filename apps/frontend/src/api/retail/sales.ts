import request from "@/utils/request";

const SALES_BASE_URL = "/api/v1/retail/sales";

/** 決済履歴ページングVO */
export interface SalesPageVO {
  id: number;
  orderNumber: string;
  storeId: number;
  storeName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentProvider: string;
  saleTimestamp: string;
}

/** 購入商品明細 */
export interface SalesItemVO {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/** 決済詳細VO */
export interface SalesDetailVO {
  id: number;
  orderNumber: string;
  storeId: number;
  storeName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentProvider: string;
  paymentReferenceId: string;
  saleTimestamp: string;
  items: SalesItemVO[];
}

/** 決済サマリVO */
export interface SalesSummaryVO {
  totalAmount: number;
  totalCount: number;
  cardCount: number;
  qrCount: number;
  cashCount: number;
  otherCount: number;
  cardRatio: number;
  qrRatio: number;
  cashRatio: number;
  otherRatio: number;
}

/** 決済一覧レスポンス */
export interface SalesListData {
  list: SalesPageVO[];
  total: number;
}

/** 決済一覧検索パラメータ */
export interface SalesListParams {
  pageNum: number;
  pageSize: number;
  storeId?: number;
  paymentMethod?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
}

const SalesAPI = {
  /** 決済履歴一覧を取得（ページング） */
  getPage(params: SalesListParams) {
    return request<any, SalesListData>({
      url: `${SALES_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 決済詳細を取得 */
  getDetail(id: number) {
    return request<any, SalesDetailVO>({
      url: `${SALES_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 決済サマリを取得 */
  getSummary(params?: Omit<SalesListParams, "pageNum" | "pageSize">) {
    return request<any, SalesSummaryVO>({
      url: `${SALES_BASE_URL}/summary`,
      method: "get",
      params,
    });
  },
};

export default SalesAPI;
