import { test, expect, type Page } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

async function selectOptionByFieldLabel(page: Page, label: string, option: string) {
  const field = page.locator('div.space-y-2', { hasText: label });
  const trigger = field.locator('[role="combobox"]').first();
  await trigger.click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(trigger).toHaveText(option);
  await page.waitForTimeout(200);
}

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
    await expect(page.getByText('大阪支店')).toBeVisible();
  });

  test('単一検索: 店舗名での絞り込みと他店舗の除外検証 (toHaveCount(0))', async ({ page }) => {
    await page.goto('/stores');
    const input = page.getByPlaceholder('店舗名を入力...');
    await input.fill('東京本店');
    await expect(input).toHaveValue('東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('東京本店')).toBeVisible();
    await expect(page.getByText('大阪支店')).toHaveCount(0);
  });

  test('除外検証: 存在しない店舗名で検索し0件空状態表示', async ({ page }) => {
    await page.goto('/stores');
    await page.getByPlaceholder('店舗名を入力...').fill('存在しない店舗999');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('店舗が見つかりません')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('東京本店')).toHaveCount(0);
    await expect(page.getByText('大阪支店')).toHaveCount(0);
  });

  test('店舗ステータス絞り込み: メンテナンス中で絞り込みと除外検証', async ({ page }) => {
    await page.goto('/stores');
    await selectOptionByFieldLabel(page, 'ステータス', 'メンテナンス中');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('仙台支店')).toBeVisible();
    await expect(page.getByText('広島支店')).toBeVisible();
    await expect(page.getByText('東京本店')).toHaveCount(0);
    await expect(page.getByText('大阪支店')).toHaveCount(0);
    await expect(page).toHaveURL(/status=MAINTENANCE/, { timeout: 10000 });
  });

  test('リセット復帰: 検索条件クリアで全件復帰しURLが初期化されること', async ({ page }) => {
    await page.goto('/stores');
    await page.getByPlaceholder('店舗名を入力...').fill('東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('東京本店')).toBeVisible();
    await expect(page.getByText('大阪支店')).toHaveCount(0);

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/stores$/, { timeout: 10000 });
    await expect(page.getByText('東京本店')).toBeVisible();
    await expect(page.getByText('大阪支店')).toBeVisible();
    await expect(page.getByPlaceholder('店舗名を入力...')).toHaveValue('');
  });

  test('ページネーション: 次ページ（?page=2）遷移と前ページ復帰', async ({ page }) => {
    await page.goto('/stores');
    await expect(page.getByText('東京本店')).toBeVisible();
    // 11件目の静岡支店は1ページ目に存在しない
    await expect(page.getByText('静岡支店')).toHaveCount(0);

    // 次のページへ遷移
    const nextBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_NEXT}"]`);
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    await expect(page).toHaveURL(/page=2/, { timeout: 10000 });
    await expect(page.getByText('静岡支店')).toBeVisible();
    await expect(page.getByText('岡山支店')).toBeVisible();
    await expect(page.getByText('東京本店')).toHaveCount(0);

    // 前のページへ復帰
    const prevBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_PREV}"]`);
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();

    await expect(page.getByText('東京本店')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('静岡支店')).toHaveCount(0);
    await expect(page).toHaveURL(/page=1/, { timeout: 10000 });
  });

  test('店舗を新規登録できる', async ({ page }) => {
    await page.goto('/stores');
    await page.click(`[data-testid="${TESTIDS.STORE_NEW_BUTTON}"]`);
    await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });
    await page.fill(`[data-testid="${TESTIDS.STORE_FORM_CODE}"]`, 'STR-999');
    await page.fill(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`, 'テスト新規店舗');
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
