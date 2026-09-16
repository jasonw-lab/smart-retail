import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('プロフィール', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    'プロフィール画面にログインユーザーの情報が表示される',
    caseMeta({
      id: 'PRF-001',
      screen: 'プロフィール',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['/profile を開く'],
      expected: [
        '見出し「プロフィール」が表示される',
        'ユーザー名 admin と基本情報（ニックネーム・メール・電話番号）が表示される',
      ],
    }),
    async ({ page }) => {
      await page.goto('/profile');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await expect(main.locator('h1')).toHaveText('プロフィール');
      await expect(main.getByText('admin', { exact: true })).toBeVisible();
      await expect(page.locator('#nickname')).toHaveValue('管理者');
      await expect(page.locator('#email')).toHaveValue('admin@example.com');
      await expect(page.locator('#mobile')).toHaveValue('13800138000');
    }
  );

  test(
    '基本情報を更新できる',
    caseMeta({
      id: 'PRF-002',
      screen: 'プロフィール',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['ニックネームを変更して更新ボタンを押す'],
      expected: ['「プロフィールを更新しました」が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/profile');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await page.fill('#nickname', '管理者更新');
      await page.getByRole('button', { name: '更新' }).click();
      await expect(page.getByText('プロフィールを更新しました')).toBeVisible();
    }
  );

  test(
    '確認用パスワードが一致しないと入力エラーになる',
    caseMeta({
      id: 'PRF-003',
      screen: 'プロフィール',
      priority: 'P1',
      perspectives: ['validation'],
      steps: ['新しいパスワードと確認用に異なる値を入力する', 'パスワードを変更ボタンを押す'],
      expected: ['「新しいパスワードと確認用パスワードが一致しません」が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/profile');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await page.fill('#currentPassword', '123456');
      await page.fill('#newPassword', 'password123');
      await page.fill('#confirmPassword', 'different123');
      await page.getByRole('button', { name: 'パスワードを変更' }).click();
      await expect(page.getByText('新しいパスワードと確認用パスワードが一致しません')).toBeVisible();
    }
  );

  test(
    'パスワードを変更できる',
    caseMeta({
      id: 'PRF-004',
      screen: 'プロフィール',
      priority: 'P1',
      perspectives: ['update'],
      steps: [
        '現在のパスワード・新しいパスワード・確認用を入力する',
        'パスワードを変更ボタンを押す',
      ],
      expected: ['「パスワードを変更しました」が表示される', 'パスワードの入力欄が空に戻る'],
    }),
    async ({ page }) => {
      await page.goto('/profile');
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 15000 });
      await page.fill('#currentPassword', '123456');
      await page.fill('#newPassword', '654321');
      await page.fill('#confirmPassword', '654321');
      await page.getByRole('button', { name: 'パスワードを変更' }).click();
      await expect(page.getByText('パスワードを変更しました')).toBeVisible();
      await expect(page.locator('#currentPassword')).toHaveValue('');
      await expect(page.locator('#newPassword')).toHaveValue('');
      await expect(page.locator('#confirmPassword')).toHaveValue('');
    }
  );
});
