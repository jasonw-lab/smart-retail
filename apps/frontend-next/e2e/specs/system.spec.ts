import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

/**
 * System Management E2E Tests
 * Tests for system management pages with backend API connection
 *
 * Pages:
 * - User Management → /system/user
 * - Role Management → /system/role
 * - Menu Management → /system/menu
 * - Dept Management → /system/dept
 * - Dict Management → /system/dict
 * - System Log → /system/log
 */

test.describe('System Management - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ユーザー一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('User Management', { timeout: 15000 });
  });

  test('ユーザー一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

    // テーブルヘッダーが存在する
    await expect(page.locator('th').first()).toBeVisible({ timeout: 5000 });
  });

  test('ユーザー検索ボタンが機能する', async ({ page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('domcontentloaded');

    // 検索ボタンが表示される
    const searchButton = page.getByRole('button', { name: /Search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });

    // 検索ボタンをクリック
    await searchButton.click();

    // テーブルが引き続き表示される（検索結果）
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('Add Userボタンが表示される', async ({ page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('domcontentloaded');

    // Add Userボタンが表示される
    const addButton = page.getByRole('button', { name: /Add User/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('部門ツリーが表示される', async ({ page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('domcontentloaded');

    // サイドバーのカードが表示される
    await expect(page.locator('aside, [class*="Card"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('System Management - Role Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ロール一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/role');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('Role Management', { timeout: 15000 });
  });

  test('ロール一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/role');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('ロール検索機能が表示される', async ({ page }) => {
    await page.goto('/system/role');
    await page.waitForLoadState('domcontentloaded');

    // 検索関連の要素が表示される
    const searchButton = page.getByRole('button', { name: /Search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });
});

test.describe('System Management - Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('メニュー一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/menu');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('Menu Management', { timeout: 15000 });
  });

  test('メニュー一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/menu');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('System Management - Department Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('部門一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/dept');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('Department Management', { timeout: 15000 });
  });

  test('部門一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/dept');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('部門追加ボタンが表示される', async ({ page }) => {
    await page.goto('/system/dept');
    await page.waitForLoadState('domcontentloaded');

    // Add Department ボタンが表示される
    const addButton = page.getByRole('button', { name: /Add Department|Add/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });
});

test.describe('System Management - Dictionary Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('辞書一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/dict');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('Dictionary Management', { timeout: 15000 });
  });

  test('辞書一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/dict');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('辞書検索機能が表示される', async ({ page }) => {
    await page.goto('/system/dict');
    await page.waitForLoadState('domcontentloaded');

    // 検索ボタンが表示される
    const searchButton = page.getByRole('button', { name: /Search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });
});

test.describe('System Management - System Log', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ログ一覧ページにアクセスできる', async ({ page }) => {
    await page.goto('/system/log');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示される
    await expect(page.getByRole('main').locator('h1')).toContainText('System Log', { timeout: 15000 });
  });

  test('ログ一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/system/log');
    await page.waitForLoadState('domcontentloaded');

    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('ログ検索機能が表示される', async ({ page }) => {
    await page.goto('/system/log');
    await page.waitForLoadState('domcontentloaded');

    // 検索ボタンが表示される
    const searchButton = page.getByRole('button', { name: /Search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });

  test('日付フィルターが表示される', async ({ page }) => {
    await page.goto('/system/log');
    await page.waitForLoadState('domcontentloaded');

    // 日付入力フィールドが存在する
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible({ timeout: 10000 });
  });
});

test.describe('System Management - Backend API Connection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ユーザー一覧APIが呼び出される', async ({ page }) => {
    // APIレスポンスを監視
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/users') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/user');

    // APIが呼ばれることを確認
    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });

  test('ロール一覧APIが呼び出される', async ({ page }) => {
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/roles') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/role');

    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });

  test('部門一覧APIが呼び出される', async ({ page }) => {
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/depts') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/dept');

    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });

  test('メニュー一覧APIが呼び出される', async ({ page }) => {
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/menus') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/menu');

    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });

  test('辞書一覧APIが呼び出される', async ({ page }) => {
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/dicts') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/dict');

    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });

  test('ログ一覧APIが呼び出される', async ({ page }) => {
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/logs') && response.request().method() === 'GET',
      { timeout: 30000 }
    );

    await page.goto('/system/log');

    const response = await apiPromise;
    expect(response.status()).toBe(200);
  });
});
