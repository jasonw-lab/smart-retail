/**
 * Real API Navigation E2E Tests
 *
 * Backend API接続でのメニュー画面遷移テスト
 *
 * @author jason.w
 */

import { test, expect, Page, APIRequestContext } from "@playwright/test";

// テストユーザー
const TEST_USER = {
  username: "admin",
  password: "123456",
};

// Backend API base URL
const API_BASE = "http://localhost:8080/api/v1";

// ログイン処理 - APIを直接呼び出してトークンを取得し、addInitScriptで設定
async function loginViaAPI(page: Page, request: APIRequestContext) {
  // キャプチャ取得
  const captchaRes = await request.get(`${API_BASE}/auth/captcha`);
  const captchaData = await captchaRes.json();
  const captchaId = captchaData.data?.captchaId;

  // ログインAPI呼び出し（captchaCodeなし - backend captcha.required=false）
  const loginRes = await request.post(`${API_BASE}/auth/login`, {
    data: {
      username: TEST_USER.username,
      password: TEST_USER.password,
      captchaId: captchaId,
    },
  });
  const loginData = await loginRes.json();

  if (loginData.code !== "00000") {
    throw new Error(`Login failed: ${loginData.msg}`);
  }

  const { accessToken, refreshToken } = loginData.data;

  // addInitScriptでページロード前にトークンを設定
  await page.addInitScript(
    ({ accessToken, refreshToken }) => {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    },
    { accessToken, refreshToken }
  );

  // ダッシュボードに移動
  await page.goto("http://localhost:3001/#/dashboard");
  await page.waitForLoadState("networkidle");

  // ダッシュボードに遷移したことを確認
  // 最大30秒待機（動的ルート生成に時間がかかる場合がある）
  await page.waitForFunction(
    () => !window.location.href.includes("/login"),
    { timeout: 30000 }
  ).catch(async () => {
    // タイムアウト時はリロードして再試行
    console.log("Redirected to login, retrying...");
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });
}

test.describe("Real API - Menu Navigation", () => {
  test.setTimeout(120000);

  test("should login and navigate to dashboard", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // ダッシュボードまたはホームが表示されていることを確認
    await page.waitForLoadState("networkidle");

    // ログインページでないことを確認
    const url = page.url();
    expect(url).not.toContain("/login");

    // app-wrapperまたはメインコンテンツ、またはサイドバーが表示されていることを確認
    const mainContent = page.locator(".app-wrapper, .app-main, .main-container, .sidebar, .el-menu");
    await expect(mainContent.first()).toBeVisible({ timeout: 20000 });
  });

  test("should navigate to store list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // 店舗一覧に移動
    await page.goto("http://localhost:3001/#/retail/store-management/store");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });

    // テーブルに行があることを確認
    const rows = page.locator(".el-table__body-wrapper .el-table__row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to product list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // 商品一覧に移動
    await page.goto("http://localhost:3001/#/retail/product-inventory/product");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });

    // テーブルに行があることを確認
    const rows = page.locator(".el-table__body-wrapper .el-table__row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to inventory list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // 在庫一覧に移動
    await page.goto("http://localhost:3001/#/retail/product-inventory/inventory");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });

    // テーブルに行があることを確認
    const rows = page.locator(".el-table__body-wrapper .el-table__row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to sales list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // 決済履歴に移動
    await page.goto("http://localhost:3001/#/retail/store-management/sales");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });
  });

  test("should navigate to device list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // デバイス一覧に移動
    await page.goto("http://localhost:3001/#/retail/store-management/device");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });
  });

  test("should navigate to alert list page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // アラート一覧に移動
    await page.goto("http://localhost:3001/#/retail/alert/list");
    await page.waitForLoadState("networkidle");

    // テーブルが表示されていることを確認
    await expect(page.locator(".el-table")).toBeVisible({ timeout: 20000 });
  });

  test("should navigate to AI alert assistant page", async ({ page, request }) => {
    await loginViaAPI(page, request);

    // AI優先アラートに移動
    await page.goto("http://localhost:3001/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    // 入力エリアとボタンが表示されていることを確認
    await expect(page.locator(".alert-assistant-container")).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: "AIに聞く" })).toBeVisible();
  });

  test("should get AI priority alerts from real backend", async ({ page, request }) => {
    await loginViaAPI(page, request);

    const aiRequest = page.waitForRequest("**/api/v1/retail/ai/alerts/priority**");

    // AI優先アラートに移動
    await page.goto("http://localhost:3001/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    // 「AIに聞く」ボタンをクリック
    await page.getByRole("button", { name: "AIに聞く" }).click();

    // API呼び出し確認（タイムアウトを長めに）
    await aiRequest;

    // 応答が返るまで待機
    await expect(page.locator(".summary-card")).toBeVisible({ timeout: 60000 });

    // 要約またはフォールバック警告のいずれかが表示されていることを確認
    await expect(
      page.locator(".summary-body, .fallback-alert").first()
    ).toBeVisible();

    // 優先アラート一覧テーブルが表示される
    await expect(page.locator(".table-card .el-table")).toBeVisible({ timeout: 20000 });
  });

  test("should navigate through all retail pages", async ({ page, request }) => {
    await loginViaAPI(page, request);

    const pages = [
      { name: "店舗一覧", url: "http://localhost:3001/#/retail/store-management/store" },
      { name: "決済履歴", url: "http://localhost:3001/#/retail/store-management/sales" },
      { name: "デバイス一覧", url: "http://localhost:3001/#/retail/store-management/device" },
      { name: "商品一覧", url: "http://localhost:3001/#/retail/product-inventory/product" },
      { name: "在庫一覧", url: "http://localhost:3001/#/retail/product-inventory/inventory" },
      { name: "アラート一覧", url: "http://localhost:3001/#/retail/alert/list" },
      { name: "AI優先アラート", url: "http://localhost:3001/#/retail/alert/assistant" },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      await page.waitForLoadState("networkidle");

      // テーブルが表示されていることを確認
      const table = page.locator(".el-table");
      await expect(table).toBeVisible({ timeout: 20000 });

      console.log(`✓ ${p.name} - OK`);
    }
  });
});
