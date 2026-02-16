import request from "@/utils/request";

const DASHBOARD_BASE_URL = "/api/v1/retail/dashboard";

const DashboardAPI = {
  /** 売上推移データを取得 */
  getSalesTrend(params?: { startDate?: string; endDate?: string }) {
    return request<any, SalesTrendItem[]>({
      url: `${DASHBOARD_BASE_URL}/sales-trend`,
      method: "get",
      params,
    }).then((data) => {
      // バックエンドのレスポンスをフロントエンドの形式に変換
      return {
        dates: data.map((item) => item.date),
        sales: data.map((item) => item.salesAmount),
        profits: data.map((item) => item.salesAmount * 0.3), // 仮の利益率30%
      };
    });
  },

  /** ダッシュボードのKPIデータを取得 */
  getDashboardData() {
    return request<any, DashboardDataVO>({
      url: `${DASHBOARD_BASE_URL}/kpi`,
      method: "get",
    });
  },

  /** 商品ランキングデータを取得 */
  getProductRanking() {
    // TODO: バックエンドAPIが実装されたら有効化
    return Promise.resolve([]);
  },

  /** 店舗データを取得 */
  getStoreData() {
    // TODO: バックエンドAPIが実装されたら有効化
    return Promise.resolve([]);
  },

  /** アラート情報を取得 */
  getAlerts(params?: { limit?: number }) {
    return request<any, AlertItem[]>({
      url: `${DASHBOARD_BASE_URL}/alerts`,
      method: "get",
      params,
    });
  },

  /** 在庫状況を取得 */
  getInventoryStatus(params?: { limit?: number }) {
    return request<any, InventoryStatusItem[]>({
      url: `${DASHBOARD_BASE_URL}/inventory-status`,
      method: "get",
      params,
    });
  },

  /** 店舗別売上を取得 */
  getStoreSales() {
    // TODO: バックエンドAPIが実装されたら有効化
    return Promise.resolve([]);
  },
};

export default DashboardAPI;

/** ダッシュボードKPIデータ（バックエンドレスポンス） */
export interface DashboardDataVO {
  /** 本日売上 */
  todaySales: number;
  /** 売上成長率 */
  salesGrowthRate: number;
  /** 稼働店舗数 */
  activeStoreCount: number;
  /** 総店舗数 */
  totalStoreCount: number;
  /** 保留中アラート数 */
  pendingAlertCount: number;
  /** 在庫切れSKU数 */
  outOfStockSkuCount: number;
}

/** 売上推移アイテム（バックエンドレスポンス） */
export interface SalesTrendItem {
  /** 日付 */
  date: string;
  /** 売上金額 */
  salesAmount: number;
  /** 成長率 */
  growthRate: number;
}

/** 在庫状況アイテム（バックエンドレスポンス） */
export interface InventoryStatusItem {
  /** 商品ID */
  productId: string;
  /** 商品名 */
  productName: string;
  /** 商品コード */
  productCode: string;
  /** 店舗ID */
  storeId: string;
  /** 店舗名 */
  storeName: string;
  /** 在庫数 */
  quantity: number;
  /** 発注点 */
  reorderPoint: number;
  /** ステータス */
  status: string;
}

/** アラート情報（バックエンドレスポンス） */
export interface AlertItem {
  /** アラートID */
  id: string;
  /** 作成日時 */
  createTime: string;
  /** 更新日時 */
  updateTime: string;
  /** 店舗ID */
  storeId: string;
  /** 商品ID */
  productId: string;
  /** ロット番号 */
  lotNumber: string;
  /** アラートタイプ */
  alertType: string;
  /** アラートメッセージ */
  alertMessage: string;
  /** アラート日時 */
  alertDate: string;
  /** 解決済みフラグ */
  resolved: boolean;
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
