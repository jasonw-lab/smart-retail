import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('商品管理UI構造', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('商品一覧ページの構造確認', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルまたはエラー境界が表示される
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 15000 });

    // h1タイトルが表示される
    await expect(mainContent.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('商品一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 15000 });

    // テーブルが表示される（データ読み込み完了後）
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('商品新規作成ページの構造確認', async ({ page }) => {
    await page.goto('/products/new');
    await page.waitForLoadState('domcontentloaded');

    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 15000 });

    // ページタイトル
    await expect(mainContent.locator('h1')).toBeVisible({ timeout: 10000 });

    // フォームが存在する
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    // 送信ボタンが存在する
    await expect(page.locator('button[type="submit"]')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('商品フォームバリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('必須フィールドのバリデーション', async ({ page }) => {
    await page.goto('/products/new');
    await page.waitForLoadState('domcontentloaded');

    // フォームが表示されるまで待機
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    // 空のままsubmit
    await page.click('button[type="submit"]');

    // バリデーションエラーが表示される（エラー要素の存在確認）
    // 具体的なテキストではなく、エラー表示の存在を確認
    await expect(
      page
        .locator(
          '[class*="error"], [class*="Error"], .text-error, .text-destructive'
        )
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});
