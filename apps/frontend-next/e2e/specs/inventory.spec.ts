import { test, expect, type Page } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

async function selectOptionByFieldLabel(page: Page, label: string, option: string) {
  const field = page.locator('div.space-y-2', { hasText: label });
  const trigger = field.locator('[role="combobox"]').first();
  await trigger.click();
  await page.getByRole('option', { name: option }).click();
}

test.describe('在庫管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('在庫一覧とサマリーカードが表示される', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_SUMMARY_QUANTITY}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_SUMMARY_LOW_STOCK}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_SUMMARY_EXPIRING}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_SUMMARY_TURNOVER}"]`)
    ).toBeVisible();
  });

  test('フィルタ検索とリセット', async ({ page }) => {
    await page.goto('/inventory');
    await selectOptionByFieldLabel(page, '店舗', '東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });
  });

  test('ステータスでフィルタ検索', async ({ page }) => {
    await page.goto('/inventory');
    await selectOptionByFieldLabel(page, 'ステータス', '在庫切れ');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品2')).toBeVisible();
  });

  test('行を展開してロットが表示される', async ({ page }) => {
    await page.goto('/inventory');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_ROW_EXPAND}-1"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE_ROW}-1"]`).getByText('LOT-001')
    ).toBeVisible();
  });

  test('補充ダイアログを開いて登録', async ({ page }) => {
    await page.goto('/inventory');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_BUTTON}-1"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
    ).toBeVisible();
    await page.fill(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_QUANTITY}"]`, '10');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_SUBMIT}"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
    ).not.toBeVisible();
  });

  test('履歴ダイアログを開いて閉じる', async ({ page }) => {
    await page.goto('/inventory');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_CLOSE}"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)
    ).not.toBeVisible();
  });

  test('廃棄ダイアログを開いて登録', async ({ page }) => {
    await page.goto('/inventory');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_ROW_EXPAND}-1"]`);
    await page.click(`[data-testid="${TESTIDS.INVENTORY_DISPOSE_BUTTON}-101"]`);
    const dialog = page.locator(`[data-testid="${TESTIDS.INVENTORY_DISPOSE_DIALOG}"]`);
    await expect(dialog).toBeVisible();
    await page.fill(`[data-testid="${TESTIDS.INVENTORY_DISPOSE_QUANTITY}"]`, '10');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_DISPOSE_REASON}"]`);
    await page.getByRole('option', { name: '期限切れ' }).click();
    await expect(dialog.getByRole('combobox')).toHaveText('期限切れ');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_DISPOSE_SUBMIT}"]`);
    await expect(page.getByText('廃棄を記録しました')).toBeVisible({ timeout: 5000 });
    await expect(dialog).not.toBeVisible();
  });

  test('新規在庫登録ボタンで遷移しキャンセルで一覧へ戻る', async ({ page }) => {
    await page.goto('/inventory');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_NEW_BUTTON}"]`);
    await expect(page).toHaveURL(/\/inventory\/new/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: '新規在庫登録' })).toBeVisible();

    await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_CANCEL}"]`);
    await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });
  });

  test('新規在庫登録フォームの必須バリデーションエラー', async ({ page }) => {
    await page.goto('/inventory/new');
    await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_SUBMIT}"]`);
    await expect(page.getByText('店舗を選択してください')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('商品を選択してください')).toBeVisible();
  });

  test('CSVエクスポートボタンがクリック可能', async ({ page }) => {
    await page.goto('/inventory');
    const exportBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_EXPORT_BUTTON}"]`);
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
    await expect(exportBtn).toBeEnabled();
  });
});
