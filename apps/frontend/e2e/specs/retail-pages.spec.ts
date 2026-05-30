/**
 * Retail Pages E2E Tests
 *
 * 全メニュー画面のナビゲーションと検索APIの動作確認
 *
 * @author jason.w
 */

import { test, expect } from "@playwright/test";
import {
  setupAuth,
  setupAllApiMocks,
  mockStoresPage,
  mockSalesPage,
  mockDevicesPage,
  mockProductsPage,
  mockInventoryPage,
  mockAlertsPage,
} from "../fixtures/api-mocks";

// =============================================================================
// Test Setup
// =============================================================================

test.beforeEach(async ({ page }) => {
  // APIモックを先に設定（page.goto前に必要）
  await setupAllApiMocks(page);
  // 認証情報を設定（ログインページに移動してlocalStorageを設定）
  await setupAuth(page);
});

// =============================================================================
// Dashboard Tests
// =============================================================================

test.describe("Dashboard (D-01)", () => {
  test("should display dashboard with KPI data", async ({ page }) => {
    // APIコールを監視
    const kpiRequest = page.waitForRequest("**/api/v1/retail/dashboard/kpi**");

    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await kpiRequest;

    // KPIカードが表示されていることを確認
    await expect(page.locator(".el-card")).toHaveCount({ minimum: 1 });
  });
});

// =============================================================================
// Store Management Tests
// =============================================================================

test.describe("Store List (S-01)", () => {
  test("should display store list with data from API", async ({ page }) => {
    // APIコールを監視
    const storeRequest = page.waitForRequest(
      "**/api/v1/retail/stores/page**"
    );

    await page.goto("/#/retail/store-management/store");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await storeRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータの店舗名が表示されていることを確認
    await expect(page.getByText(mockStoresPage.list[0].storeName)).toBeVisible();
    await expect(page.getByText(mockStoresPage.list[1].storeName)).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューから店舗管理 > 店舗一覧に移動
    await page.getByText("店舗管理").click();
    await page.getByText("店舗一覧").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*store-management\/store/);
  });
});

test.describe("Sales History (TX-01)", () => {
  test("should display sales list with data from API", async ({ page }) => {
    // APIコールを監視
    const salesRequest = page.waitForRequest("**/api/v1/retail/sales/page**");
    const summaryRequest = page.waitForRequest(
      "**/api/v1/retail/sales/summary**"
    );

    await page.goto("/#/retail/store-management/sales");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await salesRequest;
    await summaryRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータの注文番号が表示されていることを確認
    await expect(
      page.getByText(mockSalesPage.list[0].orderNumber)
    ).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューから店舗管理 > 決済履歴に移動
    await page.getByText("店舗管理").click();
    await page.getByText("決済履歴").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*store-management\/sales/);
  });
});

test.describe("Device List (DV-01)", () => {
  test("should display device list with data from API", async ({ page }) => {
    // APIコールを監視
    const deviceRequest = page.waitForRequest(
      "**/api/v1/retail/devices/page**"
    );

    await page.goto("/#/retail/store-management/device");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await deviceRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータのデバイス名が表示されていることを確認
    await expect(
      page.getByText(mockDevicesPage.list[0].deviceName)
    ).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューから店舗管理 > デバイス一覧に移動
    await page.getByText("店舗管理").click();
    await page.getByText("デバイス一覧").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*store-management\/device/);
  });
});

// =============================================================================
// Product & Inventory Tests
// =============================================================================

test.describe("Product List (P-01)", () => {
  test("should display product list with data from API", async ({ page }) => {
    // APIコールを監視
    const productRequest = page.waitForRequest(
      "**/api/v1/retail/products/page**"
    );

    await page.goto("/#/retail/product-inventory/product");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await productRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータの商品名が表示されていることを確認
    await expect(
      page.getByText(mockProductsPage.list[0].productName)
    ).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューから商品・在庫 > 商品一覧に移動
    await page.getByText("商品・在庫").click();
    await page.getByText("商品一覧").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*product-inventory\/product/);
  });
});

test.describe("Inventory List (I-01)", () => {
  test("should display inventory list with data from API", async ({ page }) => {
    // APIコールを監視
    const inventoryRequest = page.waitForRequest(
      "**/api/v1/retail/inventory/page**"
    );

    await page.goto("/#/retail/product-inventory/inventory");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await inventoryRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータのロット番号が表示されていることを確認
    await expect(
      page.getByText(mockInventoryPage.list[0].lotNumber)
    ).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューから商品・在庫 > 在庫一覧に移動
    await page.getByText("商品・在庫").click();
    await page.getByText("在庫一覧").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*product-inventory\/inventory/);
  });
});

// =============================================================================
// Alert Tests
// =============================================================================

test.describe("Alert List (A-01)", () => {
  test("should display alert list with data from API", async ({ page }) => {
    // APIコールを監視
    const alertRequest = page.waitForRequest("**/api/v1/retail/alerts/page**");

    await page.goto("/#/retail/alert/list");
    await page.waitForLoadState("networkidle");

    // API呼び出し確認
    await alertRequest;

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible();

    // モックデータのアラートメッセージが表示されていることを確認
    await expect(
      page.getByText(mockAlertsPage.list[0].message)
    ).toBeVisible();
  });

  test("should navigate from menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューからアラート > アラート一覧に移動
    await page.getByText("アラート").first().click();
    await page.getByText("アラート一覧").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*alert\/list/);
  });
});

// =============================================================================
// Cross-cutting Navigation Tests
// =============================================================================

test.describe("Menu Navigation", () => {
  test("should navigate to all retail pages from sidebar menu", async ({
    page,
  }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // 各メニュー項目をクリックして画面遷移を確認
    const menuItems = [
      { parent: "店舗管理", child: "店舗一覧", url: "store-management/store" },
      { parent: "店舗管理", child: "決済履歴", url: "store-management/sales" },
      {
        parent: "店舗管理",
        child: "デバイス一覧",
        url: "store-management/device",
      },
      {
        parent: "商品・在庫",
        child: "商品一覧",
        url: "product-inventory/product",
      },
      {
        parent: "商品・在庫",
        child: "在庫一覧",
        url: "product-inventory/inventory",
      },
      { parent: "アラート", child: "アラート一覧", url: "alert/list" },
    ];

    for (const item of menuItems) {
      // ダッシュボードに戻る
      await page.goto("/#/dashboard");
      await page.waitForLoadState("networkidle");

      // 親メニューをクリック
      await page.getByText(item.parent).first().click();

      // 子メニューをクリック
      await page.getByText(item.child).click();

      // URLを確認
      await expect(page).toHaveURL(new RegExp(`.*${item.url}`));
    }
  });
});
