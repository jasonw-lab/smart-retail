/**
 * Debug Auth Test
 */
import { test, expect } from "@playwright/test";
import { setupAllApiMocks } from "../fixtures/api-mocks";

test("debug: manual auth setup and navigation", async ({ page }) => {
  // コンソールログを監視
  page.on("console", (msg) => {
    console.log("[Browser] " + msg.type() + ": " + msg.text());
  });

  // APIリクエストを監視
  page.on("request", (request) => {
    if (request.url().includes("/api/")) {
      console.log("[Request] " + request.method() + " " + request.url());
    }
  });

  page.on("response", (response) => {
    if (response.url().includes("/api/")) {
      console.log("[Response] " + response.status() + " " + response.url());
    }
  });

  // APIモックを設定
  await setupAllApiMocks(page);

  // ハッシュベースのURLでログインページに直接移動
  console.log("Step 1: Going to hash-based login page...");
  await page.goto("http://localhost:3000/#/login");
  await page.waitForLoadState("domcontentloaded");
  console.log("Step 1 URL:", page.url());

  // localStorageを設定
  console.log("Step 2: Setting localStorage...");
  await page.evaluate(() => {
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

  // トークンが設定されているか確認
  const token = await page.evaluate(() => localStorage.getItem("access_token"));
  console.log("Token set:", token);

  // ページをリロード（認証情報を持ってアプリを再初期化）
  console.log("Step 3: Reloading page...");
  await page.reload();
  await page.waitForLoadState("networkidle");
  console.log("Step 3 URL:", page.url());

  // 5秒待機
  await page.waitForTimeout(3000);

  // 最終URL
  console.log("Final URL:", page.url());

  // スクリーンショット
  await page.screenshot({ path: "debug-manual.png" });
});
