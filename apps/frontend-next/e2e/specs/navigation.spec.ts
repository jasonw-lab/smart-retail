import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS, testId } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

/**
 * Navigation E2E Tests
 * Tests sidebar navigation based on current sidebar structure.
 *
 * Current sidebar structure (sidebar.tsx):
 * - Dashboard → /
 * - Products → /products
 * - Stores → /stores
 * - Inventory → /inventory
 * - Devices → /devices
 * - Transactions → /transactions
 * - Alerts → /alerts
 * - System (expandable):
 *   - Users → /system/user
 *   - Roles → /system/role
 *   - Menus → /system/menu
 *   - Departments → /system/dept
 *   - Dictionary → /system/dict
 *   - Logs → /system/log
 */
test.describe(
  'サイドバーナビゲーション',
  suiteMeta({ precondition: 'admin でログイン済み、サイドバーが表示されている' }),
  () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)).toBeVisible({
        timeout: 10000,
      });
    });

    test.describe('メインメニュー', () => {
      test(
        'Dashboard (/) が表示されている',
        caseMeta({
          id: 'NAV-001',
          screen: 'ダッシュボード',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['ログイン後の画面を表示する'],
          expected: ['URL がトップ（/）になる', 'メインコンテンツが表示される'],
          note: 'DASH-001 とほぼ同じ内容',
        }),
        async ({ page }) => {
          await expect(page).toHaveURL(/\/(ja|en)?$/);
          // ダッシュボードコンテンツが表示される
          await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
        }
      );

      test(
        'Products (/products) にアクセスできる',
        caseMeta({
          id: 'NAV-002',
          screen: '商品管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Products を押す'],
          expected: ['/products に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const productsLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/products')}"]`
          );
          await expect(productsLink).toBeVisible({ timeout: 5000 });
          await productsLink.click();

          await expect(page).toHaveURL(/\/products$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );

      test(
        'Stores (/stores) にアクセスできる',
        caseMeta({
          id: 'NAV-003',
          screen: '店舗管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Stores を押す'],
          expected: ['/stores に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const storeLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/stores')}"]`
          );
          await expect(storeLink).toBeVisible({ timeout: 5000 });
          await storeLink.click();

          await expect(page).toHaveURL(/\/stores$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );

      test(
        'Inventory (/inventory) にアクセスできる',
        caseMeta({
          id: 'NAV-004',
          screen: '在庫管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Inventory を押す'],
          expected: ['/inventory に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const inventoryLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/inventory')}"]`
          );
          await expect(inventoryLink).toBeVisible({ timeout: 5000 });
          await inventoryLink.click();

          await expect(page).toHaveURL(/\/inventory$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );

      test(
        'Devices (/devices) にアクセスできる',
        caseMeta({
          id: 'NAV-005',
          screen: 'デバイス管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Devices を押す'],
          expected: ['/devices に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const devicesLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/devices')}"]`
          );
          await expect(devicesLink).toBeVisible({ timeout: 5000 });
          await devicesLink.click();

          await expect(page).toHaveURL(/\/devices$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );

      test(
        'Transactions (/transactions) にアクセスできる',
        caseMeta({
          id: 'NAV-006',
          screen: '取引履歴',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Transactions を押す'],
          expected: ['/transactions に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const transactionsLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/transactions')}"]`
          );
          await expect(transactionsLink).toBeVisible({ timeout: 5000 });
          await transactionsLink.click();

          await expect(page).toHaveURL(/\/transactions$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );

      test(
        'Alerts (/alerts) にアクセスできる',
        caseMeta({
          id: 'NAV-007',
          screen: 'アラート',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの Alerts を押す'],
          expected: ['/alerts に遷移し、見出しが表示される'],
        }),
        async ({ page }) => {
          const alertsLink = page.locator(
            `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/alerts')}"]`
          );
          await expect(alertsLink).toBeVisible({ timeout: 5000 });
          await alertsLink.click();

          await expect(page).toHaveURL(/\/alerts$/, { timeout: 15000 });
          await expect(page.getByRole('main').locator('h1')).toBeVisible({
            timeout: 10000,
          });
        }
      );
    });

    test.describe('System (展開式メニュー)', () => {
      async function expandSystemMenu(page: import('@playwright/test').Page) {
        const systemMenuButton = page
          .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
          .locator(`[data-testid="${TESTIDS.SIDEBAR_MENU_ITEM}"]`);
        await expect(systemMenuButton).toBeVisible({ timeout: 5000 });

        // Check if already expanded by looking for a submenu link
        const userMgmtLink = page.locator(
          `[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/user')}"]`
        );
        const isExpanded = await userMgmtLink.isVisible().catch(() => false);

        if (!isExpanded) {
          await systemMenuButton.click();
          // Wait for submenu to be visible instead of fixed timeout
          await expect(userMgmtLink).toBeVisible({ timeout: 5000 });
        }
      }

      // ページ表示確認（mainコンテンツの見出し表示＆エラー画面でないこと）
      async function expectPageLoaded(page: import('@playwright/test').Page) {
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 10000 });
        await expect(mainContent.locator('h1')).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('button', { name: '再試行' })).not.toBeVisible();
      }

      test(
        'Users (/system/user) にアクセスできる',
        caseMeta({
          id: 'NAV-008',
          screen: 'ユーザー管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Users を押す'],
          expected: ['/system/user に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/user')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/user$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'Roles (/system/role) にアクセスできる',
        caseMeta({
          id: 'NAV-009',
          screen: 'ロール管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Roles を押す'],
          expected: ['/system/role に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/role')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/role$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'Menus (/system/menu) にアクセスできる',
        caseMeta({
          id: 'NAV-010',
          screen: 'メニュー管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Menus を押す'],
          expected: ['/system/menu に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/menu')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/menu$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'Departments (/system/dept) にアクセスできる',
        caseMeta({
          id: 'NAV-011',
          screen: '部門管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Departments を押す'],
          expected: ['/system/dept に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/dept')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/dept$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'Dictionary (/system/dict) にアクセスできる',
        caseMeta({
          id: 'NAV-012',
          screen: '辞書管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Dictionary を押す'],
          expected: ['/system/dict に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/dict')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/dict$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'Logs (/system/log) にアクセスできる',
        caseMeta({
          id: 'NAV-013',
          screen: 'ログ管理',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'Logs を押す'],
          expected: ['/system/log に遷移し、画面が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/log')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/log$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'System Config (/system/config) にアクセスできる',
        caseMeta({
          id: 'NAV-020',
          screen: 'システム設定',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', 'システム設定を押す'],
          expected: ['/system/config に遷移し、一覧が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/config')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/config$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );

      test(
        'System Notice (/system/notice) にアクセスできる',
        caseMeta({
          id: 'NAV-021',
          screen: '通知公告',
          priority: 'P0',
          perspectives: ['navigation'],
          steps: ['サイドバーの System を展開する', '通知公告を押す'],
          expected: ['/system/notice に遷移し、一覧が表示される'],
        }),
        async ({ page }) => {
          await expandSystemMenu(page);
          await page
            .locator(`[data-testid="${testId(TESTIDS.SIDEBAR_NAV_LINK, '/system/notice')}"]`)
            .click();

          await expect(page).toHaveURL(/\/system\/notice$/, { timeout: 15000 });
          await expectPageLoaded(page);
        }
      );
    });

    test.describe('フッターセクション', () => {
      test(
        'Logout ボタンが表示される',
        caseMeta({
          id: 'NAV-014',
          screen: '共通レイアウト',
          priority: 'P0',
          perspectives: ['display'],
          steps: ['サイドバー下部を確認する'],
          expected: ['Logout ボタンが表示される'],
        }),
        async ({ page }) => {
          const logoutButton = page
            .locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`)
            .locator(`[data-testid="${TESTIDS.SIDEBAR_LOGOUT}"]`);
          await expect(logoutButton).toBeVisible({ timeout: 5000 });
        }
      );
    });

    test(
      'ログイン済みで存在しないページを開くと 404 画面が表示される',
      caseMeta({
        id: 'NAV-022',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['error'],
        steps: ['/nonexistent-page を開く'],
        expected: ['404 画面が表示される', 'ログインページにはリダイレクトされない'],
      }),
      async ({ page }) => {
        await page.goto('/nonexistent-page');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.getByText('404')).toBeVisible({ timeout: 10000 });
      }
    );
  }
);

test.describe('基本ナビゲーション', suiteMeta({ precondition: '未ログイン' }), () => {
  test(
    'ログインページにアクセスできる',
    caseMeta({
      id: 'NAV-015',
      screen: 'ログイン',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['/login を開く'],
      expected: ['HTTP 200 で /login が表示される'],
    }),
    async ({ page }) => {
      const response = await page.goto('/login');
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(/\/login$/);
    }
  );

  test(
    '未認証でダッシュボードにアクセスするとログインにリダイレクト',
    caseMeta({
      id: 'NAV-016',
      screen: 'ログイン',
      priority: 'P0',
      perspectives: ['auth'],
      steps: ['ダッシュボード（/）を開く'],
      expected: ['ログインページへリダイレクトされる'],
      note: 'AUTH-004 と重複',
    }),
    async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    }
  );

  test(
    '未認証で存在しないページにアクセスするとログインにリダイレクト',
    caseMeta({
      id: 'NAV-017',
      screen: 'ログイン',
      priority: 'P0',
      perspectives: ['auth'],
      steps: ['/nonexistent-page を開く'],
      expected: ['ログインページへリダイレクトされる'],
    }),
    async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/nonexistent-page');
      await expect(page).toHaveURL(/\/login/);
    }
  );
});

test.describe('レスポンシブデザイン', suiteMeta({ precondition: '未ログイン' }), () => {
  test(
    'ログインページがモバイルで表示される',
    caseMeta({
      id: 'NAV-018',
      screen: 'ログイン',
      priority: 'P2',
      perspectives: ['display'],
      steps: ['画面サイズを 375×667 にする', '/login を開く'],
      expected: ['ユーザー名・パスワードの入力欄とログインボタンが表示される'],
    }),
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toBeVisible();
    }
  );

  test(
    'ログインページがデスクトップで表示される',
    caseMeta({
      id: 'NAV-019',
      screen: 'ログイン',
      priority: 'P2',
      perspectives: ['display'],
      steps: ['画面サイズを 1920×1080 にする', '/login を開く'],
      expected: ['ユーザー名・パスワードの入力欄とログインボタンが表示される'],
    }),
    async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/login');

      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toBeVisible();
    }
  );
});

test.describe(
  'サイドバーナビゲーション（未実装）',
  suiteMeta({ precondition: 'admin でログイン済み' }),
  () => {

    test.fixme(
      'モバイル幅でもサイドバーから画面を移動できる',
      caseMeta({
        id: 'NAV-023',
        screen: '共通レイアウト',
        priority: 'P2',
        perspectives: ['display', 'navigation'],
        steps: ['画面サイズを 375×667 にする', 'メニューを開いて店舗一覧を押す'],
        expected: ['/stores に遷移し、一覧が表示される'],
      }),
      async () => {}
    );
  }
);
