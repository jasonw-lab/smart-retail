import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

test.describe('システム管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ユーザー管理', async ({ page }) => {
    await page.goto('/system/user');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('admin').first()
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('本社').first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await page.getByRole('button', { name: 'Add User' }).click();
    await expect(page.getByText('ユーザーの追加')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('ユーザーの編集')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page
      .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
      .getByRole('button', { name: /^Delete$/ })
      .first()
      .click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });

  test('ロール管理', async ({ page }) => {
    await page.goto('/system/role');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('ADMIN')).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await page.getByRole('button', { name: 'Add New Role' }).click();
    await expect(page.getByText('役割の追加')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page.getByRole('button', { name: 'Permissions' }).first().click();
    await expect(page.getByText('権限設定')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('役割の編集')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page
      .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
      .getByRole('button', { name: /^Delete$/ })
      .first()
      .click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
  });

  test('メニュー管理', async ({ page }) => {
    await page.goto('/system/menu');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('ダッシュボード')).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await page.getByRole('button', { name: 'Create Menu' }).click();
    await expect(page.getByText('メニューの追加')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // メニュー行の削除アイコンをクリック
    await page.locator('table button:has(svg[class*="lucide-trash2"])').first().click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
  });

  test('部門管理', async ({ page }) => {
    await page.goto('/system/dept');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('本社')).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await page.getByRole('button', { name: 'New Department' }).click();
    await expect(page.getByText('部門の追加')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('部門の編集')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page
      .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
      .getByRole('button', { name: /^Delete$/ })
      .first()
      .click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
  });

  test('辞書管理', async ({ page }) => {
    await page.goto('/system/dict');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('ステータス')).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await page.getByRole('button', { name: 'Add New Dictionary' }).click();
    await expect(page.getByText('字典の追加')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('字典の編集')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await page
      .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
      .getByRole('button', { name: /^Delete$/ })
      .first()
      .click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
  });

  test('ログ管理', async ({ page }) => {
    await page.goto('/system/log');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('System Log Records')).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('admin').first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    await expect(page.getByText('Module Activity')).toBeVisible();
    await expect(page.getByText('Avg. Response Time')).toBeVisible();
  });

  test('辞書項目管理', async ({ page }) => {
    // 辞書一覧から Items ボタンで辞書項目画面へ遷移
    await page.goto('/system/dict');
    await expect(page.getByRole('main')).toBeVisible();
    await page.getByRole('button', { name: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/system\/dict\/status/);
    await expect(page.getByRole('main')).toBeVisible();

    // 辞書項目の初期一覧確認
    await expect(page.getByText('有効').first()).toBeVisible();
    await expect(page.getByText('無効').first()).toBeVisible();

    // 検索・リセット操作
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Reset' }).first().click();

    // 辞書項目の追加
    await page.getByRole('button', { name: 'Add New Item' }).click();
    await expect(page.getByText('辞書項目の追加')).toBeVisible();
    await page.fill('#label', 'テスト項目');
    await page.fill('#value', 'test');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText('辞書項目の追加')).not.toBeVisible();
    await expect(page.getByText('テスト項目').first()).toBeVisible();

    // 辞書項目の編集
    await page.locator('table').getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('辞書項目の編集')).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();
    await expect(page.getByText('辞書項目の編集')).not.toBeVisible();

    // 辞書項目の削除（確認ダイアログキャンセル）
    await page.locator('table').getByRole('button', { name: /^Delete$/ }).first().click();
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
  });
});

