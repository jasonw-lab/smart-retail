import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('ダッシュボードUI構造', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('ダッシュボードページが表示される', async ({ page }) => {
    await expect(page).toHaveURL(/\/(ja|en)?$/);
    // メインコンテンツエリアが表示される
    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
  });

  test('ダッシュボードの VRT', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-01T10:00:00+09:00'));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('KPIカード4枚が正常に表示される', async ({ page }) => {
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
  });

  test('売上推移グラフの7日・30日・1年タブ切り替えとグラフ描画', async ({ page }) => {
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
  });

  test('アラートパネルの表示と各行のクリック動作', async ({ page }) => {
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
  });

  test('アラートパネルのすべてのアラートを表示リンク動作', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible({ timeout: 15000 });

    // 「すべてのアラートを表示」ボタンをクリックすると /alerts に遷移すること
    const viewAllBtn = page.getByRole('button', { name: 'すべてのアラートを表示' });
    await expect(viewAllBtn).toBeVisible({ timeout: 10000 });
    await viewAllBtn.click();
    await expect(page).toHaveURL(/\/alerts/);
  });
});
