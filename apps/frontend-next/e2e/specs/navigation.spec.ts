import { test, expect } from '@playwright/test';

test.describe('ナビゲーション', () => {
  test('ログインページにアクセスできる', async ({ page }) => {
    const response = await page.goto('/login');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/login');
  });

  test('未認証で存在しないページにアクセスするとログインページにリダイレクト', async ({ page }) => {
    // 未認証状態では404ページではなくログインページにリダイレクトされる
    await page.goto('/nonexistent-page');

    await expect(page).toHaveURL(/\/login/);
  });

  // 注: 認証済み状態での404テストは認証フィクスチャ実装後に追加
});

test.describe('レスポンシブデザイン', () => {
  test('ログインページがモバイルで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('ログインページがデスクトップで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');

    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
