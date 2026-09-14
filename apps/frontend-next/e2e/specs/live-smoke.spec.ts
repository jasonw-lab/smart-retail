import { test, expect } from '@playwright/test';

test.describe('実バックエンド結合スモークテスト', () => {
  test('ログイン〜ダッシュボード〜主要画面巡回がエラーなく完了する', async ({ page }) => {
    // 1. ログイン画面へアクセス
    await page.goto('/ja/login');
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });

    // 2. ログイン実行
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // 3. ダッシュボードへ遷移したことを確認
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    const main = page.getByRole('main');
    await expect(main).toBeVisible({ timeout: 10000 });

    // 4. アラートパネル・KPIカードがクラッシュなく表示されていること
    await expect(page.getByText('アラート情報')).toBeVisible({ timeout: 10000 });
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
  });
});
