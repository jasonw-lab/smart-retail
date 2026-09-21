import { test, expect } from '@playwright/test';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe(
  '実バックエンド結合スモークテスト',
  suiteMeta({ precondition: '実バックエンドと Next.js（:3001）が起動済み（pnpm test:smoke）' }),
  () => {
    test.beforeAll(async ({ request }) => {
      // 1. 実バックエンドの疎通とヘルスチェックを確認 (C3対応)
      const res = await request.get('/api/health');
      expect(res.ok()).toBeTruthy();
      const health = await res.json();
      expect(health.status).toBe('healthy');
      expect(health.checks?.backend?.status).toBe('ok');
      console.log(
        `[LIVE-SMOKE] Backend verified: ok (latency: ${health.checks?.backend?.responseTimeMs}ms)`
      );
    });

    test(
      'ログイン〜ダッシュボード〜主要画面巡回がエラーなく完了する',
      caseMeta({
        id: 'LIVE-001',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['smoke', 'search-text', 'exclude'],
        steps: [
          'ログイン画面で「管理者 (admin)」を押して実ログインする',
          'ダッシュボードの売上推移で 1年・30日タブを切り替える',
          '商品・店舗・在庫・デバイス・取引履歴を順に開く',
          '在庫で「おにぎり」、取引履歴で先頭行の注文番号を検索する',
        ],
        expected: [
          'どの画面もエラー画面にならず実データが取得される',
          '在庫の検索でサラダが除外される',
          '取引履歴の検索で別の注文番号が除外される',
        ],
      }),
      async ({ page }, testInfo) => {
        // エラー収集 (C1対応)
        const pageErrors: Error[] = [];
        page.on('pageerror', (err) => pageErrors.push(err));
        const failedProxyCalls: string[] = [];
        page.on('response', (res) => {
          if (res.url().includes('/api/proxy/') && res.status() >= 400) {
            failedProxyCalls.push(`${res.status()} ${res.url()}`);
          }
        });

        // 1. ログイン画面へアクセス
        await page.goto('/login');
        await page.waitForLoadState('domcontentloaded');

        // 2. 「管理者 (admin)」ボタンをクリックして自動入力
        const adminBtn = page.getByRole('button', { name: /管理者/ });
        await expect(adminBtn).toBeVisible({ timeout: 10000 });
        await adminBtn.click();
        await page.waitForTimeout(300);

        // 3. ログインボタンをクリック（実認証レスポンスを検証: C3対応）
        const loginPromise = page.waitForResponse(
          (res) => res.url().includes('/api/auth/login') && res.request().method() === 'POST'
        );
        await page.click('button[type="submit"]');
        const loginRes = await loginPromise;
        expect(loginRes.status()).toBe(200);
        const loginData = await loginRes.json();
        expect(loginData.mock).toBeUndefined(); // 実バックエンドJWT認証であることを確認

        // 4. ダッシュボードへ遷移したことを確認
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
        const main = page.getByRole('main');
        await expect(main).toBeVisible({ timeout: 10000 });

        // アラートパネル・KPIカード・売上推移グラフがクラッシュなく表示されていること
        await expect(page.getByText('アラート情報')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('売上推移')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: testInfo.outputPath('dashboard_7d_screenshot.png'),
          fullPage: true,
        });

        // 売上推移「1年」タブの切り替え＆描画検証（2026年通年データ）
        const yearTab = page.getByRole('tab', { name: '1年' });
        await expect(yearTab).toBeVisible({ timeout: 10000 });
        await yearTab.click();
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: testInfo.outputPath('dashboard_1y_screenshot.png'),
          fullPage: true,
        });

        // 売上推移「30日」タブの切り替え＆描画検証
        const monthTab = page.getByRole('tab', { name: '30日' });
        await expect(monthTab).toBeVisible({ timeout: 10000 });
        await monthTab.click();
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();

        // ErrorBoundary が発火していないこと
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();

        // 5. 主要画面巡回（商品一覧）
        await page.goto('/ja/products');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();

        // 6. 主要画面巡回（店舗一覧）
        await page.goto('/ja/stores');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();

        // 7. 主要画面巡回（在庫一覧）
        await page.goto('/ja/inventory');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();

        // 実バックエンド結合での検索条件検証（「おにぎり」検索で「サラダ」が除外されること）
        const productInput = page.getByPlaceholder('商品名を入力...');
        await expect(productInput).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('おにぎり').first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('サラダ').first()).toBeVisible({ timeout: 10000 });

        await productInput.fill('おにぎり');
        await page.click('button:has-text("Search"), button:has-text("検索")');

        await expect(page.getByText('おにぎり').first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('サラダ')).toHaveCount(0, { timeout: 10000 });

        // 8. 主要画面巡回（デバイス一覧）
        await page.goto('/ja/devices');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();

        // 9. 主要画面巡回（取引履歴）
        await page.goto('/ja/transactions');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(page.locator(`[data-testid="${TESTIDS.TRANSACTION_TABLE}"]`)).toBeVisible({
          timeout: 10000,
        });
        await expect(
          page.locator(`[data-testid="${TESTIDS.TRANSACTION_SUMMARY_SALES}"]`)
        ).toBeVisible();

        // 実DBデータを用いた絞り込み・除外検証
        const firstRowLink = page
          .locator(`[data-testid^="${TESTIDS.TRANSACTION_DETAIL_LINK}"]`)
          .first();
        await expect(firstRowLink).toBeVisible({ timeout: 10000 });
        const targetOrder = (await firstRowLink.textContent())?.trim() || '';
        expect(targetOrder).not.toBe('');

        const secondRowLink = page
          .locator(`[data-testid^="${TESTIDS.TRANSACTION_DETAIL_LINK}"]`)
          .nth(1);
        const excludeOrder = (await secondRowLink.textContent())?.trim() || '';

        const orderInput = page.getByPlaceholder('例: ORD-0099');
        await orderInput.fill(targetOrder);
        await page.click('button:has-text("Search"), button:has-text("検索")');

        await expect(page.getByText(targetOrder).first()).toBeVisible({ timeout: 10000 });
        if (excludeOrder && excludeOrder !== targetOrder) {
          await expect(page.getByText(excludeOrder)).toHaveCount(0, { timeout: 10000 });
        }
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        expect(pageErrors).toHaveLength(0);
        expect(failedProxyCalls).toHaveLength(0);
      }
    );

    test(
      'システム管理画面巡回および実データ検証（8機能＋辞書項目・検索API疎通）が完了する',
      caseMeta({
        id: 'LIVE-002',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['smoke', 'display', 'search-text', 'navigation'],
        steps: [
          'ログイン画面で管理者として実ログインする',
          'システム管理配下の全画面（ユーザー・ロール・部門・メニュー・辞書・辞書項目・ログ・設定・通知）を巡回する',
          '各画面で実バックエンド由来のデータ表示と検索API疎通を確認する',
        ],
        expected: [
          'どの画面もエラー画面にならず実データが表示される',
          '辞書一覧から辞書項目画面へ遷移し実項目データが取得される',
          'ブラウザのpageerrorおよび/api/proxy/の4xx/5xxエラーが0件である',
        ],
      }),
      async ({ page }) => {
        // エラー収集 (C1対応)
        const pageErrors: Error[] = [];
        page.on('pageerror', (err) => {
          console.log(`[PAGEERROR on ${page.url()}]:`, err.message);
          pageErrors.push(err);
        });
        const failedProxyCalls: string[] = [];
        page.on('response', (res) => {
          if (res.url().includes('/api/proxy/') && res.status() >= 400) {
            failedProxyCalls.push(`${res.status()} ${res.url()}`);
          }
        });

        // 1. ログイン画面へアクセス & ログイン
        await page.goto('/login');
        await page.waitForLoadState('domcontentloaded');
        const adminBtn = page.getByRole('button', { name: /管理者/ });
        await expect(adminBtn).toBeVisible({ timeout: 10000 });
        await adminBtn.click();
        await page.waitForTimeout(300);
        await page.click('button[type="submit"]');

        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
        const main = page.getByRole('main');
        await expect(main).toBeVisible({ timeout: 10000 });

        // 2. ユーザー管理（実データ 'admin' の表示 & 検索API疎通: C1, C5対応）
        await page.goto('/system/user');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(page.locator('tbody').getByText('admin').first()).toBeVisible({ timeout: 10000 });

        // ユーザー検索の実行と結果確認
        const userSearchInput = page.getByPlaceholder(/キーワード|ユーザー名|Search/i).first();
        if (await userSearchInput.isVisible()) {
          await userSearchInput.fill('admin');
          const userSearchPromise = page.waitForResponse(
            (res) => res.url().includes('/api/proxy/api/v1/users') && res.status() === 200
          );
          await page.click('button:has-text("Search"), button:has-text("検索")');
          await userSearchPromise;
          await expect(page.locator('tbody').getByText('admin').first()).toBeVisible({ timeout: 10000 });
        }

        // 3. ロール管理（実データ 'ADMIN' の表示）
        await page.goto('/system/role');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByText(/ADMIN|DEMO_ADMIN/).first()).toBeVisible({ timeout: 10000 });

        // 4. 部門管理（実データ '演示' の表示）
        await page.goto('/system/dept');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByText(/演示/).first()).toBeVisible({ timeout: 10000 });

        // 5. メニュー管理（メニュー一覧の表示）
        await page.goto('/system/menu');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByRole('table')).toBeVisible({ timeout: 10000 });

        // 6. 辞書管理（実データ 'gender' の表示: C1, C4対応）
        await page.goto('/system/dict');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(page.locator('tbody').getByText('gender').first()).toBeVisible({ timeout: 10000 });

        // 7. 辞書項目管理（C4対応: 辞書行のアクションから辞書項目へ遷移し、実データ表示を確認）
        const dictItemsBtn = page.locator('tbody tr').first().getByRole('button', { name: /^(Items|辞書項目)$/ });
        await expect(dictItemsBtn).toBeVisible({ timeout: 10000 });
        await dictItemsBtn.click();
        await page.waitForURL((url) => url.pathname.includes('/system/dict/'), { timeout: 10000 });
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(page.locator('tbody').getByText(/男|女|保密/).first()).toBeVisible({ timeout: 10000 });

        // 8. ログ管理（ログ一覧画面の正常表示）
        await page.goto('/system/log');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByText(/操作ログ|ログ|Log/i).first()).toBeVisible({ timeout: 10000 });

        // 9. システム設定（設定画面の正常表示 & 実データ IP_QPS_THRESHOLD_LIMIT 検証: C1対応）
        await page.goto('/system/config');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByText(/系统限流QPS|IP_QPS_THRESHOLD_LIMIT/).first()).toBeVisible({ timeout: 10000 });

        // 10. 通知公告（通知画面の正常表示）
        await page.goto('/system/notice');
        await expect(main).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
        await expect(main.getByText(/通知公告|Notices/i).first()).toBeVisible({ timeout: 10000 });

        // エラー収集結果の検証 (C1対応: エラー0件)
        expect(pageErrors).toHaveLength(0);
        expect(failedProxyCalls).toHaveLength(0);
      }
    );
  }
);
