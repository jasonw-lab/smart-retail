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
  /** 決済履歴一覧を取得（ページング） - クライアントサイドページング */
  async getPage(params: SalesListParams): Promise<SalesListData> {
    const allSales = await request<any, SalesPageVO[]>({
      url: `${SALES_BASE_URL}`,
      method: "get",
      params: { storeId: params.storeId },
    });

    // フィルタリング
    let filtered = allSales || [];
    if (params.paymentMethod) {
      filtered = filtered.filter((s) => s.paymentMethod === params.paymentMethod);
    }
    if (params.orderNumber) {
      filtered = filtered.filter((s) =>
        s.orderNumber?.toLowerCase().includes(params.orderNumber!.toLowerCase())
      );
    }
    filtered = filtered.filter((s) => isSaleDateInRange(s.saleTimestamp, params.startDate, params.endDate));

    // ページング
    const total = filtered.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const list = filtered.slice(start, end);

    return { list, total };
  },

  /** 決済詳細を取得 */
  getDetail(id: number) {
    return request<any, SalesDetailVO>({
      url: `${SALES_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 決済サマリを取得 - クライアントサイド計算 */
  async getSummary(params?: Omit<SalesListParams, "pageNum" | "pageSize">): Promise<SalesSummaryVO> {
    const allSales = await request<any, SalesPageVO[]>({
      url: `${SALES_BASE_URL}`,
      method: "get",
      params: { storeId: params?.storeId },
    });

    // フィルタリング
    let filtered = allSales || [];
    if (params?.paymentMethod) {
      filtered = filtered.filter((s) => s.paymentMethod === params.paymentMethod);
    }
    filtered = filtered.filter((s) => isSaleDateInRange(s.saleTimestamp, params?.startDate, params?.endDate));

    // サマリ計算
    const totalAmount = filtered.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalCount = filtered.length;
    const cardCount = filtered.filter((s) => s.paymentMethod === "CARD").length;
    const qrCount = filtered.filter((s) => s.paymentMethod === "QR").length;
    const cashCount = filtered.filter((s) => s.paymentMethod === "CASH").length;
    const otherCount = totalCount - cardCount - qrCount - cashCount;

    return {
      totalAmount,
      totalCount,
      cardCount,
      qrCount,
      cashCount,
      otherCount,
      cardRatio: totalCount > 0 ? Math.round((cardCount / totalCount) * 100) : 0,
      qrRatio: totalCount > 0 ? Math.round((qrCount / totalCount) * 100) : 0,
      cashRatio: totalCount > 0 ? Math.round((cashCount / totalCount) * 100) : 0,
      otherRatio: totalCount > 0 ? Math.round((otherCount / totalCount) * 100) : 0,
    };
  },
};

/**
 * 決済日時が検索範囲内かを判定する
 * saleTimestamp は `yyyy-MM-dd HH:mm:ss` 形式を想定
 */
const isSaleDateInRange = (
  saleTimestamp: string,
  startDate?: string,
  endDate?: string
): boolean => {
  const saleDate = saleTimestamp?.slice(0, 10);
  if (!saleDate) {
    return false;
  }
  if (startDate && saleDate < startDate) {
    return false;
  }
  if (endDate && saleDate > endDate) {
    return false;
  }
  return true;
};

export default SalesAPI;
