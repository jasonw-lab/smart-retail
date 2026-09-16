import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';
import { selectOptionByFieldLabel } from '../fixtures/select-helper';
import { resetMockData } from '../fixtures/mock-helper';

test.describe('商品管理CRUD', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await resetMockData();
    await login(page);
  });

  test(
    '商品一覧が表示される',
    caseMeta({
      id: 'PRD-001',
      screen: '商品管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['商品一覧を開く'],
      expected: ['商品テーブルが表示される', 'テスト商品1 が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('テスト商品1')).toBeVisible();
    }
  );

  test(
    '商品名で検索・リセット',
    caseMeta({
      id: 'PRD-002',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['search-text', 'reset'],
      steps: ['商品名に「テスト商品1」を入力して検索する', 'リセットボタンを押す'],
      expected: ['テスト商品1 が表示され、URL に search= が付く', 'リセットで /products に戻る'],
      note: '他の商品が除外されること、リセット後の全件復帰は検証していない → PRD-007 / PRD-013',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.getByPlaceholder('商品名を入力...').fill('テスト商品1');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('テスト商品1')).toBeVisible();
      await expect(page).toHaveURL(/search=/);

      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
      await expect(page).toHaveURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
    }
  );

  test(
    '新規作成フォームとバリデーション',
    caseMeta({
      id: 'PRD-003',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['validation'],
      steps: ['/products/new を開く', '何も入力せず登録ボタンを押す'],
      expected: ['入力エラーが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products/new');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    '商品を新規作成できる',
    caseMeta({
      id: 'PRD-004',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: [
        '/products/new を開く',
        '商品コード「P004」、商品名「新規商品」、カテゴリ「1」、価格「999」を入力する',
        '登録ボタンを押す',
      ],
      expected: ['一覧に戻る', '「商品を作成しました」が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products/new');
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CODE}"]`, 'P004');
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`, '新規商品');
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CATEGORY}"]`, '1');
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_PRICE}"]`, '999');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
      await expect(page.getByText('商品を作成しました')).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    '商品を編集できる',
    caseMeta({
      id: 'PRD-005',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ID 1 の編集ボタンを押す'],
      expected: ['/products/1/edit に遷移する', '商品名に既存値「テスト商品1」が入っている'],
      note: '初期値の表示のみで、保存は検証していない → PRD-011',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/products\/\d+\/edit$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`)).toHaveValue(
        'テスト商品1'
      );
    }
  );

  test(
    '商品削除ダイアログを操作できる',
    caseMeta({
      id: 'PRD-006',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['delete', 'dialog'],
      steps: ['ID 1 の削除ボタンを押してキャンセルする'],
      expected: ['確認ダイアログが開いてキャンセルで閉じる'],
      note: '削除後の一覧への反映・トーストは検証していない → PRD-012',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_DELETE_BUTTON}-1"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );

  test(
    '単一検索: 商品名で絞り込むと他の商品が除外される',
    caseMeta({
      id: 'PRD-007',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['商品名「テスト商品1」で検索する'],
      expected: ['テスト商品1 が表示される', 'テスト商品2 は表示されない'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.getByPlaceholder('商品名を入力...').fill('テスト商品1');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品1');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).not.toContainText('テスト商品2');
    }
  );

  test(
    'カテゴリで絞り込める',
    caseMeta({
      id: 'PRD-008',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['search-select', 'exclude'],
      steps: ['カテゴリを選ぶ', '検索ボタンを押す'],
      expected: ['選んだカテゴリの商品だけが表示される', 'URL に category= が付く'],
      note: 'plan_0915 A07（検索条件が URL・SSR・Query で一致しない）の回帰確認にもなる',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await selectOptionByFieldLabel(page, 'カテゴリ', 'カテゴリB');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page).toHaveURL(/category=2/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('サンプル商品');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).not.toContainText('テスト商品1');
    }
  );

  test(
    '存在しない商品名で検索すると0件表示になる',
    caseMeta({
      id: 'PRD-009',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['empty'],
      steps: ['商品名「存在しない商品999」で検索する'],
      expected: ['空状態が表示される', 'エラー画面にならない'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.getByPlaceholder('商品名を入力...').fill('存在しない商品999');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText(/見つかりません|データがありません/);
      await expect(page.locator(`[data-testid="${TESTIDS.ERROR_BOUNDARY}"]`)).not.toBeVisible();
    }
  );

  test(
    'ページネーション: 次ページ遷移と前ページ復帰',
    caseMeta({
      id: 'PRD-010',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['pagination'],
      steps: ['次ページボタンを押す', '前ページボタンを押す'],
      expected: ['URL に page=2 が付き、2ページ目が表示される', '前ページで1ページ目に戻る'],
      note: '前提: 2ページ分以上の商品モックデータが必要',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toBeVisible({ timeout: 10000 });

      // Click next page button
      const nextBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_NEXT}"]`);
      await expect(nextBtn).toBeEnabled();
      await nextBtn.click();
      await expect(page).toHaveURL(/page=2/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('商品K');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).not.toContainText('テスト商品1');

      // Click previous page button
      const prevBtn = page.locator(`[data-testid="${TESTIDS.PAGINATION_PREV}"]`);
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await expect(page).toHaveURL(/page=1/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品1');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).not.toContainText('商品K');
    }
  );

  test(
    '商品を編集して保存できる',
    caseMeta({
      id: 'PRD-011',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ID 1 の編集ボタンを押す', '商品名を変更して保存する'],
      expected: ['一覧に戻る', '更新完了のトーストが表示され、変更後の商品名が一覧に表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/products\/1\/edit$/, { timeout: 10000 });
      const nameInput = page.locator(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`);
      await nameInput.fill('テスト商品1（更新）');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品1（更新）');

      // Revert name back to テスト商品1
      await page.click(`[data-testid="${TESTIDS.PRODUCT_EDIT_BUTTON}-1"]`);
      await page.waitForURL(/\/products\/1\/edit$/, { timeout: 10000 });
      await nameInput.fill('テスト商品1');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品1');
    }
  );

  test(
    '商品を削除すると一覧から消える',
    caseMeta({
      id: 'PRD-012',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['ID 1 の削除ボタンを押す', 'OK を押す'],
      expected: ['削除完了のトーストが表示される', '一覧からテスト商品1 が消える'],
    }),
    async ({ page }) => {
      // First create a disposable product
      await page.goto('/products/new');
      await page.waitForURL(/\/products\/new$/, { timeout: 10000 });
      const delProdCode = `P-${Date.now().toString().slice(-8)}`;
      const delProdName = `削除品-${Date.now().toString().slice(-6)}`;
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CODE}"]`, delProdCode);
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_NAME}"]`, delProdName);
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_CATEGORY}"]`, '1');
      await page.fill(`[data-testid="${TESTIDS.PRODUCT_FORM_PRICE}"]`, '888');
      await page.click(`[data-testid="${TESTIDS.PRODUCT_FORM_SUBMIT}"]`);
      await page.waitForURL(/\/products(?:\?.*)?$/, { timeout: 10000 });

      // Filter by the disposable product name
      await page.getByPlaceholder('商品名を入力...').fill(delProdName);
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText(delProdName);

      // Find the row and click delete
      const row = page.locator('tr', { hasText: delProdName });
      await row.locator(`[data-testid^="${TESTIDS.PRODUCT_DELETE_BUTTON}"]`).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).not.toContainText(delProdName);
    }
  );

  test(
    'リセットで検索条件がクリアされ全件に戻る',
    caseMeta({
      id: 'PRD-013',
      screen: '商品管理',
      priority: 'P1',
      perspectives: ['reset'],
      steps: ['商品名とカテゴリを指定して検索する', 'リセットボタンを押す'],
      expected: ['URL が /products に戻る', 'すべての商品が再表示される', '商品名欄が空になる'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.getByPlaceholder('商品名を入力...').fill('テスト商品1');
      await selectOptionByFieldLabel(page, 'カテゴリ', 'カテゴリA');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page).toHaveURL(/search=/, { timeout: 10000 });

      // Reset
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
      await expect(page).toHaveURL(/\/products(?:\?.*)?$/, { timeout: 10000 });
      await expect(page.getByPlaceholder('商品名を入力...')).toHaveValue('');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品1');
      await expect(page.locator(`[data-testid="${TESTIDS.PRODUCT_TABLE}"]`)).toContainText('テスト商品2');
    }
  );
});
