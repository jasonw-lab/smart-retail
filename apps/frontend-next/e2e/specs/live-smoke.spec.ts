import { test, expect } from '@playwright/test';
import { TESTIDS } from '../testids';

test.describe('実バックエンド結合スモークテスト', () => {
  test('ログイン〜ダッシュボード〜主要画面巡回がエラーなく完了する', async ({ page }) => {
    // 1. ログイン画面へアクセス
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // 2. 「管理者 (admin)」ボタンをクリックして自動入力
    const adminBtn = page.getByRole('button', { name: /管理者/ });
    await expect(adminBtn).toBeVisible({ timeout: 10000 });
    await adminBtn.click();
    await page.waitForTimeout(300);

    // 3. ログインボタンをクリック
    await page.click('button[type="submit"]');

    // 4. ダッシュボードへ遷移したことを確認
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    const main = page.getByRole('main');
    await expect(main).toBeVisible({ timeout: 10000 });

    // 4. アラートパネル・KPIカード・売上推移グラフがクラッシュなく表示されていること
    await expect(page.getByText('アラート情報')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('売上推移')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: '/Users/wangjw/.gemini/antigravity-cli/brain/2180a589-96a7-4151-bbcc-9d952783e29c/dashboard_7d_screenshot.png',
      fullPage: true,
    });

    // 売上推移「1年」タブの切り替え＆描画検証（2026年通年データ）
    const yearTab = page.getByRole('tab', { name: '1年' });
    await expect(yearTab).toBeVisible({ timeout: 10000 });
    await yearTab.click();
    await expect(page.getByText('売上推移データを取得できません')).not.toBeVisible();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/Users/wangjw/.gemini/antigravity-cli/brain/2180a589-96a7-4151-bbcc-9d952783e29c/dashboard_1y_screenshot.png',
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
    // 初期状態で両方が存在することを確認
    await expect(page.getByText('おにぎり').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('サラダ').first()).toBeVisible({ timeout: 10000 });

    // 「おにぎり」を入力して検索
    await productInput.fill('おにぎり');
    await page.click('button:has-text("Search"), button:has-text("検索")');

    // 「おにぎり」が表示され、「サラダ」が除外されることを検証
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
    const firstRowLink = page.locator(`[data-testid^="${TESTIDS.TRANSACTION_DETAIL_LINK}"]`).first();
    await expect(firstRowLink).toBeVisible({ timeout: 10000 });
    const targetOrder = (await firstRowLink.textContent())?.trim() || '';
    expect(targetOrder).not.toBe('');

    const secondRowLink = page.locator(`[data-testid^="${TESTIDS.TRANSACTION_DETAIL_LINK}"]`).nth(1);
    const excludeOrder = (await secondRowLink.textContent())?.trim() || '';

    // 注文番号で検索
    const orderInput = page.getByPlaceholder('例: ORD-0099');
    await orderInput.fill(targetOrder);
    await page.click('button:has-text("Search"), button:has-text("検索")');

    // 検索対象が表示され、別注文番号が除外されることを検証
    await expect(page.getByText(targetOrder).first()).toBeVisible({ timeout: 10000 });
    if (excludeOrder && excludeOrder !== targetOrder) {
      await expect(page.getByText(excludeOrder)).toHaveCount(0, { timeout: 10000 });
    }
    await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
  });
});
