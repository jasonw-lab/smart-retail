import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // Cookieをクリア
    await page.context().clearCookies();
  });

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');

    // 新デザイン: カードヘッダーは "Welcome Back"、ブランディングは左パネル
    await expect(page.locator('h3')).toContainText('Welcome Back');
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="captchaCode"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Login');
  });

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[id="username"]', { timeout: 10000 });

    // フォームにはデフォルト値が入っているので、クリアしてからsubmit
    await page.fill('input[id="username"]', '');
    await page.fill('input[id="password"]', '');
    await page.fill('input[id="captchaCode"]', '');
    await page.click('button[type="submit"]');

    // 英語バリデーションメッセージ (zod schema)
    await expect(page.locator('text=Username is required')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Password is required')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Verification code is required')).toBeVisible({ timeout: 5000 });
  });

  test('ユーザー名のみ入力でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[id="username"]', { timeout: 10000 });

    // デフォルト値をクリアしてusernameのみ入力
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', '');
    await page.fill('input[id="captchaCode"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password is required')).toBeVisible({ timeout: 5000 });
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
    await page.waitForSelector('input[id="username"]', { timeout: 10000 });

    const usernameInput = page.locator('input[id="username"]');
    const passwordInput = page.locator('input[id="password"]');

    // clear() then fill() to replace default values
    await usernameInput.clear();
    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');

    await passwordInput.clear();
    await passwordInput.fill('testpass');
    await expect(passwordInput).toHaveValue('testpass');
  });

  test('パスワードフィールドがマスクされている', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
