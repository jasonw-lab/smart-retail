import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('商品管理UI構造', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('商品一覧ページの構造確認', async ({ page }) => {
    await page.goto('/products');

    // ページタイトル
    await expect(page.locator('h1')).toContainText('商品管理');

    // 検索フォーム
    await expect(page.locator('input[placeholder*="検索"]')).toBeVisible();

    // 新規作成ボタン
    await expect(page.locator('button:has-text("新規作成")')).toBeVisible();

    // テーブルヘッダー
    await expect(page.locator('th:has-text("商品コード")')).toBeVisible();
    await expect(page.locator('th:has-text("商品名")')).toBeVisible();
    await expect(page.locator('th:has-text("カテゴリ")')).toBeVisible();
    await expect(page.locator('th:has-text("単価")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
  });

  test('商品一覧にモックデータが表示される', async ({ page }) => {
    await page.goto('/products');

    // Wait for mock data to load
    await expect(page.locator('td:has-text("PRD-001")')).toBeVisible();
    await expect(page.locator('td:has-text("テスト商品1")')).toBeVisible();
  });

  test('商品新規作成ページの構造確認', async ({ page }) => {
    await page.goto('/products/new');

    // ページタイトル
    await expect(page.locator('h1')).toContainText('商品新規作成');

    // フォームフィールド
    await expect(page.locator('label:has-text("商品コード")')).toBeVisible();
    await expect(page.locator('label:has-text("商品名")')).toBeVisible();
    await expect(page.locator('label:has-text("カテゴリID")')).toBeVisible();
    await expect(page.locator('label:has-text("単価")')).toBeVisible();
    await expect(page.locator('label:has-text("説明")')).toBeVisible();

    // ボタン
    await expect(page.locator('button[type="submit"]:has-text("作成")')).toBeVisible();
    await expect(page.locator('button:has-text("キャンセル")')).toBeVisible();
  });
});

test.describe('商品フォームバリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('必須フィールドのバリデーション', async ({ page }) => {
    await page.goto('/products/new');

    // 空のままsubmit
    await page.click('button[type="submit"]');

    // エラーメッセージ
    await expect(page.locator('text=商品コードは必須です')).toBeVisible();
    await expect(page.locator('text=商品名は必須です')).toBeVisible();
  });
});
