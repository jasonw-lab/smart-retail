import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('レイアウト', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    'main/header/sidebarが表示される',
    caseMeta({
      id: 'LAY-001',
      screen: '共通レイアウト',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['ログイン後の画面を表示する'],
      expected: ['ヘッダー・サイドバー・メイン領域が表示される'],
    }),
    async ({ page }) => {
      await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_HEADER}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)).toBeVisible();
    }
  );

  test(
    'ヘッダーメニュートグルでサイドバーが折りたたまれる',
    caseMeta({
      id: 'LAY-002',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['display'],
      steps: ['サイドバーを展開状態にする', 'ヘッダーのメニューボタンを押す'],
      expected: ['サイドバーが折りたたまれた幅になる'],
    }),
    async ({ page }) => {
      const sidebar = page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`);
      const initialClass = await sidebar.getAttribute('class');

      // 確実に展開状態から開始
      if (initialClass?.includes('w-16')) {
        await page.click(`[data-testid="${TESTIDS.HEADER_MENU_TOGGLE}"]`);
        await expect(sidebar).toHaveClass(/w-64/);
      }

      await page.click(`[data-testid="${TESTIDS.HEADER_MENU_TOGGLE}"]`);
      await expect(sidebar).toHaveClass(/w-16/);
    }
  );

  test(
    '言語切り替え',
    caseMeta({
      id: 'LAY-003',
      screen: '共通レイアウト',
      priority: 'P2',
      perspectives: ['i18n'],
      steps: ['商品一覧でヘッダーの言語メニューから English を選ぶ', '同じメニューで日本語に戻す'],
      expected: ['URL が /en/products になる', '日本語に戻すと /products になる'],
      note: 'URL のみ確認し、表示文言は検証していない',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.click(`[data-testid="${TESTIDS.HEADER_LANGUAGE_SWITCHER}"]`);
      await page.click(`[data-testid="${TESTIDS.LANGUAGE_OPTION_EN}"]`);
      await expect(page).toHaveURL(/\/en\/products/);

      await page.click(`[data-testid="${TESTIDS.HEADER_LANGUAGE_SWITCHER}"]`);
      await page.click(`[data-testid="${TESTIDS.LANGUAGE_OPTION_JA}"]`);
      await expect(page).toHaveURL(/\/products$/);
    }
  );

  test(
    'フルスクリーンボタンをクリックできる',
    caseMeta({
      id: 'LAY-004',
      screen: '共通レイアウト',
      priority: 'P2',
      perspectives: ['display'],
      steps: ['ヘッダーのフルスクリーンボタンを押す'],
      expected: ['エラーにならずに押せる'],
      note: 'アサーションが無く、フルスクリーンになったかは検証していない',
    }),
    async ({ page }) => {
      await page.click(`[data-testid="${TESTIDS.HEADER_FULLSCREEN}"]`);
    }
  );

  test(
    '通知ベルが表示される',
    caseMeta({
      id: 'LAY-005',
      screen: '共通レイアウト',
      priority: 'P2',
      perspectives: ['display'],
      steps: ['ヘッダーの通知ベルを押す'],
      expected: ['通知ベルが表示されている'],
      note: '押した後の通知一覧などは検証していない',
    }),
    async ({ page }) => {
      const bell = page.locator(`[data-testid="${TESTIDS.HEADER_NOTIFICATIONS}"]`);
      await expect(bell).toBeVisible();
      await bell.click();
      await expect(bell).toBeVisible();
    }
  );

  test(
    'ユーザーメニューからログアウト',
    caseMeta({
      id: 'LAY-006',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['auth'],
      steps: ['ヘッダーのユーザーメニューを開く', 'ログアウトを押す'],
      expected: ['ログインページへ遷移する'],
    }),
    async ({ page }) => {
      await page.click(`[data-testid="${TESTIDS.HEADER_USER_MENU}"]`);
      await page.click(`[data-testid="${TESTIDS.HEADER_LOGOUT}"]`);
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  );

  test(
    'サイドバーからログアウト',
    caseMeta({
      id: 'LAY-007',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['auth'],
      steps: ['サイドバーのログアウトを押す'],
      expected: ['ログインページへ遷移する'],
    }),
    async ({ page }) => {
      await page.click(`[data-testid="${TESTIDS.SIDEBAR_LOGOUT}"]`);
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  );

  test(
    'ネストしたページでパンくずが表示される',
    caseMeta({
      id: 'LAY-008',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['display'],
      steps: ['/system/user を開く'],
      expected: ['パンくずに「ユーザー管理」が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/user');
      const breadcrumb = page.locator(`[data-testid="${TESTIDS.HEADER_BREADCRUMB}"]`);
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText('ユーザー管理');
    }
  );

  test(
    'ユーザーメニューからプロフィール画面へ移動できる',
    caseMeta({
      id: 'LAY-009',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['navigation'],
      steps: ['ヘッダーのユーザーメニューを開く', 'プロフィールを押す'],
      expected: ['/profile に遷移し、プロフィール画面が表示される'],
    }),
    async ({ page }) => {
      await page.click(`[data-testid="${TESTIDS.HEADER_USER_MENU}"]`);
      await page.getByRole('menuitem', { name: /プロフィール|Profile/i }).click();
      await expect(page).toHaveURL(/\/profile/, { timeout: 10000 });
      await expect(page.getByRole('heading', { level: 1, name: /プロフィール|Profile/i })).toBeVisible();
    }
  );
});

test.describe('レイアウト（未実装）', suiteMeta({ precondition: 'admin でログイン済み' }), () => {

  test.fixme(
    'ログアウト後にブラウザの戻るで保護された画面が表示されない',
    caseMeta({
      id: 'LAY-010',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['auth', 'security'],
      steps: ['商品一覧を開く', 'ログアウトする', 'ブラウザの戻るを押す'],
      expected: ['ログインページへリダイレクトされ、商品一覧は表示されない'],
    }),
    async () => {}
  );

  test.fixme(
    '別ユーザーで再ログインすると前のユーザーのデータが残らない',
    caseMeta({
      id: 'LAY-011',
      screen: '共通レイアウト',
      priority: 'P1',
      perspectives: ['auth', 'security'],
      steps: [
        'admin でアラート一覧を表示する',
        'ログアウトして demo でログインする',
        'アラート一覧を開く',
      ],
      expected: ['admin のときに取得したデータ（キャッシュ）が表示されない'],
      note: 'plan_0915 A01（セッション切り替えでキャッシュが残る問題）の回帰確認',
    }),
    async () => {}
  );
});
