import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

/**
 * Navigation E2E Tests
 * Tests sidebar navigation based on current sidebar structure.
 *
 * Current sidebar structure (sidebar.tsx):
 * - Dashboard → /
 * - Stores → /stores
 * - Inventory → /inventory
 * - Alerts → /alerts
 * - System (expandable):
 *   - Users → /system/user
 *   - Roles → /system/role
 *   - Menus → /system/menu
 *   - Departments → /system/dept
 *   - Dictionary → /system/dict
 *   - Logs → /system/log
 */
test.describe('サイドバーナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)).toBeVisible({
      timeout: 10000,
    });
  });

  test.describe('メインメニュー', () => {
    test('Dashboard (/) が表示されている', async ({ page }) => {
      await expect(page).toHaveURL(/\/(ja|en)?$/);
      // ダッシュボードコンテンツが表示される
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
    });

    test('Stores (/stores) にアクセスできる', async ({ page }) => {
      const storeLink = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Stores' });
      await expect(storeLink).toBeVisible({ timeout: 5000 });
      await storeLink.click();

      await expect(page).toHaveURL(/\/stores$/, { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({
        timeout: 10000,
      });
    });

    test('Inventory (/inventory) にアクセスできる', async ({ page }) => {
      const inventoryLink = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Inventory' });
      await expect(inventoryLink).toBeVisible({ timeout: 5000 });
      await inventoryLink.click();

      await expect(page).toHaveURL(/\/inventory$/, { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({
        timeout: 10000,
      });
    });

    test('Alerts (/alerts) にアクセスできる', async ({ page }) => {
      const alertsLink = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Alerts' });
      await expect(alertsLink).toBeVisible({ timeout: 5000 });
      await alertsLink.click();

      await expect(page).toHaveURL(/\/alerts$/, { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe('System (展開式メニュー)', () => {
    async function expandSystemMenu(page: import('@playwright/test').Page) {
      const systemMenuButton = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('button', { name: /System/i });
      await expect(systemMenuButton).toBeVisible({ timeout: 5000 });

      // Check if already expanded by looking for a submenu link
      const userMgmtLink = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Users' });
      const isExpanded = await userMgmtLink.isVisible().catch(() => false);

      if (!isExpanded) {
        await systemMenuButton.click();
        // Wait for submenu to be visible instead of fixed timeout
        await expect(userMgmtLink).toBeVisible({ timeout: 5000 });
      }
    }

    // ページ表示確認（mainコンテンツまたはエラーページ）
    async function expectPageLoaded(page: import('@playwright/test').Page) {
      // main要素またはエラーページのボタンが表示されること
      const mainContent = page.getByRole('main');
      const errorButton = page.getByRole('button', { name: '再試行' });
      await expect(mainContent.or(errorButton)).toBeVisible({ timeout: 10000 });
    }

    test('Users (/system/user) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Users' })
        .click();

      await expect(page).toHaveURL(/\/system\/user$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Roles (/system/role) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Roles' })
        .click();

      await expect(page).toHaveURL(/\/system\/role$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Menus (/system/menu) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Menus' })
        .click();

      await expect(page).toHaveURL(/\/system\/menu$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Departments (/system/dept) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Departments' })
        .click();

      await expect(page).toHaveURL(/\/system\/dept$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Dictionary (/system/dict) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Dictionary' })
        .click();

      await expect(page).toHaveURL(/\/system\/dict$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Logs (/system/log) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('link', { name: 'Logs' })
        .click();

      await expect(page).toHaveURL(/\/system\/log$/, { timeout: 15000 });
      await expectPageLoaded(page);
    });
  });

  test.describe('フッターセクション', () => {
    test('Logout ボタンが表示される', async ({ page }) => {
      const logoutButton = page
        .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
        .getByRole('button', { name: /Logout/i });
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
    });
  });
});

test.describe('基本ナビゲーション', () => {
  test('ログインページにアクセスできる', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('未認証でダッシュボードにアクセスするとログインにリダイレクト', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('未認証で存在しないページにアクセスするとログインにリダイレクト', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('レスポンシブデザイン', () => {
  test('ログインページがモバイルで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toBeVisible();
  });

  test('ログインページがデスクトップで表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');

    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toBeVisible();
  });
});
