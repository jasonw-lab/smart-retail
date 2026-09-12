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
});
