import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe(
  'ダッシュボードUI構造',
  suiteMeta({ precondition: 'admin でログイン済み（ログイン直後のダッシュボード）' }),
  () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test(
      'ダッシュボードページが表示される',
      caseMeta({
        id: 'DASH-001',
        screen: 'ダッシュボード',
        priority: 'P0',
        perspectives: ['display'],
        steps: ['ログイン後のダッシュボードを表示する'],
        expected: ['URL がトップ（/）になる', 'メインコンテンツが表示される'],
      }),
      async ({ page }) => {
        await expect(page).toHaveURL(/\/(ja|en)?$/);
        // メインコンテンツエリアが表示される
        await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
      }
    );

    test(
      'ダッシュボードの VRT',
      caseMeta({
        id: 'DASH-002',
        screen: 'ダッシュボード',
        priority: 'P2',
        perspectives: ['vrt'],
        steps: [
          '時刻を 2026-06-01 10:00 に固定する',
          'ダッシュボードを開く',
          'ページ全体のスクリーンショットを撮る',
        ],
        expected: ['基準画像 dashboard.png と一致する（許容差 0.2）'],
      }),
      async ({ page }) => {
        await page.clock.setFixedTime(new Date('2026-06-01T10:00:00+09:00'));
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('dashboard.png', {
          fullPage: true,
          threshold: 0.2,
        });
      }
    );

    test(
      'KPIカード4枚が正常に表示される',
      caseMeta({
        id: 'DASH-003',
        screen: 'ダッシュボード',
        priority: 'P0',
        perspectives: ['display'],
        steps: ['ダッシュボードを表示する'],
        expected: [
          '上段の KPI（売上高・在庫切れSKU・稼働店舗・休業中アラート）が表示される',
          '下段の KPI（システム稼働率・新規顧客・平均客単価）が表示される',
        ],
        note: 'カードのタイトルのみ確認し、値は検証していない → DASH-007',
      }),
      async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // 上段4枚のKPIカードタイトルがすべて表示されていること
        await expect(page.getByText('売上高')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('在庫切れSKU')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('稼働店舗')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('休業中アラート')).toBeVisible({ timeout: 10000 });

        // それぞれのバッジや補助情報が表示されていること
        await expect(page.getByText('本日')).toBeVisible();
        await expect(page.getByText('営業中')).toBeVisible();

        // 下段KPIカードも表示されていること
        await expect(page.getByText('システム稼働率')).toBeVisible();
        await expect(page.getByText('新規顧客')).toBeVisible();
        await expect(page.getByText('平均客単価')).toBeVisible();
      }
    );

    test(
      '売上推移グラフの7日・30日・1年タブ切り替えとグラフ描画',
      caseMeta({
        id: 'DASH-004',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['display'],
        steps: [
          '7日間タブ（初期表示）のグラフを確認する',
          '30日タブを押す',
          '1年タブを押す',
          '7日間タブに戻す',
        ],
        expected: [
          '各タブでグラフが描画される',
          '「売上推移データを取得できません」が表示されない',
        ],
      }),
      async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // 売上推移が表示され、エラー表示がないこと
        await expect(page.getByText('売上推移')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();

        // 7日間タブ（デフォルト）でSVGグラフが描画されていること
        const chartSurface = mainContent.locator('.recharts-surface').first();
        await expect(chartSurface).toBeVisible({ timeout: 10000 });

        // 30日タブをクリックして切り替え
        const tab30d = page.getByRole('tab', { name: '30日' });
        await expect(tab30d).toBeVisible({ timeout: 10000 });
        await tab30d.click();
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
        await expect(chartSurface).toBeVisible();

        // 1年タブをクリックして切り替え
        const tab1y = page.getByRole('tab', { name: '1年' });
        await expect(tab1y).toBeVisible({ timeout: 10000 });
        await tab1y.click();
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
        await expect(chartSurface).toBeVisible();

        // 再度7日間タブに戻す
        const tab7d = page.getByRole('tab', { name: '7日間' });
        await tab7d.click();
        await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
        await expect(chartSurface).toBeVisible();
      }
    );

    test(
      'アラートパネルの表示と各行のクリック動作',
      caseMeta({
        id: 'DASH-005',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['display', 'navigation'],
        steps: ['アラート情報パネルの先頭行を押す'],
        expected: ['アラート情報パネルが表示される', 'アラート画面（/alerts）へ遷移する'],
      }),
      async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // アラート情報のヘッダーが表示され、ErrorBoundaryでキャッチされていないこと
        await expect(page.getByText('アラート情報')).toBeVisible({ timeout: 10000 });

        // アラート行が表示されていること
        const alertItem = page.getByTestId('alert-item-dashboard-alert-1');
        await expect(alertItem).toBeVisible({ timeout: 10000 });

        // アラート行をクリックすると対応するページ（/alerts）に遷移すること
        await alertItem.click();
        await expect(page).toHaveURL(/\/alerts/);
      }
    );

    test(
      'アラートパネルのすべてのアラートを表示リンク動作',
      caseMeta({
        id: 'DASH-006',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['navigation'],
        steps: ['「すべてのアラートを表示」を押す'],
        expected: ['アラート画面（/alerts）へ遷移する'],
      }),
      async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // 「すべてのアラートを表示」ボタンをクリックすると /alerts に遷移すること
        const viewAllBtn = page.getByRole('button', { name: 'すべてのアラートを表示' });
        await expect(viewAllBtn).toBeVisible({ timeout: 10000 });
        await viewAllBtn.click();
        await expect(page).toHaveURL(/\/alerts/);
      }
    );

    test(
      'KPIカードにモックデータの値が表示される',
      caseMeta({
        id: 'DASH-007',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['display'],
        steps: ['ダッシュボードを表示する'],
        expected: ['各 KPI カードにモック API の値が正しい書式で表示される'],
      }),
      async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // 売上高: 107,316
        await expect(mainContent.getByText(/107,316/)).toBeVisible({ timeout: 10000 });
        // 在庫切れSKU: 7 SKU
        await expect(mainContent.getByText('7 SKU')).toBeVisible({ timeout: 10000 });
        // 稼働店舗: 29/30店舗
        await expect(mainContent.getByText(/29\/30/)).toBeVisible({ timeout: 10000 });
        // 休業中アラート: 218
        await expect(mainContent.getByText(/218/)).toBeVisible({ timeout: 10000 });
        // システム稼働率: 99.98%
        await expect(mainContent.getByText('99.98%')).toBeVisible({ timeout: 10000 });
      }
    );

    test(
      '売上推移 API がエラーのときエラー表示になる',
      caseMeta({
        id: 'DASH-008',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['error'],
        steps: ['売上推移 API が 500 を返す状態でダッシュボードを開く'],
        expected: ['「売上推移データを取得できません」が表示される', '他のパネルは表示されたまま'],
        note: '前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
      }),
      async ({ page, request }) => {
        const mockPort = process.env.MOCK_PORT || 8095;
        // Inject 500 error on sales trend API
        await request.post(`http://localhost:${mockPort}/__mock/error`, {
          data: { route: '/retail/dashboard/sales-trend', status: 500 },
        });

        try {
          await page.goto('/');
          await page.waitForLoadState('domcontentloaded');
          const mainContent = page.getByRole('main');
          await expect(mainContent).toBeVisible({ timeout: 15000 });

          // 売上推移データを取得できません が表示されること
          await expect(page.getByText('売上推移データを取得できません')).toBeVisible({ timeout: 10000 });

          // 他のパネル（売上高KPI、アラート情報等）は表示されたまま
          await expect(page.getByText('売上高')).toBeVisible();
          await expect(page.getByText('アラート情報')).toBeVisible();
        } finally {
          // Reset mock error injection
          await request.post(`http://localhost:${mockPort}/__mock/reset`);
        }
      }
    );
  }
);

test.describe(
  'ダッシュボード（未実装）',
  suiteMeta({ precondition: 'admin でログイン済み' }),
  () => {

    test.fixme(
      'KPI API がエラーのとき正常値に見える値を表示しない',
      caseMeta({
        id: 'DASH-009',
        screen: 'ダッシュボード',
        priority: 'P1',
        perspectives: ['error'],
        steps: ['KPI API が 500 または欠損データを返す状態でダッシュボードを開く'],
        expected: [
          '稼働率 99.98% などの正常値に見える値が表示されない',
          '取得できなかったことが分かる表示になる',
        ],
        note: 'plan_0915 A03（障害値の偽造是正）の回帰確認。前提: mock-server にエラー応答へ切り替える仕組みが必要（e2e-test-policy.md §5）',
      }),
      async () => {}
    );
  }
);
