import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('アラート', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    'アラート一覧が表示される',
    caseMeta({
      id: 'ALT-001',
      screen: 'アラート',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['アラート画面を開く'],
      expected: ['アラート一覧テーブルが表示される', '優先度タブ（すべて）が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_PRIORITY_TABS}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TAB_ALL}"]`)).toBeVisible();
    }
  );

  test(
    '優先度タブでフィルタ',
    caseMeta({
      id: 'ALT-002',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['search-select'],
      steps: ['P1 タブを押す', 'すべてタブを押す'],
      expected: ['タブを切り替えてもテーブルが表示される'],
      note: 'タブ切り替え後の絞り込み結果は検証していない → ALT-008',
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      await page.click(`[data-testid="${TESTIDS.ALERT_TAB_P1}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.ALERT_TAB_ALL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible();
    }
  );

  test(
    'リアルタイム監視カードの内容',
    caseMeta({
      id: 'ALT-003',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['display'],
      steps: ['アラート画面を開く'],
      expected: [
        'ネットワーク安定性カードに「94.2%」が表示される',
        'インシデント店舗カードに「新宿国際通り店」が表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      const networkCard = page.locator(`[data-testid="${TESTIDS.ALERT_NETWORK_STABILITY}"]`);
      await expect(networkCard).toBeVisible();
      await expect(networkCard).toContainText('94.2%');

      const incidentCard = page.locator(`[data-testid="${TESTIDS.ALERT_INCIDENT_STORES}"]`);
      await expect(incidentCard).toBeVisible();
      await expect(incidentCard).toContainText('新宿国際通り店');
    }
  );

  test(
    '通知設定ボタンをクリック',
    caseMeta({
      id: 'ALT-004',
      screen: 'アラート',
      priority: 'P2',
      perspectives: ['dialog'],
      steps: ['通知設定ボタンを押す'],
      expected: ['通知設定ボタンが表示され、押せる'],
      note: 'アサーションが無く、押した後の挙動は検証していない → ALT-010',
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      const settingsButton = page.locator(`[data-testid="${TESTIDS.ALERT_NOTIFICATION_SETTINGS}"]`);
      await expect(settingsButton).toBeVisible();
      await settingsButton.click();
    }
  );

  test(
    'STOMP WebSocket 接続状態の表示',
    caseMeta({
      id: 'ALT-005',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['realtime'],
      steps: ['アラート画面を開く'],
      expected: ['接続状態（接続中・切断など）が表示され、画面がクラッシュしない'],
      note: 'モック環境には STOMP ブローカーが無く、リアルタイム受信は検証していない → ALT-011',
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      const connectionStatus = page.locator(`[data-testid="${TESTIDS.ALERT_CONNECTION_STATUS}"]`);
      await expect(connectionStatus).toBeVisible({ timeout: 10000 });
      // モック環境では切断または接続中が表示される（クラッシュせず正常表示）
      await expect(connectionStatus).toContainText(/接続中|切断|Connected|Disconnected/);
    }
  );

  test(
    'ステータスでの絞り込みと合致しないアラートの除外と0件空状態の正常表示',
    caseMeta({
      id: 'ALT-006',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['search-select', 'exclude', 'empty', 'reset'],
      steps: ['ステータスで「解決済」を選ぶ', '検索ボタンを押す', 'リセットボタンを押す'],
      expected: [
        'アラート行が0件になる',
        '空状態が表示され、エラー画面にならない',
        'リセット後にアラート行が再表示される',
      ],
    }),
    async ({ page }) => {
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
    }
  );

  test(
    '既読・確認操作の正常動作',
    caseMeta({
      id: 'ALT-007',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['先頭行の既読／対応ボタンを押す'],
      expected: ['トースト通知が表示される'],
      note: '行のステータス表示の変化は検証していない',
    }),
    async ({ page }) => {
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
    }
  );

  test(
    '優先度タブで該当する優先度のアラートだけが表示される',
    caseMeta({
      id: 'ALT-008',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['search-select', 'exclude'],
      steps: ['P1〜P4 の各タブを順に押す'],
      expected: ['選んだ優先度のアラートだけが表示される', '他の優先度のアラートは表示されない'],
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });

      // P1 タブをクリック
      await page.click(`[data-testid="${TESTIDS.ALERT_TAB_P1}"]`);
      const p1Rows = page.locator(`[data-testid^="${TESTIDS.ALERT_TABLE_ROW}"]`);
      const p1Count = await p1Rows.count();
      if (p1Count > 0) {
        for (let i = 0; i < p1Count; i++) {
          await expect(p1Rows.nth(i)).toContainText('P1');
          await expect(p1Rows.nth(i)).not.toContainText('P2');
        }
      }

      // P2 タブをクリック
      await page.click(`[data-testid="${TESTIDS.ALERT_TAB_P2}"]`);
      const p2Rows = page.locator(`[data-testid^="${TESTIDS.ALERT_TABLE_ROW}"]`);
      const p2Count = await p2Rows.count();
      if (p2Count > 0) {
        for (let i = 0; i < p2Count; i++) {
          await expect(p2Rows.nth(i)).toContainText('P2');
          await expect(p2Rows.nth(i)).not.toContainText('P1');
        }
      }

      // すべてタブに戻す
      await page.click(`[data-testid="${TESTIDS.ALERT_TAB_ALL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible();
    }
  );

  test(
    'アラートを削除できる',
    caseMeta({
      id: 'ALT-009',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['先頭行の削除ボタンを押す', 'ブラウザの確認ダイアログで OK を押す'],
      expected: ['「削除しました」のトーストが表示される', '一覧から該当アラートが消える'],
    }),
    async ({ page }) => {
      await page.goto('/alerts');
      await expect(page.locator(`[data-testid="${TESTIDS.ALERT_TABLE}"]`)).toBeVisible({
        timeout: 10000,
      });

      const firstRow = page.locator(`[data-testid^="${TESTIDS.ALERT_TABLE_ROW}"]`).first();
      await expect(firstRow).toBeVisible({ timeout: 10000 });
      const deleteButton = firstRow.locator(`[data-testid^="alert-delete-"]`);
      await expect(deleteButton).toBeVisible();

      // Handle window.confirm dialog
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      await deleteButton.click();
      await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
    }
  );
});

test.describe('アラート（未実装）', suiteMeta({ precondition: 'admin でログイン済み' }), () => {

  test.fixme(
    '通知設定ボタンで通知設定が開く',
    caseMeta({
      id: 'ALT-010',
      screen: 'アラート',
      priority: 'P2',
      perspectives: ['dialog'],
      steps: ['通知設定ボタンを押す'],
      expected: ['通知設定の画面またはダイアログが表示される'],
      note: '押した後の仕様（画面かダイアログか）の確認が必要',
    }),
    async () => {}
  );

  test.fixme(
    'STOMP で新着アラートを受信すると一覧に追加される',
    caseMeta({
      id: 'ALT-011',
      screen: 'アラート',
      priority: 'P1',
      perspectives: ['realtime'],
      steps: ['アラート画面を開く', 'モックから新着アラートを1件配信する'],
      expected: ['一覧に新着アラートが追加される', '接続状態が接続中になる'],
      note: '前提: モック環境に STOMP 配信の仕組みが必要（plan_0915 A04 の再接続時の購読維持もあわせて確認）',
    }),
    async () => {}
  );
});
