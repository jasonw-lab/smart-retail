import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';
import { selectOptionByFieldLabel } from '../fixtures/select-helper';
import { resetMockData } from '../fixtures/mock-helper';

test.describe(
  '在庫管理',
  suiteMeta({ precondition: 'admin でログイン済み、在庫一覧を開いている' }),
  () => {
    test.beforeEach(async ({ page }) => {
      await resetMockData();
      await login(page);
      await page.goto('/inventory');
      await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });
    });

    test(
      '在庫一覧とサマリーカードが表示される',
      caseMeta({
        id: 'INV-001',
        screen: '在庫管理',
        priority: 'P0',
        perspectives: ['display'],
        steps: ['在庫一覧を開く'],
        expected: ['サマリーカード（在庫数・低在庫・期限間近・回転率）が表示される'],
      }),
      async ({ page }) => {
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
      }
    );

    test(
      '店舗フィルタで絞り込み（大阪支店）',
      caseMeta({
        id: 'INV-002',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-select', 'exclude'],
        steps: ['店舗で「大阪支店」を選ぶ', '検索ボタンを押す'],
        expected: [
          'サンプル商品が表示される',
          'テスト商品1・テスト商品2 は表示されない',
          'URL に storeId=2 が付く',
        ],
      }),
      async ({ page }) => {
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
      }
    );

    test(
      '店舗フィルタで絞り込み（東京本店）',
      caseMeta({
        id: 'INV-003',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-select', 'exclude'],
        steps: ['店舗で「東京本店」を選ぶ', '検索ボタンを押す'],
        expected: [
          'テスト商品1・テスト商品2 が表示される',
          'サンプル商品は表示されない',
          'URL に storeId=1 が付く',
        ],
      }),
      async ({ page }) => {
        // 東京本店で絞り込み
        await selectOptionByFieldLabel(page, '店舗', '東京本店');
        await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
        await expect(page.getByText('テスト商品1')).toBeVisible();
        await expect(page.getByText('テスト商品2')).toBeVisible();
        await expect(page.getByText('サンプル商品')).not.toBeVisible();
        await expect(page).toHaveURL(/storeId=1/, { timeout: 10000 });
      }
    );

    test(
      '商品名テキスト入力で絞り込み（完全一致・部分一致）',
      caseMeta({
        id: 'INV-004',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-text', 'exclude'],
        steps: ['商品名「テスト商品1」で検索する', '商品名「テスト」で検索する'],
        expected: [
          '完全一致: テスト商品1 だけが表示される',
          '部分一致: テスト商品1・2 が表示され、サンプル商品は表示されない',
        ],
      }),
      async ({ page }) => {
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
      }
    );

    test(
      '商品名「おにぎり」検索でサラダ・弁当が正しく除外される（実機契約乖離防止テスト）',
      caseMeta({
        id: 'INV-005',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-text', 'exclude'],
        steps: ['商品名「おにぎり」で検索する'],
        expected: [
          'おにぎりが表示される',
          'サラダ・弁当は表示されない',
          'URL に product=おにぎり（エンコード済み）が付く',
        ],
        note: '実バックエンドとの検索仕様の食い違いを防ぐためのケース',
      }),
      async ({ page }) => {
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
        await expect(page).toHaveURL(/product=%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A/, {
          timeout: 10000,
        });
      }
    );

    test(
      'ステータス「正常」でフィルタ検索',
      caseMeta({
        id: 'INV-006',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-select', 'exclude'],
        steps: ['ステータスで「正常」を選ぶ', '検索ボタンを押す'],
        expected: [
          'テスト商品1・サンプル商品が表示される',
          'テスト商品2（在庫切れ）は表示されない',
          'URL に status=NORMAL が付く',
        ],
      }),
      async ({ page }) => {
        // 「正常」で検索 -> テスト商品1(正常), サンプル商品(正常)が表示され、テスト商品2(在庫切れ)は除外
        await selectOptionByFieldLabel(page, 'ステータス', '正常');
        await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
        await expect(page.getByText('テスト商品1')).toBeVisible();
        await expect(page.getByText('サンプル商品')).toBeVisible();
        await expect(page.getByText('テスト商品2')).not.toBeVisible();
        await expect(page).toHaveURL(/status=NORMAL/, { timeout: 10000 });
      }
    );

    test(
      'ステータス「在庫切れ」でフィルタ検索',
      caseMeta({
        id: 'INV-007',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-select', 'exclude'],
        steps: ['ステータスで「在庫切れ」を選ぶ', '検索ボタンを押す'],
        expected: ['テスト商品2 だけが表示される', 'URL に status=OUT_OF_STOCK が付く'],
      }),
      async ({ page }) => {
        // 「在庫切れ」で検索 -> テスト商品2のみ表示され、テスト商品1, サンプル商品は除外
        await selectOptionByFieldLabel(page, 'ステータス', '在庫切れ');
        await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
        await expect(page.getByText('テスト商品2')).toBeVisible();
        await expect(page.getByText('テスト商品1')).not.toBeVisible();
        await expect(page.getByText('サンプル商品')).not.toBeVisible();
        await expect(page).toHaveURL(/status=OUT_OF_STOCK/, { timeout: 10000 });
      }
    );

    test(
      '複合検索条件（店舗 ＋ 商品名 ＋ ステータス）で絞り込み',
      caseMeta({
        id: 'INV-008',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['search-combined', 'exclude'],
        steps: [
          '店舗「東京本店」、商品名「テスト」、ステータス「正常」を指定する',
          '検索ボタンを押す',
        ],
        expected: ['テスト商品1 だけが表示される'],
      }),
      async ({ page }) => {
        // 東京本店 ＋ テスト ＋ 正常 -> テスト商品1 のみヒット
        await selectOptionByFieldLabel(page, '店舗', '東京本店');
        await page.getByPlaceholder('商品名を入力...').fill('テスト');
        await selectOptionByFieldLabel(page, 'ステータス', '正常');
        await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
        await expect(page.getByText('テスト商品1')).toBeVisible();
        await expect(page.getByText('テスト商品2')).not.toBeVisible();
        await expect(page.getByText('サンプル商品')).not.toBeVisible();
      }
    );

    test(
      '一致するデータがない場合の空状態表示',
      caseMeta({
        id: 'INV-009',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['empty'],
        steps: ['商品名「存在しない商品XYZ」で検索する'],
        expected: ['「在庫データが見つかりません」が表示される', 'どの商品も表示されない'],
      }),
      async ({ page }) => {
        await page.getByPlaceholder('商品名を入力...').fill('存在しない商品XYZ');
        await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
        await expect(page.getByText('在庫データが見つかりません')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('テスト商品1')).not.toBeVisible();
        await expect(page.getByText('テスト商品2')).not.toBeVisible();
        await expect(page.getByText('サンプル商品')).not.toBeVisible();
      }
    );

    test(
      'リセットボタンですべての検索条件がクリアされ全件復帰',
      caseMeta({
        id: 'INV-010',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['reset'],
        steps: ['店舗・商品名・ステータスを指定して検索する', 'リセットボタンを押す'],
        expected: ['URL が /inventory に戻る', '3件すべてが再表示される', '商品名欄が空になる'],
      }),
      async ({ page }) => {
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
      }
    );

    test(
      '行を展開してロットが表示される',
      caseMeta({
        id: 'INV-011',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['display'],
        steps: ['ID 1 の行の展開ボタンを押す'],
        expected: ['ロット「LOT-001」が表示される'],
      }),
      async ({ page }) => {
        await page.click(`[data-testid="${TESTIDS.INVENTORY_ROW_EXPAND}-1"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE_ROW}-1"]`).getByText('LOT-001')
        ).toBeVisible();
      }
    );

    test(
      '補充ダイアログを開いて登録',
      caseMeta({
        id: 'INV-012',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['create', 'dialog'],
        steps: ['ID 1 の補充ボタンを押す', '数量に 10 を入力して登録する'],
        expected: ['補充ダイアログが開く', '登録後にダイアログが閉じる'],
        note: '登録後のトースト・在庫数の反映は検証していない → INV-021',
      }),
      async ({ page }) => {
        await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_BUTTON}-1"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
        ).toBeVisible();
        await page.fill(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_QUANTITY}"]`, '10');
        await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_SUBMIT}"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
        ).not.toBeVisible();
      }
    );

    test(
      '履歴ダイアログを開いて閉じる',
      caseMeta({
        id: 'INV-013',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['dialog'],
        steps: ['ID 1 の履歴ボタンを押す', '閉じるボタンを押す'],
        expected: ['履歴ダイアログが開き、閉じるボタンで閉じる'],
        note: '履歴の内容は検証していない',
      }),
      async ({ page }) => {
        await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_BUTTON}-1"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)
        ).toBeVisible();
        await page.click(`[data-testid="${TESTIDS.INVENTORY_HISTORY_CLOSE}"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_HISTORY_DIALOG}"]`)
        ).not.toBeVisible();
      }
    );

    test(
      '廃棄ダイアログを開いて登録',
      caseMeta({
        id: 'INV-014',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['create', 'dialog'],
        steps: [
          'ID 1 の行を展開する',
          'ロット 101 の廃棄ボタンを押す',
          '数量 10、理由「期限切れ」を入力して登録する',
        ],
        expected: ['「廃棄を記録しました」が表示される', 'ダイアログが閉じる'],
      }),
      async ({ page }) => {
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
      }
    );

    test(
      '新規在庫登録ボタンで遷移しキャンセルで一覧へ戻る',
      caseMeta({
        id: 'INV-015',
        screen: '在庫管理',
        priority: 'P0',
        perspectives: ['navigation'],
        steps: ['新規在庫登録ボタンを押す', 'キャンセルボタンを押す'],
        expected: [
          '/inventory/new に遷移し、見出し「新規在庫登録」が表示される',
          'キャンセルで /inventory に戻る',
        ],
      }),
      async ({ page }) => {
        await page.click(`[data-testid="${TESTIDS.INVENTORY_NEW_BUTTON}"]`);
        await expect(page).toHaveURL(/\/inventory\/new/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: '新規在庫登録' })).toBeVisible();

        await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_CANCEL}"]`);
        await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });
      }
    );

    test(
      '新規在庫登録フォームの必須バリデーションエラー',
      caseMeta({
        id: 'INV-016',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['validation'],
        steps: ['/inventory/new を開く', '何も入力せず登録ボタンを押す'],
        expected: [
          '「店舗を選択してください」が表示される',
          '「商品を選択してください」が表示される',
        ],
      }),
      async ({ page }) => {
        await page.goto('/inventory/new');
        await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_SUBMIT}"]`);
        await expect(page.getByText('店舗を選択してください')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('商品を選択してください')).toBeVisible();
      }
    );

    test(
      'CSVエクスポートボタンがクリック可能',
      caseMeta({
        id: 'INV-017',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['export'],
        steps: ['在庫一覧を開く'],
        expected: ['CSV エクスポートボタンが表示され、押せる状態になっている'],
        note: 'ダウンロードは検証していない → INV-020',
      }),
      async ({ page }) => {
        const exportBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_EXPORT_BUTTON}"]`);
        await expect(exportBtn).toBeVisible({ timeout: 10000 });
        await expect(exportBtn).toBeEnabled();
      }
    );

    test(
      '新規在庫を登録できる',
      caseMeta({
        id: 'INV-018',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['create'],
        steps: ['新規在庫登録ボタンを押す', '店舗・商品など必須項目を入力する', '登録ボタンを押す'],
        expected: ['一覧に戻る', '登録完了のトーストが表示される'],
      }),
      async ({ page }) => {
        await page.goto('/inventory/new');
        await page.waitForURL(/\/inventory\/new$/, { timeout: 10000 });

        // Select store
        await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_STORE}"]`);
        await page.getByRole('option', { name: '東京本店' }).click();

        // Select product
        await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_PRODUCT}"]`);
        await page.getByRole('option', { name: 'テスト商品1' }).click();

        // Fill lot and quantity
        await page.fill(`[data-testid="${TESTIDS.INVENTORY_FORM_LOT}"]`, `LOT-${Date.now().toString().slice(-6)}`);
        await page.fill(`[data-testid="${TESTIDS.INVENTORY_FORM_QUANTITY}"]`, '50');

        // Submit
        await page.click(`[data-testid="${TESTIDS.INVENTORY_FORM_SUBMIT}"]`);
        await page.waitForURL(/\/inventory(?:\?.*)?$/, { timeout: 10000 });
        await expect(page.getByText('在庫を登録しました')).toBeVisible({ timeout: 5000 });
      }
    );

    test(
      'ページネーション: 次ページ遷移と前ページ復帰',
      caseMeta({
        id: 'INV-019',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['pagination'],
        steps: ['次ページボタンを押す', '前ページボタンを押す'],
        expected: [
          'URL に page=2 が付き、2ページ目の在庫が表示される',
          '前ページで1ページ目に戻る',
        ],
        note: '前提: 2ページ分以上の在庫モックデータが必要',
      }),
      async ({ page }) => {
        const nextBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_NEXT_PAGE}"]`);
        await expect(nextBtn).toBeVisible({ timeout: 10000 });
        await nextBtn.click();
        await expect(page).toHaveURL(/page=2/, { timeout: 10000 });
        await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE}"]`)).toContainText('商品K');

        const prevBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_PREV_PAGE}"]`);
        await prevBtn.click();
        await expect(page).toHaveURL(/page=1/, { timeout: 10000 });
        await expect(page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE}"]`)).toContainText('テスト商品1');
      }
    );

    test(
      'CSV エクスポートでファイルがダウンロードされる',
      caseMeta({
        id: 'INV-020',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['export'],
        steps: ['CSV エクスポートボタンを押す'],
        expected: ['ダウンロードが発生する', 'ファイル名が CSV 形式になっている'],
        note: 'plan_0915 A08（BFF Proxy が CSV を壊す問題）の回帰確認にもなる',
      }),
      async ({ page }) => {
        const exportBtn = page.locator(`[data-testid="${TESTIDS.INVENTORY_EXPORT_BUTTON}"]`);
        await expect(exportBtn).toBeVisible({ timeout: 10000 });
        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.csv$/);
      }
    );

    test(
      '補充を登録すると在庫数とトーストに反映される',
      caseMeta({
        id: 'INV-021',
        screen: '在庫管理',
        priority: 'P1',
        perspectives: ['create'],
        steps: ['ID 1 の補充ボタンを押す', '数量に 10 を入力して登録する'],
        expected: ['補充完了のトーストが表示される', '一覧の在庫数が 10 増える'],
        note: 'plan_0915 A11（更新後のキャッシュ無効化）の回帰確認にもなる',
      }),
      async ({ page }) => {
        // First row is ID 1 (テスト商品1) with initial quantity 100
        const row1 = page.locator(`[data-testid="${TESTIDS.INVENTORY_TABLE_ROW}-1"]`);
        await expect(row1).toBeVisible({ timeout: 10000 });
        await expect(row1).toContainText('100');

        await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_BUTTON}-1"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
        ).toBeVisible();
        await page.fill(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_QUANTITY}"]`, '10');
        await page.click(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_SUBMIT}"]`);
        await expect(
          page.locator(`[data-testid="${TESTIDS.INVENTORY_REPLENISH_DIALOG}"]`)
        ).not.toBeVisible();

        // Assert toast and updated quantity
        await expect(page.getByText('補充を記録しました')).toBeVisible({ timeout: 5000 });
        await expect(row1).toContainText('110');
      }
    );
  }
);
