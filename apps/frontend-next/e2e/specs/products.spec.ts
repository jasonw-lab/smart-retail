import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('商品管理UI構造', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    '商品一覧ページの構造確認',
    caseMeta({
      id: 'PRD-101',
      screen: '商品管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['商品一覧を開く'],
      expected: ['メイン領域と見出しが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');

      // ページタイトルまたはエラー境界が表示される
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible({ timeout: 15000 });

      // h1タイトルが表示される
      await expect(mainContent.locator('h1')).toBeVisible({ timeout: 10000 });
    }
  );

  test(
    '商品一覧ページの VRT',
    caseMeta({
      id: 'PRD-102',
      screen: '商品管理',
      priority: 'P2',
      perspectives: ['vrt'],
      steps: ['商品一覧を開き、通信が落ち着くまで待つ', 'ページ全体のスクリーンショットを撮る'],
      expected: ['基準画像 products-list.png と一致する（許容差 0.2）'],
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('products-list.png', {
        fullPage: true,
        threshold: 0.2,
        maxDiffPixelRatio: 0.05,
      });
    }
  );

  test(
    '商品一覧テーブルが表示される',
    caseMeta({
      id: 'PRD-103',
      screen: '商品管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['商品一覧を開く'],
      expected: ['テーブルが表示される'],
      note: 'PRD-001 とほぼ同じ内容',
    }),
    async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');

      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible({ timeout: 15000 });

      // テーブルが表示される（データ読み込み完了後）
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    }
  );

  test(
    '商品新規作成ページの構造確認',
    caseMeta({
      id: 'PRD-104',
      screen: '商品管理',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['/products/new を開く'],
      expected: ['見出し・フォーム・送信ボタンが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/products/new');
      await page.waitForLoadState('domcontentloaded');

      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible({ timeout: 15000 });

      // ページタイトル
      await expect(mainContent.locator('h1')).toBeVisible({ timeout: 10000 });

      // フォームが存在する
      await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

      // 送信ボタンが存在する
      await expect(page.locator('button[type="submit"]')).toBeVisible({
        timeout: 10000,
      });
    }
  );
});

test.describe(
  '商品フォームバリデーション',
  suiteMeta({ precondition: 'admin でログイン済み' }),
  () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test(
      '必須フィールドのバリデーション',
      caseMeta({
        id: 'PRD-105',
        screen: '商品管理',
        priority: 'P1',
        perspectives: ['validation'],
        steps: ['/products/new を開く', '何も入力せず送信する'],
        expected: ['入力エラーが表示される'],
        note: 'PRD-003 と重複',
      }),
      async ({ page }) => {
        await page.goto('/products/new');
        await page.waitForLoadState('domcontentloaded');

        // フォームが表示されるまで待機
        await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

        // 空のままsubmit
        await page.click('button[type="submit"]');

        // バリデーションエラーが表示される（エラー要素の存在確認）
        // 具体的なテキストではなく、エラー表示の存在を確認
        await expect(
          page.locator('[class*="error"], [class*="Error"], .text-error, .text-destructive').first()
        ).toBeVisible({ timeout: 5000 });
      }
    );
  }
);
