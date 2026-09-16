import { test, expect } from '@playwright/test';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe(
  '認証フロー',
  suiteMeta({ precondition: '未ログイン（Cookie をクリア済み）' }),
  () => {
    test.beforeEach(async ({ page }) => {
      // Cookieをクリア
      await page.context().clearCookies();
    });

    test(
      'ログインページが表示される',
      caseMeta({
        id: 'AUTH-001',
        screen: 'ログイン',
        priority: 'P0',
        perspectives: ['display'],
        steps: ['ログインページを開く'],
        expected: [
          '見出し「Welcome Back」が表示される',
          'ユーザー名・パスワード・キャプチャの入力欄が表示される',
          'ログインボタンが表示される',
        ],
        note: 'ログイン成功は各 spec の login() で毎回通過している',
      }),
      async ({ page }) => {
        await page.goto('/login');

        // 新デザイン: カードヘッダーは "Welcome Back"、ブランディングは左パネル
        await expect(page.locator('h3')).toContainText('Welcome Back');
        await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`)).toContainText(
          'ログイン'
        );
      }
    );

    test(
      'バリデーションエラーが表示される',
      caseMeta({
        id: 'AUTH-002',
        screen: 'ログイン',
        priority: 'P1',
        perspectives: ['validation'],
        steps: ['ユーザー名・パスワードを空にする', 'ログインボタンを押す'],
        expected: ['「この項目は必須です」が2件表示される'],
      }),
      async ({ page }) => {
        await page.goto('/login');
        await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

        // フォームにはデフォルト値が入っているので、クリアしてからsubmit
        await page.fill(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, '');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`, '');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`, '');
        await page.click(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`);

        // バリデーションメッセージ (next-intl)
        const requiredMessages = page.locator('text=この項目は必須です');
        await expect(requiredMessages).toHaveCount(2, { timeout: 5000 });
      }
    );

    test(
      'ユーザー名のみ入力でバリデーションエラー',
      caseMeta({
        id: 'AUTH-003',
        screen: 'ログイン',
        priority: 'P1',
        perspectives: ['validation'],
        steps: [
          'ユーザー名に「admin」を入力し、パスワード・キャプチャを空にする',
          'ログインボタンを押す',
        ],
        expected: ['「この項目は必須です」が表示される'],
      }),
      async ({ page }) => {
        await page.goto('/login');
        await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

        // デフォルト値をクリアしてusernameのみ入力
        await page.fill(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, 'admin');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`, '');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`, '');
        await page.click(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`);

        await expect(page.locator('text=この項目は必須です').first()).toBeVisible({
          timeout: 5000,
        });
      }
    );

    test(
      '未認証でダッシュボードにアクセスするとログインページにリダイレクト',
      caseMeta({
        id: 'AUTH-004',
        screen: 'ログイン',
        priority: 'P0',
        perspectives: ['auth'],
        steps: ['ダッシュボード（/）を開く'],
        expected: ['ログインページへリダイレクトされる'],
      }),
      async ({ page }) => {
        await page.goto('/');

        // ログインページにリダイレクトされる
        await expect(page).toHaveURL(/\/login/);
      }
    );

    test(
      '未認証で商品ページにアクセスするとログインページにリダイレクト',
      caseMeta({
        id: 'AUTH-005',
        screen: 'ログイン',
        priority: 'P0',
        perspectives: ['auth'],
        steps: ['商品一覧（/products）を開く'],
        expected: ['ログインページへリダイレクトされる'],
      }),
      async ({ page }) => {
        await page.goto('/products');

        await expect(page).toHaveURL(/\/login/);
      }
    );

    test(
      '誤ったパスワードでログインするとエラーメッセージが表示される',
      caseMeta({
        id: 'AUTH-008',
        screen: 'ログイン',
        priority: 'P1',
        perspectives: ['auth', 'error'],
        steps: ['ユーザー名「admin」と誤ったパスワードを入力する', 'ログインボタンを押す'],
        expected: ['ログインページに留まる', '認証失敗のエラーメッセージが表示される'],
      }),
      async ({ page }) => {
        await page.goto('/login');
        await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

        await page.fill(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, 'admin');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`, 'wrongpassword');
        await page.fill(`[data-testid="${TESTIDS.LOGIN_CAPTCHA}"]`, '');
        await page.click(`[data-testid="${TESTIDS.LOGIN_SUBMIT}"]`);

        // Assert error message is visible and still on login page
        await expect(page.locator(`[data-testid="${TESTIDS.LOGIN_ERROR}"]`)).toBeVisible({
          timeout: 5000,
        });
        await expect(page).toHaveURL(/\/login/);
      }
    );
  }
);

test.describe('ログインフォーム入力', suiteMeta({ precondition: '未ログイン' }), () => {
  test(
    'フォーム入力が正しく動作する',
    caseMeta({
      id: 'AUTH-006',
      screen: 'ログイン',
      priority: 'P1',
      perspectives: ['display'],
      steps: ['ユーザー名に「testuser」、パスワードに「testpass」を入力する'],
      expected: ['入力した値が各欄に反映される'],
    }),
    async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`, { timeout: 10000 });

      const usernameInput = page.locator(`[data-testid="${TESTIDS.LOGIN_USERNAME}"]`);
      const passwordInput = page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`);

      // clear() then fill() to replace default values
      await usernameInput.clear();
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser');

      await passwordInput.clear();
      await passwordInput.fill('testpass');
      await expect(passwordInput).toHaveValue('testpass');
    }
  );

  test(
    'パスワードフィールドがマスクされている',
    caseMeta({
      id: 'AUTH-007',
      screen: 'ログイン',
      priority: 'P1',
      perspectives: ['security'],
      steps: ['ログインページを開く'],
      expected: ['パスワード欄の type が password になっている'],
    }),
    async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator(`[data-testid="${TESTIDS.LOGIN_PASSWORD}"]`);
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  );
});

test.describe('認証フロー（未実装）', suiteMeta({ precondition: '未ログイン' }), () => {
  test.fixme(
    'アクセストークンの期限切れ時にリフレッシュして操作を続けられる',
    caseMeta({
      id: 'AUTH-009',
      screen: 'ログイン',
      priority: 'P1',
      perspectives: ['auth'],
      steps: ['admin でログインする', 'アクセストークンを期限切れにする', '一覧画面で検索する'],
      expected: ['トークンがリフレッシュされる', 'ログインページに戻されず、検索結果が表示される'],
      note: '前提: モックでトークンの期限切れを再現する仕組みが必要',
    }),
    async () => {}
  );

  test.fixme(
    'リフレッシュトークンが無効な場合はログインページへ戻る',
    caseMeta({
      id: 'AUTH-010',
      screen: 'ログイン',
      priority: 'P1',
      perspectives: ['auth'],
      steps: [
        'admin でログインする',
        'リフレッシュトークンを無効にする',
        '一覧画面を再読み込みする',
      ],
      expected: ['ログインページへリダイレクトされる'],
      note: 'plan_0915 A09（認証回復・リダイレクト）/ A13（refresh token の扱い）の回帰確認',
    }),
    async () => {}
  );
});
