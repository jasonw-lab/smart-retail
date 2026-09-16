import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from '../fixtures/auth';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('アクセシビリティ', () => {
  test(
    'ログインページに重大なアクセシビリティ違反がない',
    caseMeta({
      id: 'A11Y-001',
      screen: 'ログイン',
      priority: 'P2',
      perspectives: ['a11y'],
      precondition: '未ログイン',
      steps: ['ログインページを開く', 'axe で WCAG 2 A / AA をスキャンする'],
      expected: ['違反が0件'],
    }),
    async ({ page }) => {
      await page.goto('/login');
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  );

  test(
    'ダッシュボードに重大なアクセシビリティ違反がない',
    caseMeta({
      id: 'A11Y-002',
      screen: 'ダッシュボード',
      priority: 'P2',
      perspectives: ['a11y'],
      precondition: 'admin でログイン済み',
      steps: ['ダッシュボードを開く', 'axe で WCAG 2 A / AA をスキャンする'],
      expected: ['違反が0件'],
    }),
    async ({ page }) => {
      await login(page);
      await page.goto('/');
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  );
});

test.describe(
  'アクセシビリティ（未実装）',
  suiteMeta({ precondition: 'admin でログイン済み' }),
  () => {
    test.fixme(
      '商品一覧に重大なアクセシビリティ違反がない',
      caseMeta({
        id: 'A11Y-003',
        screen: '商品管理',
        priority: 'P2',
        perspectives: ['a11y'],
        steps: ['商品一覧を開く', 'axe で WCAG 2 A / AA をスキャンする'],
        expected: ['違反が0件'],
      }),
      async () => {}
    );

    test.fixme(
      '商品登録フォームのエラー表示中に重大なアクセシビリティ違反がない',
      caseMeta({
        id: 'A11Y-004',
        screen: '商品管理',
        priority: 'P2',
        perspectives: ['a11y', 'validation'],
        steps: [
          '商品登録画面を開く',
          '何も入力せず登録ボタンを押す',
          'axe で WCAG 2 A / AA をスキャンする',
        ],
        expected: ['入力エラー表示中も違反が0件'],
      }),
      async () => {}
    );

    test.fixme(
      '確認ダイアログ表示中に重大なアクセシビリティ違反がない',
      caseMeta({
        id: 'A11Y-005',
        screen: '全画面共通',
        priority: 'P2',
        perspectives: ['a11y', 'dialog'],
        steps: [
          '店舗一覧で削除ボタンを押し、確認ダイアログを開く',
          'axe で WCAG 2 A / AA をスキャンする',
        ],
        expected: ['違反が0件', 'フォーカスがダイアログ内にある'],
      }),
      async () => {}
    );
  }
);
