import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';
import { resetMockData, injectMockError } from '../fixtures/mock-helper';

test.describe('エラー処理', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await resetMockData();
    await login(page);
  });

  test(
    '一覧 API が 500 を返すとエラー画面と再試行ボタンが表示される',
    caseMeta({
      id: 'ERR-001',
      screen: '全画面共通',
      priority: 'P1',
      perspectives: ['error'],
      steps: ['店舗一覧 API が 500 を返す状態で店舗一覧を開く'],
      expected: [
        'エラー画面（再試行ボタン）が表示される',
        'レイアウト（ヘッダー・サイドバー）は表示されたまま',
      ],
      note: '前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
    }),
    async ({ page }) => {
      await injectMockError('/retail/stores', 500);
      await page.goto('/stores');

      await expect(page.locator(`[data-testid="${TESTIDS.ERROR_BOUNDARY}"]`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByRole('button', { name: '再試行' })).toBeVisible();
      // Verify layout components (header / sidebar navigation) remain visible
      await expect(page.getByRole('heading', { name: 'SmartRetail Pro' })).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.LAYOUT_SIDEBAR}"]`).first()).toBeVisible();
    }
  );

  test(
    'API が回復した後に再試行ボタンで一覧が表示される',
    caseMeta({
      id: 'ERR-002',
      screen: '全画面共通',
      priority: 'P1',
      perspectives: ['error'],
      steps: ['ERR-001 の状態から API を正常に戻す', '再試行ボタンを押す'],
      expected: ['一覧が表示される'],
      note: '前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
    }),
    async ({ page }) => {
      await injectMockError('/retail/stores', 500);
      await page.goto('/stores');

      await expect(page.locator(`[data-testid="${TESTIDS.ERROR_BOUNDARY}"]`)).toBeVisible({
        timeout: 10000,
      });
      const retryBtn = page.getByRole('button', { name: '再試行' });
      await expect(retryBtn).toBeVisible();

      // Reset mock data so API returns 200 OK
      await resetMockData();

      // Click retry
      await retryBtn.click();

      // Store table should now be rendered
      await expect(page.locator(`[data-testid="${TESTIDS.STORE_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator(`[data-testid="${TESTIDS.ERROR_BOUNDARY}"]`)).not.toBeVisible();
    }
  );

  test(
    '登録 API が失敗すると失敗のトーストが表示され入力が保持される',
    caseMeta({
      id: 'ERR-003',
      screen: '全画面共通',
      priority: 'P1',
      perspectives: ['error', 'create'],
      steps: ['店舗登録 API が 500 を返す状態で店舗を登録する'],
      expected: [
        '失敗のトーストが表示される',
        '入力した内容が消えない',
        '登録リクエストは1回だけ送信される',
      ],
      note: 'plan_0915 A02（非冪等リクエストの自動再送）の回帰確認。前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
    }),
    async ({ page }) => {
      await page.goto('/stores/new');
      await page.waitForURL(/\/stores\/new$/, { timeout: 10000 });

      const codeInput = page.locator(`[data-testid="${TESTIDS.STORE_FORM_CODE}"]`);
      const nameInput = page.locator(`[data-testid="${TESTIDS.STORE_FORM_NAME}"]`);
      await codeInput.fill('STR-FAIL');
      await nameInput.fill('失敗店舗テスト');

      // Inject 500 error only on POST /retail/stores
      await injectMockError('/retail/stores', 500, 'POST');

      let postCount = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && req.url().includes('/retail/stores')) {
          postCount++;
        }
      });

      await page.click(`[data-testid="${TESTIDS.STORE_FORM_SUBMIT}"]`);

      // Verify failure toast
      await expect(page.getByText('登録に失敗しました')).toBeVisible({ timeout: 5000 });

      // Verify form input values are preserved
      await expect(codeInput).toHaveValue('STR-FAIL');
      await expect(nameInput).toHaveValue('失敗店舗テスト');

      // Verify request was sent once (non-idempotent POST is not automatically retried)
      expect(postCount).toBe(1);
    }
  );

  test.fixme(
    'API がタイムアウトしても画面が固まらずエラー表示になる',
    caseMeta({
      id: 'ERR-004',
      screen: '全画面共通',
      priority: 'P2',
      perspectives: ['error'],
      steps: ['一覧 API の応答を大きく遅延させて一覧を開く'],
      expected: ['タイムアウト後にエラー表示になる', '他の操作ができる'],
      note: 'plan_0915 A12（タイムアウトと中断の維持）の回帰確認。前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
    }),
    async () => {}
  );
});
