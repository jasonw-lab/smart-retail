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

  test('単一検索: デバイス名での絞り込みと他デバイスの除外検証 (toHaveCount(0))', async ({
    page,
  }) => {
    await page.goto('/devices');
    const input = page.getByPlaceholder('キーワードを入力...');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('レジ端末1');
    await expect(input).toHaveValue('レジ端末1');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('レジ端末1')).toBeVisible();
    await expect(page.getByText('プリンター1')).toHaveCount(0);
  });

  test('除外検証: 存在しないデバイス名で検索し0件空状態表示', async ({ page }) => {
    await page.goto('/devices');
    const input = page.getByPlaceholder('キーワードを入力...');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('存在しない端末999');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('デバイスが見つかりません')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('レジ端末1')).toHaveCount(0);
    await expect(page.getByText('プリンター1')).toHaveCount(0);
  });

  test('デバイス種別絞り込み: プリンターで絞り込みと除外検証', async ({ page }) => {
    await page.goto('/devices');
    await selectOptionByFieldLabel(page, 'デバイス種別', 'プリンター');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('プリンター1')).toBeVisible();
    await expect(page.getByText('プリンター2')).toBeVisible();
    await expect(page.getByText('レジ端末1')).toHaveCount(0);
    await expect(page).toHaveURL(/type=PRINTER/, { timeout: 10000 });
  });

  test('ステータス絞り込み: オフラインで絞り込みと除外検証', async ({ page }) => {
    await page.goto('/devices');
    await selectOptionByFieldLabel(page, '状態', 'オフライン');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('ルーター1')).toBeVisible();
    await expect(page.getByText('レジ端末2')).toBeVisible();
    await expect(page.getByText('レジ端末1')).toHaveCount(0);
    await expect(page).toHaveURL(/status=OFFLINE/, { timeout: 10000 });
  });

  test('リセット復帰: 検索条件クリアで全件復帰しURLが初期化されること', async ({ page }) => {
    await page.goto('/devices');
    await selectOptionByFieldLabel(page, '店舗', '東京本店');
    await page.getByPlaceholder('キーワードを入力...').fill('レジ端末1');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('レジ端末1')).toBeVisible();
    await expect(page.getByText('プリンター1')).toHaveCount(0);

    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/devices$/, { timeout: 10000 });
    await expect(page.getByText('レジ端末1')).toBeVisible();
    await expect(page.getByText('プリンター1')).toBeVisible();
    await expect(page.getByPlaceholder('キーワードを入力...')).toHaveValue('');
  });

  test('ページネーション: 次ページ（?page=2）遷移', async ({ page }) => {
    await page.goto('/devices');
    await expect(page.getByText('レジ端末1')).toBeVisible();
    // 11件目の温度センサー2は1ページ目に存在しない
    await expect(page.getByText('温度センサー2')).toHaveCount(0);

    // 次のページへ遷移
    const nextBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_NEXT}"]`);
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    await expect(page).toHaveURL(/page=2/, { timeout: 10000 });
    await expect(page.getByText('温度センサー2')).toBeVisible();
    await expect(page.getByText('レジ端末3')).toBeVisible();
    await expect(page.getByText('レジ端末1')).toHaveCount(0);
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

  test('必須バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/devices/new');
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_SUBMIT}"]`);
    await expect(page.locator('.text-destructive').first()).toBeVisible();
  });

  test('デバイスを編集して更新できる', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_EDIT_BUTTON}-1"]`);
    await page.waitForURL(/\/devices\/\d+\/edit$/, { timeout: 10000 });
    await expect(page.locator(`[data-testid="${TESTIDS.DEVICE_FORM_NAME}"]`)).toHaveValue(
      'レジ端末1'
    );
    await page.fill(`[data-testid="${TESTIDS.DEVICE_FORM_NAME}"]`, '更新後レジ端末');
    await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_SUBMIT}"]`);
    await page.waitForURL(/\/devices(?:\?.*)?$/, { timeout: 10000 });
    await expect(page.getByText('デバイスを更新しました')).toBeVisible({ timeout: 5000 });
  });

  test('デバイス削除ダイアログをキャンセル', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_DELETE_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });

  test('デバイスを削除できる', async ({ page }) => {
    await page.goto('/devices');
    await page.click(`[data-testid="${TESTIDS.DEVICE_DELETE_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
    await expect(page.getByText('デバイスを削除しました')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });
});
