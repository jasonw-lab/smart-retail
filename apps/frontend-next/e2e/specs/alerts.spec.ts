import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';

test.describe('アラート', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('アラート一覧が表示される', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_PRIORITY_TABS}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TAB_ALL}"]`)).toBeVisible();
  });

  test('優先度タブでフィルタ', async ({ page }) => {
    await page.goto('/alerts');
    await page.click(`[data-testid="${TESTIDS.ALERT_TAB_P1}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible();
    await page.click(`[data-testid="${TESTIDS.ALERT_TAB_ALL}"]`);
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible();
  });

  test('リアルタイム監視カードの内容', async ({ page }) => {
    await page.goto('/alerts');
    const networkCard = page.locator(`[data-testid="${TESTIDS.ALERT_NETWORK_STABILITY}"]`);
    await expect(networkCard).toBeVisible();
    await expect(networkCard).toContainText('94.2%');

    const incidentCard = page.locator(`[data-testid="${TESTIDS.ALERT_INCIDENT_STORES}"]`);
    await expect(incidentCard).toBeVisible();
    await expect(incidentCard).toContainText('新宿国際通り店');
  });

  test('通知設定ボタンをクリック', async ({ page }) => {
    await page.goto('/alerts');
    const settingsButton = page.locator(`[data-testid="${TESTIDS.ALERT_NOTIFICATION_SETTINGS}"]`);
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
  });

  test('STOMP WebSocket 接続状態の表示', async ({ page }) => {
    await page.goto('/alerts');
    const connectionStatus = page.locator(`[data-testid="${TESTIDS.ALERT_CONNECTION_STATUS}"]`);
    await expect(connectionStatus).toBeVisible({ timeout: 10000 });
    // モック環境では切断または接続中が表示される（クラッシュせず正常表示）
    await expect(connectionStatus).toContainText(/接続中|切断|Connected|Disconnected/);
  });

  test('種別・ステータスでの絞り込みと合致しないアラートの除外と0件空状態の正常表示', async ({
    page,
  }) => {
    await page.goto('/alerts');
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });

    // 初期状態でアラート行が存在することを確認
    const alertRows = page.locator(`[data-testid^="${TESTIDS.ALERT_TABLE_ROW}"]`);
    await expect(alertRows.first()).toBeVisible({ timeout: 10000 });

    // ステータス「解決済」（モックデータには未対応と対応中しかないため該当なし）を選択
    const statusSelect = page.locator(`[data-testid="${TESTIDS.ALERT_FILTER_STATUS}"]`);
    await statusSelect.click();
    await page.getByRole('option', { name: /解決済|Resolved/ }).click();

    // 検索実行
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_SEARCH}"]`);

    // 合致しないアラートが除外され 0 件となることを検証
    await expect(alertRows).toHaveCount(0);

    // 0件空状態が正常に表示される（クラッシュゼロ）
    await expect(page.locator(`[data-testid="${TESTIDS.EMPTY_STATE}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="${TESTIDS.ERROR_BOUNDARY}"]`)).not.toBeVisible();

    // リセットボタンで元に戻ることを検証
    await page.click(`[data-testid="${TESTIDS.FILTER_BAR_RESET}"]`);
    await expect(alertRows).not.toHaveCount(0);
  });

  test('既読・確認操作の正常動作', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
      timeout: 10000,
    });

    const toggleBtn = page.locator(`[data-testid^="alert-toggle-read-"]`).first();
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });

    // 既読/対応ボタンをクリック
    await toggleBtn.click();

    // トースト通知が表示され、エラーが発生しないことを検証
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
  });
});
