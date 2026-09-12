import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

test.describe('商品管理CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('商品一覧が表示される', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('テスト商品1')).toBeVisible();
  });

  test('商品名で検索・リセット', async ({ page }) => {
    await page.goto('/products');
    await page.getByPlaceholder('商品名を入力...').fill('テスト商品1');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page).toHaveURL(/search=/);

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
  });

  test('新規作成フォームとバリデーション', async ({ page }) => {
    await page.goto('/products/new');
    await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
    await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 });
  });

  test('商品を新規作成できる', async ({ page }) => {
    await page.goto('/products/new');
    await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CODE}"]`, 'P004');
    await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`, '新規商品');
    await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CATEGORY}"]`, '1');
    await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_PRICE}"]`, '999');
    await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
    await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
    await expect(page.getByText('商品を作成しました')).toBeVisible({ timeout: 5000 });
  });

  test('商品を編集できる', async ({ page }) => {
    await page.goto('/products');
    await page.click(`[data-testid="${TESTIDS.PRODUCT_EDIT_BUTTON}-1"]`);
    await page.waitForURL(/\/products\/\d+\/edit$/, { timeout: 10000 });
    await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`)).toHaveValue(
      'テスト商品1'
    );
  });

  test('商品削除ダイアログを操作できる', async ({ page }) => {
    await page.goto('/products');
    await page.click(`[data-testid="${TESTIDS.PRODUCT_DELETE_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();

    await page.click(`[data-testid="${TESTIDS.PRODUCT_DELETE_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });
});
