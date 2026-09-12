import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('ダッシュボードUI構造', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ダッシュボードページが表示される', async ({ page }) => {
    await expect(page).toHaveURL(/\/(ja|en)?$/);
    // メインコンテンツエリアが表示される
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
  });

  test('ダッシュボードの VRT', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-01T10:00:00+09:00'));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('KPIカードが表示される', async ({ page }) => {
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // KPIカードはCardTitleとして h3 を持つ
    // 少なくとも1つのh3要素（カードタイトル）が存在すること
    await expect(mainContent.locator('h3').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('ダッシュボード統計情報の表示', async ({ page }) => {
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // ページ内にコンテンツが読み込まれている
    await page.waitForLoadState('domcontentloaded');
  });
});
