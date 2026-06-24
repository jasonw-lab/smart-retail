/**
 * AI優先アラート画面 E2E Tests
 *
 * モックAPIを使ったAI優先アラート画面の表示・入力・API連携・ナビゲーション確認
 *
 * @author jason.w
 */

import { test, expect } from "@playwright/test";
import {
  setupAuth,
  setupAllApiMocks,
  mockAlertAssistantLlmResponse,
  mockAlertAssistantFallbackResponse,
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
// Page Load & Input Tests
// =============================================================================

test.describe("Alert Assistant Page (AA-01)", () => {
  test("should display input area with default question and ask button", async ({
    page,
  }) => {
    await page.goto("/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    // テキストエリアにデフォルト質問が表示されていること
    const textarea = page.locator(".alert-assistant-container textarea");
    await expect(textarea).toHaveValue("今日対応すべき優先アラートは？");

    // 「AIに聞く」ボタンが表示されていること
    await expect(page.getByRole("button", { name: "AIに聞く" })).toBeVisible();
  });

  test("should display AI response summary and priority alert table after asking", async ({
    page,
  }) => {
    const aiRequest = page.waitForRequest("**/api/v1/retail/ai/alerts/priority**");

    await page.goto("/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    // 「AIに聞く」ボタンをクリック
    await page.getByRole("button", { name: "AIに聞く" }).click();

    // API呼び出し確認
    await aiRequest;

    // 要約カードが表示される
    await expect(page.locator(".summary-card")).toBeVisible();
    await expect(
      page.getByText(mockAlertAssistantLlmResponse.summary)
    ).toBeVisible();

    // LLMモデルタグが表示される
    await expect(
      page.getByText(mockAlertAssistantLlmResponse.llmModel)
    ).toBeVisible();

    // 優先アラート一覧テーブルが表示される
    await expect(page.locator(".table-card")).toBeVisible();
    await expect(page.locator(".table-card .el-table")).toBeVisible();

    // モックデータのアラートが表示される
    await expect(
      page.getByText(mockAlertsPage.list[0].storeName).first()
    ).toBeVisible();
    await expect(
      page.getByText(mockAlertsPage.list[0].productName as string).first()
    ).toBeVisible();

    // 件数表示が正しい
    await expect(
      page.getByText(`優先アラート一覧（${mockAlertAssistantLlmResponse.alerts.length}件）`)
    ).toBeVisible();
  });

  test("should show fallback warning and rule-based tag when fallback is true", async ({
    page,
  }) => {
    // フォールバック応答を返すように上書き
    await page.route("**/api/v1/retail/ai/alerts/priority**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            code: "00000",
            msg: "success",
            data: mockAlertAssistantFallbackResponse,
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "AIに聞く" }).click();

    // ルールベースタグが表示される
    await expect(page.getByText("ルールベース", { exact: true })).toBeVisible();

    // フォールバック警告タグが表示される
    await expect(page.getByText("フォールバック", { exact: true })).toBeVisible();

    // 警告アラートが表示される
    await expect(
      page.getByText("AIサービスが利用できないため、ルールベースで結果を表示しています。")
    ).toBeVisible();

    // 要約が表示される
    await expect(
      page.getByText(mockAlertAssistantFallbackResponse.summary)
    ).toBeVisible();

    // テーブルも表示される
    await expect(page.locator(".table-card .el-table")).toBeVisible();
  });

  test("should not call API when question is modified from default", async ({
    page,
  }) => {
    let requestCount = 0;
    await page.route("**/api/v1/retail/ai/alerts/priority**", (route) => {
      requestCount++;
      route.continue();
    });

    await page.goto("/#/retail/alert/assistant");
    await page.waitForLoadState("networkidle");

    const textarea = page.locator(".alert-assistant-container textarea");
    await textarea.fill("別の質問");

    await page.getByRole("button", { name: "AIに聞く" }).click();

    // エラーメッセージが表示されるまで少し待機
    await page.waitForTimeout(500);

    // APIは呼ばれないこと
    expect(requestCount).toBe(0);

    // 結果セクションが表示されていないこと
    await expect(page.locator(".summary-card")).not.toBeVisible();
    await expect(page.locator(".table-card")).not.toBeVisible();
  });
});

// =============================================================================
// Navigation Tests
// =============================================================================

test.describe("Alert Assistant Navigation", () => {
  test("should navigate from sidebar menu", async ({ page }) => {
    await page.goto("/#/dashboard");
    await page.waitForLoadState("networkidle");

    // サイドメニューからアラート > AI優先アラートに移動
    await page.getByText("アラート").first().click();
    await page.getByText("AI優先アラート").click();

    // URLが正しいことを確認
    await expect(page).toHaveURL(/.*alert\/assistant/);

    // 画面が表示されていることを確認
    await expect(page.locator(".alert-assistant-container")).toBeVisible();
  });
});
