import { test, expect, type Page } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

async function selectOptionByFieldLabel(page: Page, label: string, option: string) {
  const field = page.locator('div.space-y-2', { hasText: label });
  const trigger = field.locator('[role="combobox"]').first();
  await trigger.click();
  await page.getByRole('option', { name: option }).click();
}

test.describe('取引履歴', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('取引一覧とサマリーカードが表示される', async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.locator(`[data-testid="${TESTIDS.TRANSACTION_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_SALES}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_COUNT}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_PAYMENT}"]`)
    ).toBeVisible();
  });

  test('決済方法でフィルタ検索・リセット', async ({ page }) => {
    await page.goto('/transactions');
    await selectOptionByFieldLabel(page, '決済方法', '💳 カード');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/transactions$/, { timeout: 10000 });
  });

  test('詳細ダイアログを開閉', async ({ page }) => {
    await page.goto('/transactions');
    await page.click(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_BUTTON}-1"]`);
    const dialog = page.locator(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_DIALOG}"]`);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('TXN-20260529-001', { exact: true })).toBeVisible();
    await expect(dialog.getByText('¥3,500').first()).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_CLOSE}"]`);
    await expect(dialog).not.toBeVisible();
  });

  test('CSV出力ボタンをクリックしてダウンロードを開始', async ({ page }) => {
    await page.goto('/transactions');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(`[data-testid="${TESTIDS.TRANSACTION_EXPORT_BUTTON}"]`),
    ]);
    expect(download.suggestedFilename()).toMatch(/transactions-.*\.csv/);
  });
});
