import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('ダッシュボードUI構造', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ダッシュボードページの構造確認', async ({ page }) => {
    // ページタイトル
    await expect(page.locator('h1')).toContainText('ダッシュボード');

    // KPIカード - use heading role to be more specific
    await expect(page.getByRole('heading', { name: '商品数' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '売上合計' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '在庫不足' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'アラート' })).toBeVisible();
  });

  test('ダッシュボード統計情報の表示', async ({ page }) => {
    // Check page loaded successfully
    await expect(page.locator('h1')).toContainText('ダッシュボード');

    // KPI cards should be visible with their titles
    await expect(page.getByRole('heading', { name: '商品数' })).toBeVisible();
  });
});

test.describe('ログインページからのナビゲーション', () => {
  test('ログインページのレイアウト', async ({ page }) => {
    await page.goto('/login');

    // カードコンテナ
    await expect(page.locator('[class*="card"]')).toBeVisible();

    // フォーム要素
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('label[for="username"]')).toContainText('ユーザー名');
    await expect(page.locator('label[for="password"]')).toContainText('パスワード');
  });
});
