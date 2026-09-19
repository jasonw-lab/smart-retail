import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';
import { selectOptionByFieldLabel } from '../fixtures/select-helper';

test.describe('デバイス管理', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    'デバイス一覧とサマリーカードが表示される',
    caseMeta({
      id: 'DEV-001',
      screen: 'デバイス管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['デバイス一覧を開く'],
      expected: [
        'デバイス一覧テーブルが表示される',
        'サマリーカード（総数・オンライン・切断・メンテナンス）が表示される',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    '単一検索: デバイス名での絞り込みと他デバイスの除外検証 (toHaveCount(0))',
    caseMeta({
      id: 'DEV-002',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['キーワードに「レジ端末1」を入力する', '検索ボタンを押す'],
      expected: ['レジ端末1 が表示される', 'プリンター1 は表示されない'],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      const input = page.getByPlaceholder('キーワードを入力...');
      await expect(input).toBeVisible({ timeout: 10000 });
      await input.fill('レジ端末1');
      await expect(input).toHaveValue('レジ端末1');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('レジ端末1')).toBeVisible();
      await expect(page.getByText('プリンター1')).toHaveCount(0);
    }
  );

  test(
    '除外検証: 存在しないデバイス名で検索し0件空状態表示',
    caseMeta({
      id: 'DEV-003',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['search-text', 'empty'],
      steps: ['キーワードに「存在しない端末999」を入力する', '検索ボタンを押す'],
      expected: [
        '「デバイスが見つかりません」が表示される',
        'レジ端末1・プリンター1 は表示されない',
      ],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      const input = page.getByPlaceholder('キーワードを入力...');
      await expect(input).toBeVisible({ timeout: 10000 });
      await input.fill('存在しない端末999');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('デバイスが見つかりません')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('レジ端末1')).toHaveCount(0);
      await expect(page.getByText('プリンター1')).toHaveCount(0);
    }
  );

  test(
    'デバイス種別絞り込み: プリンターで絞り込みと除外検証',
    caseMeta({
      id: 'DEV-004',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['search-select', 'exclude'],
      steps: ['デバイス種別で「プリンター」を選ぶ', '検索ボタンを押す'],
      expected: [
        'プリンター1・プリンター2 が表示される',
        'レジ端末1 は表示されない',
        'URL に type=PRINTER が付く',
      ],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      await selectOptionByFieldLabel(page, 'デバイス種別', 'プリンター');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('プリンター1')).toBeVisible();
      await expect(page.getByText('プリンター2')).toBeVisible();
      await expect(page.getByText('レジ端末1')).toHaveCount(0);
      await expect(page).toHaveURL(/type=PRINTER/, { timeout: 10000 });
    }
  );

  test(
    'ステータス絞り込み: オフラインで絞り込みと除外検証',
    caseMeta({
      id: 'DEV-005',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['search-select', 'exclude'],
      steps: ['状態で「オフライン」を選ぶ', '検索ボタンを押す'],
      expected: [
        'ルーター1・レジ端末2 が表示される',
        'レジ端末1 は表示されない',
        'URL に status=OFFLINE が付く',
      ],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      await selectOptionByFieldLabel(page, '状態', 'オフライン');
      await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);
      await expect(page.getByText('ルーター1')).toBeVisible();
      await expect(page.getByText('レジ端末2')).toBeVisible();
      await expect(page.getByText('レジ端末1')).toHaveCount(0);
      await expect(page).toHaveURL(/status=OFFLINE/, { timeout: 10000 });
    }
  );

  test(
    'リセット復帰: 検索条件クリアで全件復帰しURLが初期化されること',
    caseMeta({
      id: 'DEV-006',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['search-combined', 'reset'],
      steps: ['店舗「東京本店」とキーワード「レジ端末1」で検索する', 'リセットボタンを押す'],
      expected: [
        'URL が /devices に戻る',
        'レジ端末1・プリンター1 が両方表示される',
        'キーワード欄が空になる',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    'ページネーション: 次ページ（?page=2）遷移',
    caseMeta({
      id: 'DEV-007',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['pagination'],
      steps: ['1ページ目を表示する', '次ページボタンを押す'],
      expected: [
        '1ページ目に11件目（温度センサー2）は表示されない',
        'URL に page=2 が付く',
        '温度センサー2・レジ端末3 が表示され、レジ端末1 は表示されない',
      ],
      note: '前ページへの復帰は検証していない',
    }),
    async ({ page }) => {
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
    }
  );

  test(
    'デバイスを新規登録できる',
    caseMeta({
      id: 'DEV-008',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: [
        '新規登録ボタンを押す',
        '名前「新規デバイス」、店舗「東京本店」、種別「決済端末」、状態「オンライン」を入力する',
        '登録ボタンを押す',
      ],
      expected: ['一覧に戻る', '「デバイスを登録しました」が表示される'],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    '必須バリデーションエラーが表示される',
    caseMeta({
      id: 'DEV-009',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['validation'],
      steps: ['/devices/new を開く', '何も入力せず登録ボタンを押す'],
      expected: ['入力エラーが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/devices/new');
      await page.click(`[data-testid="${TESTIDS.DEVICE_FORM_SUBMIT}"]`);
      await expect(page.locator('.text-destructive').first()).toBeVisible();
    }
  );

  test(
    'デバイスを編集して更新できる',
    caseMeta({
      id: 'DEV-010',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ID 1 の編集ボタンを押す', '名前を「更新後レジ端末」に変更する', '保存ボタンを押す'],
      expected: [
        '編集画面に既存値「レジ端末1」が入っている',
        '一覧に戻り「デバイスを更新しました」が表示される',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    'デバイス削除ダイアログをキャンセル',
    caseMeta({
      id: 'DEV-011',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['dialog'],
      steps: ['ID 1 の削除ボタンを押す', 'キャンセルを押す'],
      expected: ['確認ダイアログが表示される', 'キャンセルでダイアログが閉じる'],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      await page.click(`[data-testid="${TESTIDS.DEVICE_DELETE_BUTTON}-1"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );

  test(
    'デバイスを削除できる',
    caseMeta({
      id: 'DEV-012',
      screen: 'デバイス管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['ID 1 の削除ボタンを押す', 'OK を押す'],
      expected: ['「デバイスを削除しました」が表示される', 'ダイアログが閉じる'],
    }),
    async ({ page }) => {
      await page.goto('/devices');
      await page.click(`[data-testid="${TESTIDS.DEVICE_DELETE_BUTTON}-1"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.getByText('デバイスを削除しました')).toBeVisible({ timeout: 5000 });
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );
});
