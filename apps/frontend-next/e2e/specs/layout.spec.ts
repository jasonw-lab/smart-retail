import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

test.describe('レイアウト', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('main/header/sidebarが表示される', async ({ page }) => {
    await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_HEADER}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)).toBeVisible();
  });

  test('ヘッダーメニュートグルでサイドバーが折りたたまれる', async ({ page }) => {
    const sidebar = page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`);
    const initialClass = await sidebar.getAttribute('class');

    // 確実に展開状態から開始
    if (initialClass?.includes('w-16')) {
      await page.click(`[data-testid="${TESTIDS.HEADER_MENU_TOGGLE}"]`);
      await expect(sidebar).toHaveClass(/w-64/);
    }

    await page.click(`[data-testid="${TESTIDS.HEADER_MENU_TOGGLE}"]`);
    await expect(sidebar).toHaveClass(/w-16/);
  });

  test('言語切り替え', async ({ page }) => {
    await page.goto('/products');
    await page.click(`[data-testid="${TESTIDS.HEADER_LANGUAGE_SWITCHER}"]`);
    await page.click(`[data-testid="${TESTIDS.LANGUAGE_OPTION_EN}"]`);
    await expect(page).toHaveURL(/\/en\/products/);

    await page.click(`[data-testid="${TESTIDS.HEADER_LANGUAGE_SWITCHER}"]`);
    await page.click(`[data-testid="${TESTIDS.LANGUAGE_OPTION_JA}"]`);
    await expect(page).toHaveURL(/\/products$/);
  });

  test('フルスクリーンボタンをクリックできる', async ({ page }) => {
    await page.click(`[data-testid="${TESTIDS.HEADER_FULLSCREEN}"]`);
  });

  test('通知ベルが表示される', async ({ page }) => {
    const bell = page.locator(`[data-testid="${TESTIDS.HEADER_NOTIFICATIONS}"]`);
    await expect(bell).toBeVisible();
    await bell.click();
    await expect(bell).toBeVisible();
  });

  test('ユーザーメニューからログアウト', async ({ page }) => {
    await page.click(`[data-testid="${TESTIDS.HEADER_USER_MENU}"]`);
    await page.click(`[data-testid="${TESTIDS.HEADER_LOGOUT}"]`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('サイドバーからログアウト', async ({ page }) => {
    await page.click(`[data-testid="${TESTIDS.SIDEBAR_LOGOUT}"]`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('ネストしたページでパンくずが表示される', async ({ page }) => {
    await page.goto('/system/user');
    const breadcrumb = page.locator(`[data-testid="${TESTIDS.HEADER_BREADCRUMB}"]`);
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Users');
  });
});
