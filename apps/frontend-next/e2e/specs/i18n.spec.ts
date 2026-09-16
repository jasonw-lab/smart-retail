import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS, testId } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('多言語表示 (i18n)', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test(
    '商品一覧が英語で表示される',
    caseMeta({
      id: 'I18N-001',
      screen: '商品管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/products を開く'],
      expected: [
        '見出しが「Products」になる',
        '「New Product」ボタンが表示される',
        '検索欄のプレースホルダーが「Search products...」になる',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/products');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Products');
      await expect(page.getByRole('button', { name: 'New Product' })).toBeVisible();
      await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    }
  );

  test(
    '店舗一覧が英語で表示される',
    caseMeta({
      id: 'I18N-002',
      screen: '店舗管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/stores を開く'],
      expected: [
        '見出しが「Store List」になる',
        '「New Store」ボタンが表示される',
        '検索欄のプレースホルダーが「Search by name...」になる',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/stores');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Store List');
      await expect(page.getByRole('button', { name: 'New Store' })).toBeVisible();
      await expect(page.getByPlaceholder('Search by name...')).toBeVisible();
    }
  );

  test(
    'デバイス一覧が英語で表示される',
    caseMeta({
      id: 'I18N-003',
      screen: 'デバイス管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/devices を開く'],
      expected: [
        '見出しが「Device List」になる',
        '「New Device」ボタンが表示される',
        '検索欄のプレースホルダーが「Enter keyword...」になる',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/devices');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Device List');
      await expect(page.getByRole('button', { name: 'New Device' })).toBeVisible();
      await expect(page.getByPlaceholder('Enter keyword...')).toBeVisible();
    }
  );

  test(
    '在庫一覧が英語で表示される',
    caseMeta({
      id: 'I18N-004',
      screen: '在庫管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/inventory を開く'],
      expected: [
        '見出しが「Inventory List」になる',
        '「New Inventory」「Export CSV」ボタンが表示される',
        '検索欄のプレースホルダーが「Enter product name...」になる',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/inventory');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Inventory List');
      await expect(page.getByRole('button', { name: 'New Inventory' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
      await expect(page.getByPlaceholder('Enter product name...')).toBeVisible();
    }
  );

  test(
    '取引履歴が英語で表示される',
    caseMeta({
      id: 'I18N-005',
      screen: '取引履歴',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/transactions を開く'],
      expected: ['見出し・ボタン・検索欄が英語で表示される'],
    }),
    async ({ page }) => {
      await page.goto('/en/transactions');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Transactions');
      await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
      await expect(page.getByPlaceholder('e.g. ORD-0099')).toBeVisible();
    }
  );

  test(
    'アラート一覧が英語で表示される',
    caseMeta({
      id: 'I18N-006',
      screen: 'アラート',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/alerts を開く'],
      expected: ['見出し・タブ・検索欄が英語で表示される'],
    }),
    async ({ page }) => {
      await page.goto('/en/alerts');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Alert List');
      await expect(page.getByRole('tab', { name: /All/i })).toBeVisible();
    }
  );

  test(
    'ダッシュボードが英語で表示される',
    caseMeta({
      id: 'I18N-007',
      screen: 'ダッシュボード',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en を開く'],
      expected: ['KPI カード・売上推移・アラート情報の見出しが英語で表示される'],
    }),
    async ({ page }) => {
      await page.goto('/en');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.getByText('Total Sales')).toBeVisible();
      await expect(main.getByText('Sales Trend')).toBeVisible();
      await expect(main.getByText('Alerts').first()).toBeVisible();
    }
  );

  test(
    '英語に切り替えた後もサイドバーで移動した画面が英語のまま',
    caseMeta({
      id: 'I18N-008',
      screen: '共通レイアウト',
      priority: 'P2',
      perspectives: ['i18n', 'navigation'],
      steps: ['ヘッダーで English に切り替える', 'サイドバーから店舗一覧へ移動する'],
      expected: ['URL が /en/stores になる', '画面が英語で表示される'],
    }),
    async ({ page }) => {
      await page.goto('/');
      await page.getByTestId(TESTIDS.HEADER_LANGUAGE_SWITCHER).click();
      await page.getByTestId(TESTIDS.LANGUAGE_OPTION_EN).click();
      await expect(page).toHaveURL(/\/en/);

      const storeLink = page.getByTestId(testId(TESTIDS.SIDEBAR_NAV_LINK, '/stores'));
      await storeLink.click();
      await expect(page).toHaveURL(/\/en\/stores/);
      const main = page.getByRole('main');
      await expect(main.locator('h1')).toHaveText('Store List');
    }
  );
});
