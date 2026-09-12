import { test, expect, type Page } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

async function selectOptionByFieldLabel(page: Page, label: string, option: string) {
  const field = page.locator('div.space-y-2', { hasText: label });
  const trigger = field.locator('[role="combobox"]').first();
  await trigger.click();
  await page.getByRole('option', { name: option }).click();
}

test.describe('デバイス管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('デバイス一覧とサマリーカードが表示される', async ({ page }) => {
    await page.goto('/devices');
    await expect(page.locator(`[data-testid="${TESTIDS.DEVICE_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(`[data-testid="${TESTIDS.DEVICE_SUMMARY_TOTAL}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.DEVICE_SUMMARY_ONLINE}"]`)).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.DEVICE_SUMMARY_DISCONNECTED}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.DEVICE_SUMMARY_MAINTENANCE}"]`)
    ).toBeVisible();
  });

  test('フィルタ検索とリセット', async ({ page }) => {
    await page.goto('/devices');
    await selectOptionByFieldLabel(page, '店舗', '東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('レジ端末1')).toBeVisible();

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/devices$/, { timeout: 10000 });
  });

  test('状態でフィルタ検索', async ({ page }) => {
    await page.goto('/devices');
    await selectOptionByFieldLabel(page, '状態', 'オンライン');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('レジ端末1')).toBeVisible();
  });

  test('デバイスを新規登録できる', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_NEW_BUTTON}"]`);
    await page.waitForURL(/\/devices\/new$/, { timeout: 10000 });
    await page.fill(`[data-testid="${TESTIDS.DEVICE_FORM_NAME}"]`, '新規デバイス');
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_STORE}"]`);
    await page.getByRole('option', { name: '東京本店' }).click();
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_TYPE}"]`);
    await page.getByRole('option', { name: '決済端末' }).click();
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_STATUS}"]`);
    await page.getByRole('option', { name: 'オンライン' }).click();
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_SUBMIT}"]`);
    await page.waitForURL(/\/devices(?:\?.*)?$/, { timeout: 10000 });
    await expect(page.getByText('デバイスを登録しました')).toBeVisible({ timeout: 5000 });
  });

  test('デバイスを編集できる', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_EDIT_BUTTON}-1"]`);
    await page.waitForURL(/\/devices\/\d+\/edit$/, { timeout: 10000 });
    await expect(page.locator(`[data-testid="${TESTIDS.DEVICE_FORM_NAME}"]`)).toHaveValue(
      'レジ端末1'
    );
  });

  test('デバイス削除ダイアログをキャンセル', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_DELETE_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });
});
