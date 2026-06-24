/**
 * E2E API Mock Data and Helpers
 * @author jason.w
 */

import type { Page } from "@playwright/test";

// =============================================================================
// Mock Data Definitions
// =============================================================================

/** 店舗一覧モックデータ */
export const mockStoresPage = {
  list: [
    {
      id: 1,
      storeCode: "ST001",
      storeName: "渋谷店",
      address: "東京都渋谷区道玄坂1-1-1",
      phone: "03-1234-5678",
      manager: "田中太郎",
      status: "OPEN",
      openingHours: "09:00-22:00",
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-01-01T00:00:00",
    },
    {
      id: 2,
      storeCode: "ST002",
      storeName: "新宿店",
      address: "東京都新宿区西新宿1-1-1",
      phone: "03-2345-6789",
      manager: "山田花子",
      status: "OPEN",
      openingHours: "10:00-21:00",
      createTime: "2024-01-02T00:00:00",
      updateTime: "2024-01-02T00:00:00",
    },
  ],
  total: 2,
};

/** 決済履歴モックデータ */
export const mockSalesPage = {
  list: [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      storeId: 1,
      storeName: "渋谷店",
      totalAmount: 1500,
      paymentMethod: "CARD",
      paymentProvider: "VISA",
      saleTimestamp: "2024-05-01T10:30:00",
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      storeId: 1,
      storeName: "渋谷店",
      totalAmount: 2300,
      paymentMethod: "QR",
      paymentProvider: "PayPay",
      saleTimestamp: "2024-05-01T11:00:00",
    },
  ],
  total: 2,
};

/** 決済サマリモックデータ */
export const mockSalesSummary = {
  totalAmount: 3800,
  totalCount: 2,
  cardCount: 1,
  qrCount: 1,
  cashCount: 0,
  otherCount: 0,
  cardRatio: 50,
  qrRatio: 50,
  cashRatio: 0,
  otherRatio: 0,
};

/** デバイス一覧モックデータ */
export const mockDevicesPage = {
  list: [
    {
      id: 1,
      storeId: 1,
      storeName: "渋谷店",
      deviceCode: "DV-001",
      deviceType: "PAYMENT_TERMINAL",
      deviceName: "決済端末1号機",
      status: "ONLINE",
      lastHeartbeat: "2024-05-01T12:00:00",
      errorCode: null,
      metadata: null,
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-05-01T12:00:00",
    },
    {
      id: 2,
      storeId: 1,
      storeName: "渋谷店",
      deviceCode: "DV-002",
      deviceType: "CAMERA",
      deviceName: "監視カメラ1",
      status: "ONLINE",
      lastHeartbeat: "2024-05-01T12:00:00",
      errorCode: null,
      metadata: null,
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-05-01T12:00:00",
    },
  ],
  total: 2,
};

/** 商品一覧モックデータ */
export const mockProductsPage = {
  list: [
    {
      id: 1,
      productCode: "PRD001",
      productName: "お茶 500ml",
      barcode: "4901234567890",
      categoryId: 1,
      categoryName: "飲料",
      unitPrice: 150,
      costPrice: 100,
      unit: "本",
      shelfLifeDays: 365,
      supplierId: 1,
      supplierName: "飲料メーカーA",
      description: "緑茶ペットボトル",
      imageUrl: null,
      status: "ON_SALE",
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-01-01T00:00:00",
    },
    {
      id: 2,
      productCode: "PRD002",
      productName: "おにぎり 鮭",
      barcode: "4901234567891",
      categoryId: 2,
      categoryName: "食品",
      unitPrice: 180,
      costPrice: 120,
      unit: "個",
      shelfLifeDays: 2,
      supplierId: 2,
      supplierName: "食品メーカーB",
      description: "鮭おにぎり",
      imageUrl: null,
      status: "ON_SALE",
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-01-01T00:00:00",
    },
  ],
  total: 2,
};

/** 在庫一覧モックデータ */
export const mockInventoryPage = {
  list: [
    {
      id: 1,
      storeId: 1,
      storeName: "渋谷店",
      productId: 1,
      productName: "お茶 500ml",
      productCode: "PRD001",
      lotNumber: "LOT-2024-001",
      quantity: 50,
      minStock: 10,
      maxStock: 100,
      expiryDate: "2025-01-01",
      location: "棚A-1",
      status: "normal",
      lastCountDate: "2024-05-01",
      remarks: null,
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-05-01T00:00:00",
    },
    {
      id: 2,
      storeId: 1,
      storeName: "渋谷店",
      productId: 2,
      productName: "おにぎり 鮭",
      productCode: "PRD002",
      lotNumber: "LOT-2024-002",
      quantity: 5,
      minStock: 10,
      maxStock: 30,
      expiryDate: "2024-05-03",
      location: "棚B-1",
      status: "low",
      lastCountDate: "2024-05-01",
      remarks: "在庫少",
      createTime: "2024-01-01T00:00:00",
      updateTime: "2024-05-01T00:00:00",
    },
  ],
  total: 2,
};

/** アラート一覧モックデータ */
export const mockAlertsPage = {
  list: [
    {
      id: 1,
      storeId: 1,
      storeName: "渋谷店",
      productId: 2,
      productName: "おにぎり 鮭",
      productCode: "PRD002",
      lotNumber: "LOT-2024-002",
      alertType: "LOW_STOCK",
      priority: "P2",
      status: "NEW",
      message: "在庫が発注点を下回りました",
      thresholdValue: "10",
      currentValue: "5",
      detectedAt: "2024-05-01T10:00:00",
      createTime: "2024-05-01T10:00:00",
      updateTime: "2024-05-01T10:00:00",
    },
    {
      id: 2,
      storeId: 1,
      storeName: "渋谷店",
      productId: 2,
      productName: "おにぎり 鮭",
      productCode: "PRD002",
      lotNumber: "LOT-2024-002",
      alertType: "EXPIRY_SOON",
      priority: "P1",
      status: "ACK",
      message: "賞味期限が近づいています",
      thresholdValue: "3日",
      currentValue: "2日",
      detectedAt: "2024-05-01T09:00:00",
      createTime: "2024-05-01T09:00:00",
      updateTime: "2024-05-01T09:30:00",
    },
  ],
  total: 2,
};

/** AI優先アラートレスポンスモックデータ（LLM使用時） */
export const mockAlertAssistantLlmResponse = {
  summary:
    "本日は賞味期限が2日以内に迫した商品と、在庫が発注点を下回っている店舗が優先対応です。",
  alerts: [mockAlertsPage.list[1], mockAlertsPage.list[0]],
  llmUsed: true,
  llmModel: "gemini-2.5-flash",
  fallback: false,
};

/** AI優先アラートレスポンスモックデータ（フォールバック時） */
export const mockAlertAssistantFallbackResponse = {
  summary: "AIサービスが利用できないため、ルールベースで優先アラートを抽出しました。",
  alerts: [mockAlertsPage.list[1], mockAlertsPage.list[0]],
  llmUsed: false,
  llmModel: "",
  fallback: true,
};

/** ダッシュボードKPIモックデータ */
export const mockDashboardKpi = {
  todaySales: 125000,
  salesGrowthRate: 12.5,
  activeStoreCount: 8,
  totalStoreCount: 10,
  pendingAlertCount: 3,
  outOfStockSkuCount: 2,
};

/** ダッシュボード売上推移モックデータ */
export const mockDashboardSalesTrend = [
  { date: "2024-05-01", salesAmount: 100000, growthRate: 5.0 },
  { date: "2024-05-02", salesAmount: 110000, growthRate: 10.0 },
  { date: "2024-05-03", salesAmount: 105000, growthRate: -4.5 },
  { date: "2024-05-04", salesAmount: 115000, growthRate: 9.5 },
  { date: "2024-05-05", salesAmount: 125000, growthRate: 8.7 },
];

/** ダッシュボードアラートモックデータ */
export const mockDashboardAlerts = [
  {
    id: "1",
    createTime: "2024-05-01T10:00:00",
    updateTime: "2024-05-01T10:00:00",
    storeId: "1",
    productId: "2",
    lotNumber: "LOT-2024-002",
    alertType: "LOW_STOCK",
    alertMessage: "在庫が発注点を下回りました",
    alertDate: "2024-05-01T10:00:00",
    resolved: false,
  },
];

/** ダッシュボード在庫状況モックデータ */
export const mockDashboardInventoryStatus = [
  {
    productId: "1",
    productName: "お茶 500ml",
    productCode: "PRD001",
    storeId: "1",
    storeName: "渋谷店",
    quantity: 50,
    reorderPoint: 10,
    status: "normal",
  },
  {
    productId: "2",
    productName: "おにぎり 鮭",
    productCode: "PRD002",
    storeId: "1",
    storeName: "渋谷店",
    quantity: 5,
    reorderPoint: 10,
    status: "low",
  },
];

/** ユーザー情報モックデータ */
export const mockUserInfo = {
  userId: 1,
  username: "admin",
  nickname: "管理者",
  avatar: null,
  roles: ["ADMIN"],
  perms: ["*:*:*"],
};

/** 店舗全件リストモックデータ */
export const mockStoresList = [
  { id: 1, storeCode: "ST001", storeName: "渋谷店", status: "OPEN" },
  { id: 2, storeCode: "ST002", storeName: "新宿店", status: "OPEN" },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 標準APIレスポンス形式でラップ
 */
function wrapResponse<T>(data: T) {
  return {
    code: "00000",
    msg: "success",
    data,
  };
}

/** メニュールートモックデータ（空配列 - constantRoutesを使用） */
export const mockMenuRoutes: RouteVO[] = [];

/** RouteVO型定義 */
export interface RouteVO {
  path: string;
  component?: string;
  redirect?: string;
  name?: string;
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    roles?: string[];
    keepAlive?: boolean;
  };
  children?: RouteVO[];
}

/**
 * 認証情報をlocalStorageに設定し、ダッシュボードに移動
 * ページに移動する前に呼び出す必要がある
 */
export async function setupAuth(page: Page) {
  // ベースURLに移動（ログインにリダイレクトされるがOK）
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // localStorageを設定
  await page.evaluate(() => {
    // Vue アプリが使用する正確なキー名
    localStorage.setItem("access_token", "mock-access-token");
    localStorage.setItem("refresh_token", "mock-refresh-token");
    localStorage.setItem(
      "tenant",
      JSON.stringify({ id: "1", code: "DEFAULT", name: "Default Tenant" })
    );
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        userId: 1,
        tenantId: 1,
        username: "admin",
        roles: ["ADMIN"],
      })
    );
  });

  // ベースURLに戻ってからVueアプリを再初期化
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/**
 * 全APIルートをモック
 */
export async function setupAllApiMocks(page: Page) {
  // メニュールートAPI（認証後最初に呼ばれる）
  await page.route("**/v1/menus/routes", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockMenuRoutes)),
    });
  });

  // ユーザー情報API
  await page.route("**/v1/users/me", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockUserInfo)),
    });
  });

  // 店舗API
  await page.route("**/v1/retail/stores/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockStoresPage)),
    });
  });
  await page.route("**/v1/retail/stores", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(wrapResponse(mockStoresList)),
      });
    } else {
      route.continue();
    }
  });

  // 決済API
  await page.route("**/v1/retail/sales/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockSalesPage)),
    });
  });
  await page.route("**/v1/retail/sales/summary**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockSalesSummary)),
    });
  });

  // デバイスAPI
  await page.route("**/v1/retail/devices/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockDevicesPage)),
    });
  });

  // 商品API
  await page.route("**/v1/retail/products/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockProductsPage)),
    });
  });

  // カテゴリAPI
  await page.route("**/v1/retail/categories**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse([])),
    });
  });

  // 在庫API
  await page.route("**/v1/retail/inventory/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockInventoryPage)),
    });
  });

  // アラートAPI
  await page.route("**/v1/retail/alerts/page**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockAlertsPage)),
    });
  });

  // AI優先アラートAPI
  await page.route("**/v1/retail/ai/alerts/priority**", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(wrapResponse(mockAlertAssistantLlmResponse)),
      });
    } else {
      route.continue();
    }
  });

  // ダッシュボードAPI
  await page.route("**/v1/retail/dashboard/kpi**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockDashboardKpi)),
    });
  });
  await page.route("**/v1/retail/dashboard/sales-trend**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockDashboardSalesTrend)),
    });
  });
  await page.route("**/v1/retail/dashboard/alerts**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockDashboardAlerts)),
    });
  });
  await page.route("**/v1/retail/dashboard/inventory-status**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapResponse(mockDashboardInventoryStatus)),
    });
  });
}
