import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // Cookieをクリア
    await page.context().clearCookies();
  });

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h3')).toContainText('SmartRetail Pro');
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('ログイン');
  });

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');

    // 空のままsubmit
    await page.click('button[type="submit"]');

    await expect(page.locator('text=ユーザー名を入力してください')).toBeVisible();
    await expect(page.locator('text=パスワードを入力してください')).toBeVisible();
  });

  test('ユーザー名のみ入力でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="username"]', 'admin');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=パスワードを入力してください')).toBeVisible();
  });

  test('未認証でダッシュボードにアクセスするとログインページにリダイレクト', async ({ page }) => {
    await page.goto('/');

    // ログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });

  test('未認証で商品ページにアクセスするとログインページにリダイレクト', async ({ page }) => {
    await page.goto('/products');

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('ログインフォーム入力', () => {
  test('フォーム入力が正しく動作する', async ({ page }) => {
    await page.goto('/login');

    const usernameInput = page.locator('input[id="username"]');
    const passwordInput = page.locator('input[id="password"]');

    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');

    await passwordInput.fill('testpass');
    await expect(passwordInput).toHaveValue('testpass');
  });

  test('パスワードフィールドがマスクされている', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
