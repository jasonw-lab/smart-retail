import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';
import { selectOptionByFieldLabel } from '../fixtures/select-helper';

test.describe('店舗管理', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    '店舗一覧が表示される',
    caseMeta({
      id: 'STR-001',
      screen: '店舗管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['店舗一覧を開く'],
      expected: ['店舗テーブルが表示される', '東京本店・大阪支店が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('東京本店')).toBeVisible();
      await expect(page.getByText('大阪支店')).toBeVisible();
    }
  );

  test(
    '単一検索: 店舗名での絞り込みと他店舗の除外検証 (toHaveCount(0))',
    caseMeta({
      id: 'STR-002',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['店舗名に「東京本店」を入力する', '検索ボタンを押す'],
      expected: ['東京本店が表示される', '大阪支店は表示されない'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      const input = page.getByPlaceholder('店舗名を入力...');
      await input.fill('東京本店');
      await expect(input).toHaveValue('東京本店');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('東京本店')).toBeVisible();
      await expect(page.getByText('大阪支店')).toHaveCount(0);
    }
  );

  test(
    '除外検証: 存在しない店舗名で検索し0件空状態表示',
    caseMeta({
      id: 'STR-003',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['search-text', 'empty'],
      steps: ['店舗名に「存在しない店舗999」を入力する', '検索ボタンを押す'],
      expected: ['「店舗が見つかりません」が表示される', '東京本店・大阪支店は表示されない'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.getByPlaceholder('店舗名を入力...').fill('存在しない店舗999');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('店舗が見つかりません')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('東京本店')).toHaveCount(0);
      await expect(page.getByText('大阪支店')).toHaveCount(0);
    }
  );

  test(
    '店舗ステータス絞り込み: メンテナンス中で絞り込みと除外検証',
    caseMeta({
      id: 'STR-004',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['search-select', 'exclude'],
      steps: ['ステータスで「メンテナンス中」を選ぶ', '検索ボタンを押す'],
      expected: [
        '仙台支店・広島支店が表示される',
        '東京本店・大阪支店は表示されない',
        'URL に status=MAINTENANCE が付く',
      ],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await selectOptionByFieldLabel(page, 'ステータス', 'メンテナンス中');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('仙台支店')).toBeVisible();
      await expect(page.getByText('広島支店')).toBeVisible();
      await expect(page.getByText('東京本店')).toHaveCount(0);
      await expect(page.getByText('大阪支店')).toHaveCount(0);
      await expect(page).toHaveURL(/status=MAINTENANCE/, { timeout: 10000 });
    }
  );

  test(
    'リセット復帰: 検索条件クリアで全件復帰しURLが初期化されること',
    caseMeta({
      id: 'STR-005',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['reset'],
      steps: ['店舗名「東京本店」で検索する', 'リセットボタンを押す'],
      expected: [
        'URL が /stores に戻る',
        '東京本店・大阪支店が両方表示される',
        '店舗名欄が空になる',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    'ページネーション: 次ページ（?page=2）遷移と前ページ復帰',
    caseMeta({
      id: 'STR-006',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['pagination'],
      steps: ['次ページボタンを押す', '前ページボタンを押す'],
      expected: [
        '1ページ目に11件目（静岡支店）は表示されない',
        '2ページ目で静岡支店・岡山支店が表示され、URL に page=2 が付く',
        '前ページで東京本店が再表示され、URL に page=1 が付く',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    '店舗を新規登録できる',
    caseMeta({
      id: 'STR-007',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: [
        '新規登録ボタンを押す',
        '店舗コード「STR-999」、店舗名「テスト新規店舗」を入力する',
        '登録ボタンを押す',
      ],
      expected: ['一覧に戻る', '「店舗を登録しました」が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.click(`[data-testid="${TESTIDS.STORE_NEW_BUTTON}"]`);
      await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });
      await page.fill(`[data-testid="${TESTIDS.STORE_FORM_CODE}"]`, 'STR-999');
      await page.fill(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`, 'テスト新規店舗');
      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/stores(?:\?.*)?$/, { timeout: 10000 });
      await expect(page.getByText('店舗を登録しました')).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    '店舗を編集できる',
    caseMeta({
      id: 'STR-008',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ID 1 の編集ボタンを押す'],
      expected: ['/stores/1/edit に遷移する', '店舗名に既存値「東京本店」が入っている'],
      note: '初期値の表示のみで、保存は検証していない → STR-011',
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.click(`[data-testid="${TESTIDS.STORE_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/stores\/\d+\/edit$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`)).toHaveValue(
        '東京本店'
      );
    }
  );

  test(
    '在庫リンクで在庫ページへ遷移',
    caseMeta({
      id: 'STR-009',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['navigation'],
      steps: ['ID 1 の在庫ボタンを押す'],
      expected: ['/inventory?storeId=1 に遷移する'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.click(`[data-testid="${TESTIDS.STORE_INVENTORY_BUTTON}-1"]`);
      await page.waitForURL(/\/inventory\?storeId=1/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/inventory\?storeId=1/);
    }
  );

  test(
    '店舗削除ダイアログをキャンセル',
    caseMeta({
      id: 'STR-010',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['dialog'],
      steps: ['ID 2 の削除ボタンを押す', 'キャンセルを押す'],
      expected: ['確認ダイアログが開き、キャンセルで閉じる'],
      note: '削除の確定は検証していない → STR-012',
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.click(`[data-testid="${TESTIDS.STORE_DELETE_BUTTON}-2"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );

  test(
    '店舗を編集して保存できる',
    caseMeta({
      id: 'STR-011',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ID 1 の編集ボタンを押す', '店舗名を変更して保存する'],
      expected: ['一覧に戻る', '更新完了のトーストが表示され、変更後の店舗名が一覧に表示される'],
    }),
    async ({ page }) => {
      await page.goto('/stores');
      await page.click(`[data-testid="${TESTIDS.STORE_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/stores\/1\/edit$/, { timeout: 10000 });
      const nameInput = page.locator(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`);
      await nameInput.fill('東京本店（更新）');
      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/stores$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toContainText('東京本店（更新）');

      // Revert name back to 東京本店 so subsequent tests/runs remain consistent
      await page.click(`[data-testid="${TESTIDS.STORE_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/stores\/1\/edit$/, { timeout: 10000 });
      await nameInput.fill('東京本店');
      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/stores$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toContainText('東京本店');
    }
  );

  test(
    '店舗を削除できる',
    caseMeta({
      id: 'STR-012',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['ID 2 の削除ボタンを押す', 'OK を押す'],
      expected: ['削除完了のトーストが表示される', '一覧から該当店舗が消える'],
    }),
    async ({ page }) => {
      // First create a disposable store so 東京本店 and 大阪支店 remain intact
      await page.goto('/stores/new');
      await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });
      const delStoreCode = `S-${Date.now().toString().slice(-8)}`;
      const delStoreName = `削除店舗-${Date.now().toString().slice(-6)}`;
      await page.locator(`[data-testid="${TESTIDS.STORE_FORM_CODE}"]`).fill(delStoreCode);
      await page.locator(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`).fill(delStoreName);
      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/stores(?:\?.*)?$/, { timeout: 10000 });

      // Filter by the newly created store name so it appears regardless of page size
      await page.getByPlaceholder('店舗名を入力...').fill(delStoreName);
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toContainText(delStoreName);

      // Find the row with delStoreName and click its delete button
      const row = page.locator('tr', { hasText: delStoreName });
      await row.locator(`[data-testid^="${TESTIDS.STORE_DELETE_BUTTON}"]`).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).not.toContainText(delStoreName);
    }
  );

  test(
    '店舗登録フォームの必須バリデーション',
    caseMeta({
      id: 'STR-013',
      screen: '店舗管理',
      priority: 'P1',
      perspectives: ['validation'],
      steps: ['/stores/new を開く', '何も入力せず登録ボタンを押す'],
      expected: ['必須項目の入力エラーが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/stores/new');
      await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });
      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);
      await expect(page.locator('.text-destructive').first()).toBeVisible();
    }
  );
});
