import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

test.describe('店舗管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('店舗一覧が表示される', async ({ page }) => {
    await page.goto('/stores');
    await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('東京本店')).toBeVisible();
  });

  test('店舗名で検索・リセット', async ({ page }) => {
    await page.goto('/stores');
    await page.getByPlaceholder('店舗名を入力...').fill('東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('東京本店')).toBeVisible();

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/stores$/, { timeout: 10000 });
  });

  test('店舗を新規登録できる', async ({ page }) => {
    await page.goto('/stores');
    await page.click(`[data-testid="${TESTIDS.STORE_NEW_BUTTON}"]`);
    await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });
    await page.fill(`[data-testid="${TESTIDS.STORE_FORM_CODE}"]`, 'STR-003');
    await page.fill(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`, '名古屋支店');
    await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
    await page.waitForURL(/\/stores(?:\?.*)?$/, { timeout: 10000 });
    await expect(page.getByText('店舗を登録しました')).toBeVisible({ timeout: 5000 });
  });

  test('店舗を編集できる', async ({ page }) => {
    await page.goto('/stores');
    await page.click(`[data-testid="${TESTIDS.STORE_EDIT_BUTTON}-1"]`);
    await page.waitForURL(/\/stores\/\d+\/edit$/, { timeout: 10000 });
    await expect(page.locator(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`)).toHaveValue(
      '東京本店'
    );
  });

  test('在庫リンクで在庫ページへ遷移', async ({ page }) => {
    await page.goto('/stores');
    await page.click(`[data-testid="${TESTIDS.STORE_INVENTORY_BUTTON}-1"]`);
    await page.waitForURL(/\/inventory\?storeId=1/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/inventory\?storeId=1/);
  });

  test('店舗削除ダイアログをキャンセル', async ({ page }) => {
    await page.goto('/stores');
    await page.click(`[data-testid="${TESTIDS.STORE_DELETE_BUTTON}-2"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });
});
