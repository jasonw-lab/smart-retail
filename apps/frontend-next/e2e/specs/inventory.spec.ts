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

test.describe('在庫管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/inventory');
    await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
  });

  test('在庫一覧とサマリーカードが表示される', async ({ page }) => {
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

  test('店舗フィルタで絞り込み（大阪支店）', async ({ page }) => {
    // 初期表示: 東京本店と大阪支店の両方が表示されている
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('サンプル商品')).toBeVisible();

    // 大阪支店で絞り込み
    await selectOptionByFieldLabel(page, '店舗', '大阪支店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('サンプル商品')).toBeVisible();
    await expect(page.getByText('テスト商品1')).not.toBeVisible();
    await expect(page.getByText('テスト商品2')).not.toBeVisible();
    await expect(page).toHaveURL(/storeId=2/, { timeout: 10000 });
  });

  test('店舗フィルタで絞り込み（東京本店）', async ({ page }) => {
    // 東京本店で絞り込み
    await selectOptionByFieldLabel(page, '店舗', '東京本店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('テスト商品2')).toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();
    await expect(page).toHaveURL(/storeId=1/, { timeout: 10000 });
  });

  test('商品名テキスト入力で絞り込み（完全一致・部分一致）', async ({ page }) => {
    const productInput = page.getByPlaceholder('商品名を入力...');
    await expect(productInput).toBeVisible({ timeout: 10000 });

    // 完全一致で検索
    await productInput.fill('テスト商品1');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('テスト商品2')).not.toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();

    // 部分一致「テスト」で検索 -> テスト商品1, 2 がヒットし、サンプル商品は除外
    await productInput.fill('テスト');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('テスト商品2')).toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();
  });

  test('商品名「おにぎり」検索でサラダ・弁当が正しく除外される（実機契約乖離防止テスト）', async ({
    page,
  }) => {
    // 初期表示で「おにぎり」「サラダ」「弁当」が存在することを確認
    await expect(page.getByText('おにぎり')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('サラダ')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('弁当')).toBeVisible({ timeout: 10000 });

    // 「おにぎり」を入力して検索
    const productInput = page.getByPlaceholder('商品名を入力...');
    await productInput.fill('おにぎり');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    // 「おにぎり」のみが表示され、「サラダ」「弁当」は一覧から確実に除外される
    await expect(page.getByText('おにぎり')).toBeVisible();
    await expect(page.getByText('サラダ')).not.toBeVisible();
    await expect(page.getByText('弁当')).not.toBeVisible();
    await expect(page).toHaveURL(/product=%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A/, { timeout: 10000 });
  });

  test('ステータス「正常」でフィルタ検索', async ({ page }) => {
    // 「正常」で検索 -> テスト商品1(正常), サンプル商品(正常)が表示され、テスト商品2(在庫切れ)は除外
    await selectOptionByFieldLabel(page, 'ステータス', '正常');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('サンプル商品')).toBeVisible();
    await expect(page.getByText('テスト商品2')).not.toBeVisible();
    await expect(page).toHaveURL(/status=NORMAL/, { timeout: 10000 });
  });

  test('ステータス「在庫切れ」でフィルタ検索', async ({ page }) => {
    // 「在庫切れ」で検索 -> テスト商品2のみ表示され、テスト商品1, サンプル商品は除外
    await selectOptionByFieldLabel(page, 'ステータス', '在庫切れ');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品2')).toBeVisible();
    await expect(page.getByText('テスト商品1')).not.toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();
    await expect(page).toHaveURL(/status=OUT_OF_STOCK/, { timeout: 10000 });
  });

  test('複合検索条件（店舗 ＋ 商品名 ＋ ステータス）で絞り込み', async ({ page }) => {
    // 東京本店 ＋ テスト ＋ 正常 -> テスト商品1 のみヒット
    await selectOptionByFieldLabel(page, '店舗', '東京本店');
    await page.getByPlaceholder('商品名を入力...').fill('テスト');
    await selectOptionByFieldLabel(page, 'ステータス', '正常');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('テスト商品1')).toBeVisible();
    await expect(page.getByText('テスト商品2')).not.toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();
  });

  test('一致するデータがない場合の空状態表示', async ({ page }) => {
    await page.getByPlaceholder('商品名を入力...').fill('存在しない商品XYZ');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('在庫データが見つかりません')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('テスト商品1')).not.toBeVisible();
    await expect(page.getByText('テスト商品2')).not.toBeVisible();
    await expect(page.getByText('サンプル商品')).not.toBeVisible();
  });

  test('リセットボタンですべての検索条件がクリアされ全件復帰', async ({ page }) => {
    // 条件を入力して絞り込み
    await selectOptionByFieldLabel(page, '店舗', '大阪支店');
    await page.getByPlaceholder('商品名を入力...').fill('サンプル');
    await selectOptionByFieldLabel(page, 'ステータス', '正常');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('サンプル商品')).toBeVisible();
    await expect(page.getByText('テスト商品1')).not.toBeVisible();

    // リセットボタンをクリック
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });

    // 全件（3件）が再表示される
    await expect(page.getByText('テスト商品1')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('テスト商品2')).toBeVisible();
    await expect(page.getByText('サンプル商品')).toBeVisible();

    // 商品名入力欄がクリアされている
    await expect(page.getByPlaceholder('商品名を入力...')).toHaveValue('');
  });

  test('行を展開してロットが表示される', async ({ page }) => {
    await page.click(`[data-testid="${TESTIDS.INVENTORY_ROW_EXPAND}-1"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE_ROW}-1"]`).getByText('LOT-001')
    ).toBeVisible();
  });

  test('補充ダイアログを開いて登録', async ({ page }) => {
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
    await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_BUTTON}-1"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_CLOSE}"]`);
    await expect(
      page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)
    ).not.toBeVisible();
  });

  test('廃棄ダイアログを開いて登録', async ({ page }) => {
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
    const exportBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_EXPORT_BUTTON}"]`);
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
    await expect(exportBtn).toBeEnabled();
  });
});
