import { test, expect } from '@playwright/test';
import { TESTIDS } from '../testids';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // Cookieをクリア
    await page.context().clearCookies();
  });

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');

    // 新デザイン: カードヘッダーは "Welcome Back"、ブランディングは左パネル
    await expect(page.locator('h3')).toContainText('Welcome Back');
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toContainText('Login');
  });

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

    // フォームにはデフォルト値が入っているので、クリアしてからsubmit
    await page.fill(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, '');
    await page.fill(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`, '');
    await page.fill(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`, '');
    await page.click(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`);

    // バリデーションメッセージ (next-intl)
    const requiredMessages = page.locator('text=This field is required');
    await expect(requiredMessages).toHaveCount(3, { timeout: 5000 });
  });

  test('ユーザー名のみ入力でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

    // デフォルト値をクリアしてusernameのみ入力
    await page.fill(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, 'admin');
    await page.fill(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`, '');
    await page.fill(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`, '');
    await page.click(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`);

    await expect(page.locator('text=This field is required').first()).toBeVisible({
      timeout: 5000,
    });
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
    await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

    const usernameInput = page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`);
    const passwordInput = page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`);

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

    const passwordInput = page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`);
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
