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
});
