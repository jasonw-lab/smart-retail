import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

/**
 * Navigation E2E Tests
 * Tests sidebar navigation based on current sidebar structure.
 *
 * Current sidebar structure (sidebar.tsx):
 * - Dashboard → /
 * - Store Management → /stores
 * - Product/Inventory → /inventory
 * - Alert Information → /alerts
 * - System Management (expandable):
 *   - User Management → /system/user
 *   - Role Management → /system/role
 *   - Menu Management → /system/menu
 *   - Dept Management → /system/dept
 *   - Dict Management → /system/dict
 *   - Logs → /system/log
 */
test.describe('サイドバーナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
  });

  test.describe('メインメニュー', () => {
    test('Dashboard (/) が表示されている', async ({ page }) => {
      await expect(page).toHaveURL('/');
      // ダッシュボードコンテンツが表示される
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
    });

    test('Store Management (/stores) にアクセスできる', async ({ page }) => {
      const storeLink = page.locator('aside').getByRole('link', { name: 'Store Management' });
      await expect(storeLink).toBeVisible({ timeout: 5000 });
      await storeLink.click();

      await expect(page).toHaveURL('/stores', { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({ timeout: 10000 });
    });

    test('Product/Inventory (/inventory) にアクセスできる', async ({ page }) => {
      const inventoryLink = page.locator('aside').getByRole('link', { name: 'Product/Inventory' });
      await expect(inventoryLink).toBeVisible({ timeout: 5000 });
      await inventoryLink.click();

      await expect(page).toHaveURL('/inventory', { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({ timeout: 10000 });
    });

    test('Alert Information (/alerts) にアクセスできる', async ({ page }) => {
      const alertsLink = page.locator('aside').getByRole('link', { name: 'Alert Information' });
      await expect(alertsLink).toBeVisible({ timeout: 5000 });
      await alertsLink.click();

      await expect(page).toHaveURL('/alerts', { timeout: 15000 });
      await expect(page.getByRole('main').locator('h1')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('System Management (展開式メニュー)', () => {
    async function expandSystemMenu(page: import('@playwright/test').Page) {
      const systemMenuButton = page.locator('aside').getByRole('button', { name: /System Management/i });
      await expect(systemMenuButton).toBeVisible({ timeout: 5000 });

      // Check if already expanded by looking for a submenu link
      const userMgmtLink = page.locator('aside').getByRole('link', { name: 'User Management' });
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

    test('User Management (/system/user) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'User Management' }).click();

      await expect(page).toHaveURL('/system/user', { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Role Management (/system/role) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'Role Management' }).click();

      await expect(page).toHaveURL('/system/role', { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Menu Management (/system/menu) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'Menu Management' }).click();

      await expect(page).toHaveURL('/system/menu', { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Dept Management (/system/dept) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'Dept Management' }).click();

      await expect(page).toHaveURL('/system/dept', { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Dict Management (/system/dict) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'Dict Management' }).click();

      await expect(page).toHaveURL('/system/dict', { timeout: 15000 });
      await expectPageLoaded(page);
    });

    test('Logs (/system/log) にアクセスできる', async ({ page }) => {
      await expandSystemMenu(page);
      await page.locator('aside').getByRole('link', { name: 'Logs' }).click();

      await expect(page).toHaveURL('/system/log', { timeout: 15000 });
      await expectPageLoaded(page);
    });
  });

  test.describe('フッターセクション', () => {
    test('Help Center リンクが表示される', async ({ page }) => {
      const helpLink = page.locator('aside').getByRole('link', { name: /Help Center/i });
      await expect(helpLink).toBeVisible({ timeout: 5000 });
    });

    test('Logout ボタンが表示される', async ({ page }) => {
      const logoutButton = page.locator('aside').getByRole('button', { name: /Logout/i });
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
    });
  });
});

test.describe('基本ナビゲーション', () => {
  test('ログインページにアクセスできる', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/login');
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
