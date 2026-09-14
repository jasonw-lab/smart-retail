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

test.describe('取引履歴 (Transactions)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/transactions');
    await expect(page.locator(`[data-testid="${TESTIDS.TRANSACTION_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
  });

  test('1. サマリーカード & 初期一覧表示: 件数・売上合計の表示確認', async ({ page }) => {
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_SALES}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_SALES}"]`)
    ).toContainText('¥');

    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_COUNT}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_COUNT}"]`)
    ).toContainText('件');

    await expect(
      page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_PAYMENT}"]`)
    ).toBeVisible();

    // 初期一覧に注文が表示されていること
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-002')).toBeVisible();
  });

  test('2. P1: 単一テキスト検索: 注文番号での絞り込み', async ({ page }) => {
    const orderInput = page.getByPlaceholder('例: ORD-0099');
    await expect(orderInput).toBeVisible({ timeout: 10000 });

    await orderInput.fill('TXN-20260529-001');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page).toHaveURL(/order=TXN-20260529-001/, { timeout: 10000 });
  });

  test('3. P2: 厳密な除外検証 (Negative Test): 該当しない別注文番号が存在しないこと', async ({
    page,
  }) => {
    // 初期状態で両方の注文番号が存在することを確認
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-002')).toBeVisible();

    // TXN-20260529-001 のみ検索
    const orderInput = page.getByPlaceholder('例: ORD-0099');
    await orderInput.fill('TXN-20260529-001');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    // 検索対象が表示され、別注文は厳密に除外（0件）されていること
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-002')).toHaveCount(0);
    await expect(page.getByText('TXN-20260529-003')).toHaveCount(0);
  });

  test('4. P3: セレクト検索: 店舗（大阪支店）での絞り込み', async ({ page }) => {
    await selectOptionByFieldLabel(page, '店舗', '大阪支店');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('TXN-20260529-003')).toBeVisible();
    await expect(page.getByText('TXN-20260529-001')).toHaveCount(0);
    await expect(page).toHaveURL(/storeId=2/, { timeout: 10000 });
  });

  test('5. P3: セレクト検索: 決済方法（カード / QR）での絞り込み', async ({ page }) => {
    // 決済方法で絞り込み（カード）
    await selectOptionByFieldLabel(page, '決済方法', '💳 カード');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-002')).toHaveCount(0); // 現金は除外
    await expect(page).toHaveURL(/method=CARD/, { timeout: 10000 });
  });

  test('6. P4: 複合検索 (AND): 店舗 × 決済方法 × 期間の掛け合わせ', async ({ page }) => {
    // 大阪支店 × QR決済 × 本日
    await selectOptionByFieldLabel(page, '店舗', '大阪支店');
    await selectOptionByFieldLabel(page, '決済方法', '📱 QR決済');
    await selectOptionByFieldLabel(page, '期間', '本日');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    // 条件に合致する大阪支店・QRのレコードのみ表示される
    await expect(page.getByText('TXN-20260529-003')).toBeVisible();
    // 東京本店のカード決済は除外
    await expect(page.getByText('TXN-20260529-001')).toHaveCount(0);
    // 大阪支店のカード決済は除外
    await expect(page.getByText('TXN-20260529-004')).toHaveCount(0);
    // 東京本店の現金決済は除外
    await expect(page.getByText('TXN-20260529-002')).toHaveCount(0);
  });

  test('7. P5: 該当0件 (Empty State): 存在しない注文番号で検索しクラッシュせず空状態表示', async ({
    page,
  }) => {
    const orderInput = page.getByPlaceholder('例: ORD-0099');
    await orderInput.fill('TXN-NONEXISTENT-999');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    await expect(page.getByText('決済履歴が見つかりません')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('エラーが発生しました')).toHaveCount(0);
    await expect(page.getByText('TXN-20260529-001')).toHaveCount(0);
  });

  test('8. P6: リセット復帰: リセット押下で全件復帰しURLがリセットされること', async ({
    page,
  }) => {
    // 検索条件を入力して絞り込み
    await selectOptionByFieldLabel(page, '店舗', '大阪支店');
    await selectOptionByFieldLabel(page, '決済方法', '📱 QR決済');
    await page.getByPlaceholder('例: ORD-0099').fill('TXN-20260529-003');
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
    await expect(page.getByText('TXN-20260529-003')).toBeVisible();
    await expect(page.getByText('TXN-20260529-001')).toHaveCount(0);

    // リセットボタンを押下
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(page).toHaveURL(/\/transactions$/, { timeout: 10000 });

    // 全件復帰して東京本店・大阪支店双方のレコードが表示される
    await expect(page.getByText('TXN-20260529-001')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('TXN-20260529-002')).toBeVisible();
    await expect(page.getByText('TXN-20260529-003')).toBeVisible();

    // 入力欄がクリアされていること
    await expect(page.getByPlaceholder('例: ORD-0099')).toHaveValue('');
  });

  test('9. P7: ページネーション: 次ページ（?page=2）遷移と前ページ復帰', async ({ page }) => {
    // 初期状態（1ページ目）で20件表示されていることを確認
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-020')).toBeVisible();
    // 21件目は1ページ目に存在しない
    await expect(page.getByText('TXN-20260529-021')).toHaveCount(0);

    // 次のページボタンをクリック
    const nextBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_NEXT}"]`);
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // 2ページ目に遷移し、URLに ?page=2 が反映されること
    await expect(page).toHaveURL(/page=2/, { timeout: 10000 });
    await expect(page.getByText('TXN-20260529-021')).toBeVisible();
    await expect(page.getByText('TXN-20260529-022')).toBeVisible();
    // 1ページ目のアイテムは非表示
    await expect(page.getByText('TXN-20260529-001')).toHaveCount(0);

    // 前のページボタンをクリック
    const prevBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_PREV}"]`);
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();

    // 1ページ目に戻り、TXN-20260529-001 が再表示されること
    await expect(page).toHaveURL(/page=1/, { timeout: 10000 });
    await expect(page.getByText('TXN-20260529-001')).toBeVisible();
    await expect(page.getByText('TXN-20260529-021')).toHaveCount(0);
  });

  test('10. 詳細ダイアログ: 金額・明細・閉じるボタンが動作すること', async ({ page }) => {
    await page.click(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_BUTTON}-1"]`);
    const dialog = page.locator(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_DIALOG}"]`);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('TXN-20260529-001', { exact: true })).toBeVisible();
    await expect(dialog.getByText('¥3,500').first()).toBeVisible();

    // 明細テーブルの確認
    const itemsTable = page.locator(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_ITEMS_TABLE}"]`);
    await expect(itemsTable).toBeVisible();
    await expect(itemsTable.getByText('テスト商品1')).toBeVisible();
    await expect(itemsTable.getByText('テスト商品2')).toBeVisible();

    // 閉じるボタンでダイアログが閉じること
    await page.click(`[data-testid="${TESTIDS.TRANSACTION_DETAIL_CLOSE}"]`);
    await expect(dialog).not.toBeVisible();
  });

  test('11. CSV エクスポート: ダウンロードイベントが発火し正しいファイル名形式であること', async ({
    page,
  }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(`[data-testid="${TESTIDS.TRANSACTION_EXPORT_BUTTON}"]`),
    ]);
    expect(download.suggestedFilename()).toMatch(/transactions-.*\.csv/);
  });
});
