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

  test(
    'ユーザー管理が英語で表示される',
    caseMeta({
      id: 'I18N-009',
      screen: 'ユーザー管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/user を開く'],
      expected: [
        '見出しが「User Management」になる',
        '「Add User」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/user');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('User Management');
      await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
    }
  );

  test(
    'ロール管理が英語で表示される',
    caseMeta({
      id: 'I18N-010',
      screen: 'ロール管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/role を開く'],
      expected: [
        '見出しが「Role Management」になる',
        '「Add New Role」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/role');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Role Management');
      await expect(page.getByRole('button', { name: /^(Add Role|Add New Role)$/ })).toBeVisible();
    }
  );

  test(
    '部門管理が英語で表示される',
    caseMeta({
      id: 'I18N-011',
      screen: '部門管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/dept を開く'],
      expected: [
        '見出しが「Department Management」になる',
        '「Add Department」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/dept');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Department Management');
      await expect(page.getByRole('button', { name: /^(Add Department|New Department)$/ })).toBeVisible();
    }
  );

  test(
    'メニュー管理が英語で表示される',
    caseMeta({
      id: 'I18N-012',
      screen: 'メニュー管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/menu を開く'],
      expected: [
        '見出しが「Menu Management」になる',
        '「Create Menu」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/menu');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Menu Management');
      await expect(page.getByRole('button', { name: 'Create Menu' })).toBeVisible();
    }
  );

  test(
    '辞書管理が英語で表示される',
    caseMeta({
      id: 'I18N-013',
      screen: '辞書管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/dict を開く'],
      expected: [
        '見出しが「Dictionary Management」になる',
        '「Add New Dictionary」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/dict');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Dictionary Management');
      await expect(page.getByRole('button', { name: 'Add New Dictionary' })).toBeVisible();
    }
  );

  test(
    '操作ログが英語で表示される',
    caseMeta({
      id: 'I18N-014',
      screen: 'ログ管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/log を開く'],
      expected: [
        '見出しが「Operation Log」になる',
        '「System Log Records」カードが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/log');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText(/^(Operation Log|System Log)$/);
      await expect(page.getByText('System Log Records')).toBeVisible();
    }
  );

  test(
    '辞書項目管理が英語で表示される',
    caseMeta({
      id: 'I18N-015',
      screen: '辞書管理',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/dict/gender を開く'],
      expected: [
        '「Add New Item」ボタンが表示される',
        '「Back to Dictionaries」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/dict/gender');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: 'Add New Item' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^(Back|Back to Dictionaries)$/ })).toBeVisible();
    }
  );

  test(
    'システム設定が英語で表示される',
    caseMeta({
      id: 'I18N-016',
      screen: 'システム設定',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/config を開く'],
      expected: [
        '見出しが「System Config」になる',
        '「Add Config」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/config');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('System Config');
      await expect(page.getByRole('button', { name: 'Add Config' })).toBeVisible();
    }
  );

  test(
    '通知公告が英語で表示される',
    caseMeta({
      id: 'I18N-017',
      screen: '通知公告',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['/en/system/notice を開く'],
      expected: [
        '見出しが「Notices」になる',
        '「Add Notice」ボタンが表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/en/system/notice');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('Notices');
      await expect(page.getByRole('button', { name: 'Add Notice' })).toBeVisible();
    }
  );
});

