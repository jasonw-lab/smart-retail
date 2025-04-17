import request from "@/utils/request";

const DASHBOARD_BASE_URL = "/api/v1/dashboard";

const DashboardAPI = {
  /** ダッシュボードの概要データを取得 */
  getDashboardData() {
    return request<any, DashboardDataVO>({
      url: `${DASHBOARD_BASE_URL}/overview`,
      method: "get",
    });
  },

  /** 商品ランキングデータを取得 */
  getProductRanking() {
    return request<any, ProductRankingItem[]>({
      url: `${DASHBOARD_BASE_URL}/product-ranking`,
      method: "get",
    });
  },

  /** 店舗データを取得 */
  getStoreData() {
    return request<any, StoreData[]>({
      url: `${DASHBOARD_BASE_URL}/store-data`,
      method: "get",
    });
  },

  /** アラート情報を取得 */
  getAlerts() {
    return request<any, AlertItem[]>({
      url: `${DASHBOARD_BASE_URL}/alerts`,
      method: "get",
    });
  },

  /** 売上推移データを取得 */
  getSalesTrend() {
    return request<any, SalesTrendData>({
      url: `${DASHBOARD_BASE_URL}/sales-trend`,
      method: "get",
    });
  },

  /** 店舗別売上を取得 */
  getStoreSales() {
    return request<any, StoreSalesData[]>({
      url: `${DASHBOARD_BASE_URL}/store-sales`,
      method: "get",
    });
  },
};

export default DashboardAPI;

/** ダッシュボード概要データ */
export interface DashboardDataVO {
  /** 総売上 */
  totalSales: number;
  /** 売上成長率 */
  salesGrowthRate: number;
  /** 在庫切れ店舗数 */
  restockStoreCount: number;
  /** 総店舗数 */
  totalStoreCount: number;
  /** 総商品数 */
  totalProductCount: number;
}

/** 商品ランキングアイテム */
export interface ProductRankingItem {
  /** 商品名 */
  name: string;
  /** 売上 */
  sales: number;
  /** 販売数 */
  count: number;
  /** 成長率 */
  growth: number;
  /** 商品画像URL */
  image: string;
}

/** 店舗データ */
export interface StoreData {
  /** 店舗名 */
  name: string;
  /** 売上 */
  sales: number;
  /** 利益 */
  profit: number;
  /** 目標売上 */
  target: number;
  /** 店舗ステータス */
  status: "open" | "closed" | "maintenance";
}

/** アラート情報 */
export interface AlertItem {
  /** アラートID */
  id: string;
  /** タイトル */
  title: string;
  /** 日付 */
  date: string;
  /** 内容 */
  content: string;
  /** アラートタイプ */
  type: "danger" | "warning" | "success" | "info" | "primary";
}

/** 売上推移データ */
export interface SalesTrendData {
  /** 日付リスト */
  dates: string[];
  /** 売上リスト */
  sales: number[];
  /** 利益リスト */
  profits: number[];
}

/** 店舗別売上データ */
export interface StoreSalesData {
  /** 店舗名 */
  name: string;
  /** 売上 */
  sales: number;
  /** 利益 */
  profit: number;
  /** 目標売上 */
  target: number;
  /** 達成率 */
  achievementRate: number;
} 
