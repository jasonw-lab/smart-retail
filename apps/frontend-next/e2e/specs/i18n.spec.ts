import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('多言語表示 (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('商品一覧が英語で表示される', async ({ page }) => {
    await page.goto('/en/products');
    const main = page.getByRole('main');
    await expect(main).toBeVisible({ timeout: 15000 });
    await expect(main.locator('h1')).toHaveText('Products');
    await expect(page.getByRole('button', { name: 'New Product' })).toBeVisible();
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
  });

  test('店舗一覧が英語で表示される', async ({ page }) => {
    await page.goto('/en/stores');
    const main = page.getByRole('main');
    await expect(main).toBeVisible({ timeout: 15000 });
    await expect(main.locator('h1')).toHaveText('Store List');
    await expect(page.getByRole('button', { name: 'New Store' })).toBeVisible();
    await expect(page.getByPlaceholder('Search by name...')).toBeVisible();
  });
});
