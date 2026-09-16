import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { TESTIDS } from '../testids';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe('システム管理', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test(
    'ユーザー管理',
    caseMeta({
      id: 'SYS-001',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['display', 'dialog'],
      steps: [
        '/system/user を開く',
        'Search・Reset を押す',
        'Add User を押してキャンセルする',
        '先頭行の Edit を押してキャンセルする',
        '先頭行の Delete を押してキャンセルする',
      ],
      expected: [
        'admin・本社が一覧に表示される',
        '「ユーザーの追加」「ユーザーの編集」ダイアログが開く',
        '削除の確認ダイアログが開き、キャンセルで閉じる',
      ],
      note: 'ダイアログの開閉のみ。検索結果・保存・削除の確定は検証していない',
    }),
    async ({ page }) => {
      await page.goto('/system/user');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(
        page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('admin').first()
      ).toBeVisible();
      await expect(
        page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('本社').first()
      ).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await page.getByRole('button', { name: 'Add User' }).click();
      await expect(page.getByText('ユーザーの追加')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByText('ユーザーの編集')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
        .getByRole('button', { name: /^Delete$/ })
        .first()
        .click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );

  test(
    'ロール管理',
    caseMeta({
      id: 'SYS-002',
      screen: 'ロール管理',
      priority: 'P1',
      perspectives: ['display', 'dialog'],
      steps: [
        '/system/role を開く',
        'Search・Reset を押す',
        'Add New Role を押してキャンセルする',
        '先頭行の Permissions を押してキャンセルする',
        '先頭行の Edit を押してキャンセルする',
        '先頭行の Delete を押してキャンセルする',
      ],
      expected: [
        'ADMIN が一覧に表示される',
        '「役割の追加」「権限設定」「役割の編集」ダイアログが開く',
        '削除の確認ダイアログが開く',
      ],
      note: 'ダイアログの開閉のみ。検索結果・保存・削除の確定は検証していない',
    }),
    async ({ page }) => {
      await page.goto('/system/role');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByText('ADMIN')).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await page.getByRole('button', { name: 'Add New Role' }).click();
      await expect(page.getByText('役割の追加')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page.getByRole('button', { name: 'Permissions' }).first().click();
      await expect(page.getByText('権限設定')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByText('役割の編集')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
        .getByRole('button', { name: /^Delete$/ })
        .first()
        .click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    }
  );

  test(
    'メニュー管理',
    caseMeta({
      id: 'SYS-003',
      screen: 'メニュー管理',
      priority: 'P1',
      perspectives: ['display', 'dialog'],
      steps: [
        '/system/menu を開く',
        'Search・Reset を押す',
        'Create Menu を押してキャンセルする',
        '先頭行の削除アイコンを押してキャンセルする',
      ],
      expected: [
        'ダッシュボードが一覧に表示される',
        '「メニューの追加」ダイアログが開く',
        '削除の確認ダイアログが開く',
      ],
      note: 'ダイアログの開閉のみ。検索結果・保存・削除の確定は検証していない',
    }),
    async ({ page }) => {
      await page.goto('/system/menu');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('main').getByText('ダッシュボード').first()).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await page.getByRole('button', { name: 'Create Menu' }).click();
      await expect(page.getByText('メニューの追加')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      // メニュー行の削除アイコンをクリック
      await page.locator('table button:has(svg[class*="lucide-trash2"])').first().click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    }
  );

  test(
    '部門管理',
    caseMeta({
      id: 'SYS-004',
      screen: '部門管理',
      priority: 'P1',
      perspectives: ['display', 'dialog'],
      steps: [
        '/system/dept を開く',
        'Search・Reset を押す',
        'New Department を押してキャンセルする',
        '先頭行の Edit を押してキャンセルする',
        '先頭行の Delete を押してキャンセルする',
      ],
      expected: [
        '本社が一覧に表示される',
        '「部門の追加」「部門の編集」ダイアログが開く',
        '削除の確認ダイアログが開く',
      ],
      note: 'ダイアログの開閉のみ。検索結果・保存・削除の確定は検証していない',
    }),
    async ({ page }) => {
      await page.goto('/system/dept');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByText('本社')).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await page.getByRole('button', { name: 'New Department' }).click();
      await expect(page.getByText('部門の追加')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByText('部門の編集')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
        .getByRole('button', { name: /^Delete$/ })
        .first()
        .click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    }
  );

  test(
    '辞書管理',
    caseMeta({
      id: 'SYS-005',
      screen: '辞書管理',
      priority: 'P1',
      perspectives: ['display', 'dialog'],
      steps: [
        '/system/dict を開く',
        'Search・Reset を押す',
        'Add New Dictionary を押してキャンセルする',
        '先頭行の Edit を押してキャンセルする',
        '先頭行の Delete を押してキャンセルする',
      ],
      expected: [
        'ステータスが一覧に表示される',
        '「字典の追加」「字典の編集」ダイアログが開く',
        '削除の確認ダイアログが開く',
      ],
      note: 'ダイアログの開閉のみ。検索結果・保存・削除の確定は検証していない。「字典」は誤字で、plan_0906 U12 で「辞書」に直す予定',
    }),
    async ({ page }) => {
      await page.goto('/system/dict');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByText('ステータス')).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await page.getByRole('button', { name: 'Add New Dictionary' }).click();
      await expect(page.getByText('字典の追加')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByText('字典の編集')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();

      await page
        .locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`)
        .getByRole('button', { name: /^Delete$/ })
        .first()
        .click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
    }
  );

  test(
    'ログ管理',
    caseMeta({
      id: 'SYS-006',
      screen: 'ログ管理',
      priority: 'P1',
      perspectives: ['display'],
      steps: ['/system/log を開く', 'Search・Reset を押す'],
      expected: [
        '「System Log Records」と admin が表示される',
        '「Module Activity」「Avg. Response Time」が表示される',
      ],
      note: '検索結果・ページ送りは検証していない → SYS-022 / SYS-023',
    }),
    async ({ page }) => {
      await page.goto('/system/log');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByText('System Log Records')).toBeVisible();
      await expect(
        page.locator(`[data-testid="${TESTIDS.LAYOUT_MAIN}"]`).getByText('admin').first()
      ).toBeVisible();

      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      await expect(page.getByText('Module Activity')).toBeVisible();
      await expect(page.getByText('Avg. Response Time')).toBeVisible();
    }
  );

  test(
    '辞書項目管理',
    caseMeta({
      id: 'SYS-007',
      screen: '辞書管理',
      priority: 'P1',
      perspectives: ['navigation', 'create', 'dialog'],
      steps: [
        '辞書一覧で先頭行の Items を押す',
        'Search・Reset を押す',
        'Add New Item でラベル「テスト項目」、値「test」を入力して保存する',
        '先頭行の Edit を押してキャンセルする',
        '先頭行の Delete を押してキャンセルする',
      ],
      expected: [
        '/system/dict/status に遷移し、有効・無効が表示される',
        '保存後にダイアログが閉じ、テスト項目が一覧に表示される',
        '編集ダイアログと削除の確認ダイアログが開いて閉じる',
      ],
      note: '編集の保存・削除の確定は検証していない（plan_0906 U2 の受入条件が未達）→ SYS-020 / SYS-021',
    }),
    async ({ page }) => {
      // 辞書一覧から Items ボタンで辞書項目画面へ遷移
      await page.goto('/system/dict');
      await expect(page.getByRole('main')).toBeVisible();
      await page.getByRole('button', { name: 'Items' }).first().click();
      await expect(page).toHaveURL(/\/system\/dict\/status/);
      await expect(page.getByRole('main')).toBeVisible();

      // 辞書項目の初期一覧確認
      await expect(page.getByText('有効').first()).toBeVisible();
      await expect(page.getByText('無効').first()).toBeVisible();

      // 検索・リセット操作
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByRole('button', { name: 'Reset' }).first().click();

      // 辞書項目の追加
      await page.getByRole('button', { name: 'Add New Item' }).click();
      await expect(page.getByText('辞書項目の追加')).toBeVisible();
      await page.fill('#label', 'テスト項目');
      await page.fill('#value', 'test');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByText('辞書項目の追加')).not.toBeVisible();
      await expect(page.getByText('テスト項目').first()).toBeVisible();

      // 辞書項目の編集
      await page.locator('table').getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByText('辞書項目の編集')).toBeVisible();
      await page.getByRole('button', { name: 'キャンセル' }).click();
      await expect(page.getByText('辞書項目の編集')).not.toBeVisible();

      // 辞書項目の削除（確認ダイアログキャンセル）
      await page
        .locator('table')
        .getByRole('button', { name: /^Delete$/ })
        .first()
        .click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_CANCEL}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
    }
  );
});

test.describe('システム管理（未実装）', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.fixme(
    'ユーザーを検索すると条件に合うユーザーだけが表示される',
    caseMeta({
      id: 'SYS-008',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['キーワードにユーザー名を入力して Search を押す'],
      expected: ['該当するユーザーだけが表示される', '他のユーザーは表示されない'],
    }),
    async () => {}
  );

  test.fixme(
    'ユーザーを登録できる',
    caseMeta({
      id: 'SYS-009',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['Add User を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しいユーザーが表示される'],
    }),
    async () => {}
  );

  test.fixme(
    'ユーザーを編集して保存できる',
    caseMeta({
      id: 'SYS-010',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['先頭行の Edit を押す', 'ニックネームを変更して保存する'],
      expected: ['更新完了のトーストが表示される', '一覧に変更が反映される'],
    }),
    async () => {}
  );

  test.fixme(
    'ユーザーを削除できる',
    caseMeta({
      id: 'SYS-011',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['admin 以外の行の Delete を押す', 'OK を押す'],
      expected: ['削除完了のトーストが表示される', '一覧から該当ユーザーが消える'],
    }),
    async () => {}
  );

  test.fixme(
    '複数のユーザーを選択して一括削除できる',
    caseMeta({
      id: 'SYS-012',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['チェックボックスで2件選ぶ', '一括削除ボタンを押して OK を押す'],
      expected: ['選んだ2件が一覧から消える'],
    }),
    async () => {}
  );

  test.fixme(
    'ユーザーのパスワードをリセットできる',
    caseMeta({
      id: 'SYS-013',
      screen: 'ユーザー管理',
      priority: 'P1',
      perspectives: ['update', 'dialog'],
      steps: ['先頭行のパスワードリセットを押す', '新しいパスワードを入力して確定する'],
      expected: ['完了のトーストが表示され、ダイアログが閉じる'],
    }),
    async () => {}
  );

  test.fixme(
    'ロールを登録できる',
    caseMeta({
      id: 'SYS-014',
      screen: 'ロール管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['Add New Role を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しいロールが表示される'],
    }),
    async () => {}
  );

  test.fixme(
    'ロールの権限設定を保存できる',
    caseMeta({
      id: 'SYS-015',
      screen: 'ロール管理',
      priority: 'P1',
      perspectives: ['update', 'dialog'],
      steps: [
        '先頭行の Permissions を押す',
        'メニュー権限を変更して保存する',
        'もう一度 Permissions を開く',
      ],
      expected: ['保存完了のトーストが表示される', '変更した権限が保持されている'],
    }),
    async () => {}
  );

  test.fixme(
    'メニューを登録できる',
    caseMeta({
      id: 'SYS-016',
      screen: 'メニュー管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['Create Menu を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しいメニューが表示される'],
    }),
    async () => {}
  );

  test.fixme(
    '部門を登録できる',
    caseMeta({
      id: 'SYS-017',
      screen: '部門管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['New Department を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しい部門が表示される'],
    }),
    async () => {}
  );

  test.fixme(
    '部門ツリーをすべて展開できる',
    caseMeta({
      id: 'SYS-018',
      screen: '部門管理',
      priority: 'P2',
      perspectives: ['display'],
      steps: ['すべて展開ボタンを押す'],
      expected: ['子部門まで表示される'],
    }),
    async () => {}
  );

  test.fixme(
    '辞書を登録できる',
    caseMeta({
      id: 'SYS-019',
      screen: '辞書管理',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['Add New Dictionary を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しい辞書が表示される'],
    }),
    async () => {}
  );

  test(
    '辞書項目を編集して保存できる',
    caseMeta({
      id: 'SYS-020',
      screen: '辞書管理',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['辞書項目画面で先頭行の Edit を押す', 'ラベルを変更して保存する'],
      expected: ['ダイアログが閉じ、変更後のラベルが一覧に表示される'],
      note: 'plan_0906 U2 の受入条件',
    }),
    async ({ page }) => {
      await page.goto('/system/dict/status');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();

      const targetLabel = `編集対象_${Date.now()}`;
      const editedLabel = `編集後_${Date.now()}`;

      // Add a disposable item to edit
      await page.getByRole('button', { name: 'Add New Item' }).click();
      await expect(page.getByText('辞書項目の追加')).toBeVisible();
      await page.fill('#label', targetLabel);
      await page.fill('#value', 'edit_val');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByText('辞書項目の追加')).not.toBeVisible();
      await expect(page.locator('table').getByText(targetLabel)).toBeVisible();

      // Edit that item
      const itemRow = page.locator('table tbody tr', { hasText: targetLabel });
      await itemRow.getByRole('button', { name: 'Edit' }).click();
      await expect(page.getByText('辞書項目の編集')).toBeVisible();
      await page.fill('#label', editedLabel);
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByText('辞書項目の編集')).not.toBeVisible();
      await expect(page.locator('table').getByText(editedLabel)).toBeVisible();
    }
  );

  test(
    '辞書項目を削除できる',
    caseMeta({
      id: 'SYS-021',
      screen: '辞書管理',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['辞書項目画面で先頭行の Delete を押す', 'OK を押す'],
      expected: ['一覧から該当の項目が消える'],
      note: 'plan_0906 U2 の受入条件',
    }),
    async ({ page }) => {
      await page.goto('/system/dict/status');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();

      const deleteLabel = `削除対象_${Date.now()}`;

      // Add a disposable item to delete
      await page.getByRole('button', { name: 'Add New Item' }).click();
      await expect(page.getByText('辞書項目の追加')).toBeVisible();
      await page.fill('#label', deleteLabel);
      await page.fill('#value', 'del_val');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByText('辞書項目の追加')).not.toBeVisible();
      await expect(page.locator('table').getByText(deleteLabel)).toBeVisible();

      // Delete that item
      const itemRow = page.locator('table tbody tr', { hasText: deleteLabel });
      await itemRow.getByRole('button', { name: /^Delete$/ }).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(page.locator('table').getByText(deleteLabel)).not.toBeVisible();
    }
  );

  test.fixme(
    'ログをキーワードで検索できる',
    caseMeta({
      id: 'SYS-022',
      screen: 'ログ管理',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['キーワードを入力して Search を押す'],
      expected: ['キーワードに一致するログだけが表示される'],
    }),
    async () => {}
  );

  test.fixme(
    'ログのページ送りと表示件数の変更ができる',
    caseMeta({
      id: 'SYS-023',
      screen: 'ログ管理',
      priority: 'P1',
      perspectives: ['pagination'],
      steps: ['次ページボタンを押す', '表示件数を変更する'],
      expected: ['2ページ目のログが表示される', '選んだ件数で一覧が表示される'],
    }),
    async () => {}
  );

  test(
    'システム設定一覧が表示される',
    caseMeta({
      id: 'SYS-024',
      screen: 'システム設定',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['/system/config を開く'],
      expected: ['設定一覧が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: 'システム設定' })).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('table').getByText('システム名')).toBeVisible();
    }
  );

  test(
    'システム設定を検索できる',
    caseMeta({
      id: 'SYS-025',
      screen: 'システム設定',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['設定キーを入力して検索する'],
      expected: ['該当する設定だけが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();
      await page.fill('input[placeholder="設定名・キーワード"]', 'system.app.name');
      await page.getByRole('button', { name: '検索' }).click();
      await expect(page.locator('table').getByText('システム名')).toBeVisible();
      await expect(page.locator('table').getByText('デフォルトパスワード')).not.toBeVisible();
    }
  );

  test(
    'システム設定を登録できる',
    caseMeta({
      id: 'SYS-026',
      screen: 'システム設定',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['追加ボタン を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しい設定が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();
      await page.getByRole('button', { name: '設定追加' }).click();
      await expect(page.getByRole('heading', { name: '設定追加' })).toBeVisible();
      await page.fill('#configName', '新規テスト設定');
      await page.fill('#configKey', 'test.config.key');
      await page.fill('#configValue', 'test-value-123');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('heading', { name: '設定追加' })).not.toBeVisible();
      await expect(page.locator('table').getByText('新規テスト設定')).toBeVisible();
    }
  );

  test(
    'システム設定を編集して保存できる',
    caseMeta({
      id: 'SYS-027',
      screen: 'システム設定',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['先頭行の編集を押す', '設定値を変更して保存する'],
      expected: ['更新完了のトーストが表示される', '一覧に変更が反映される'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();
      await page.locator('table').getByRole('button', { name: '編集' }).first().click();
      await expect(page.getByRole('heading', { name: '設定編集' })).toBeVisible();
      await page.fill('#configValue', '更新後設定値');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('heading', { name: '設定編集' })).not.toBeVisible();
      await expect(page.locator('table').getByText('更新後設定値')).toBeVisible();
    }
  );

  test(
    'システム設定を削除できる',
    caseMeta({
      id: 'SYS-028',
      screen: 'システム設定',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['先頭行の削除を押す', 'OK を押す'],
      expected: ['一覧から該当の設定が消える'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();

      const delConfigName = `削除対象設定_${Date.now()}`;
      const delConfigKey = `temp.del.${Date.now()}`;

      // Add a disposable config to delete
      await page.getByRole('button', { name: '設定追加' }).click();
      await expect(page.getByRole('heading', { name: '設定追加' })).toBeVisible();
      await page.fill('#configName', delConfigName);
      await page.fill('#configKey', delConfigKey);
      await page.fill('#configValue', 'temp-del-val');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('heading', { name: '設定追加' })).not.toBeVisible();
      await expect(page.locator('table').getByText(delConfigName)).toBeVisible();

      // Delete that config
      const row = page.locator('table tbody tr', { hasText: delConfigName });
      await row.getByRole('button', { name: '削除' }).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(page.locator('table').getByText(delConfigName)).not.toBeVisible();
    }
  );

  test(
    '設定キャッシュを更新できる',
    caseMeta({
      id: 'SYS-029',
      screen: 'システム設定',
      priority: 'P2',
      perspectives: ['update'],
      steps: ['キャッシュ更新ボタンを押す'],
      expected: ['完了のトーストが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/config');
      await expect(page.getByRole('main')).toBeVisible();
      const refreshBtn = page.getByRole('button', { name: 'キャッシュ再読込' });
      await expect(refreshBtn).toBeVisible();
      await refreshBtn.click();
      await expect(refreshBtn).toBeEnabled({ timeout: 5000 });
    }
  );

  test(
    '通知公告一覧が表示される',
    caseMeta({
      id: 'SYS-030',
      screen: '通知公告',
      priority: 'P0',
      perspectives: ['display'],
      steps: ['/system/notice を開く'],
      expected: ['通知公告の一覧が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: '通知公告' })).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('table').getByText('システムメンテナンスのお知らせ')).toBeVisible();
    }
  );

  test(
    '通知公告をタイトルで検索できる',
    caseMeta({
      id: 'SYS-031',
      screen: '通知公告',
      priority: 'P1',
      perspectives: ['search-text', 'exclude'],
      steps: ['タイトルを入力して検索する'],
      expected: ['該当する公告だけが表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();
      await page.fill('input[placeholder="タイトルを入力"]', 'システムメンテナンス');
      await page.getByRole('button', { name: '検索' }).click();
      await expect(page.locator('table').getByText('システムメンテナンスのお知らせ')).toBeVisible();
      await expect(page.locator('table').getByText('新機能リリースのご案内')).not.toBeVisible();
    }
  );

  test(
    '通知公告を登録できる',
    caseMeta({
      id: 'SYS-032',
      screen: '通知公告',
      priority: 'P1',
      perspectives: ['create'],
      steps: ['追加ボタン を押す', '必須項目を入力して保存する'],
      expected: ['登録完了のトーストが表示される', '一覧に新しい公告が表示される'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();
      await page.getByRole('button', { name: '通知追加' }).click();
      await expect(page.getByRole('heading', { name: '通知追加' })).toBeVisible();
      await page.fill('#title', '新規テスト公告');
      await page.fill('#content', '新規テスト公告の詳細内容です');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('heading', { name: '通知追加' })).not.toBeVisible();
      await expect(page.locator('table').getByText('新規テスト公告')).toBeVisible();
    }
  );

  test(
    '通知公告を公開できる',
    caseMeta({
      id: 'SYS-033',
      screen: '通知公告',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['下書きの公告の公開ボタンを押す', '確認で OK を押す'],
      expected: ['公告の状態が公開済みになる'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();
      const draftRow = page.locator('table tbody tr', { hasText: '新機能リリースのご案内' });
      await draftRow.getByRole('button', { name: '発行' }).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(draftRow.getByText('発行済')).toBeVisible();
    }
  );

  test(
    '公開済みの通知公告を取り消せる',
    caseMeta({
      id: 'SYS-034',
      screen: '通知公告',
      priority: 'P1',
      perspectives: ['update'],
      steps: ['公開済みの公告の取消ボタンを押す', '確認で OK を押す'],
      expected: ['公告の状態が取消済みになる'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();
      const publishedRow = page.locator('table tbody tr', { hasText: 'システムメンテナンスのお知らせ' });
      await publishedRow.getByRole('button', { name: '撤回' }).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(publishedRow.getByText('撤回済')).toBeVisible();
    }
  );

  test(
    '通知公告を削除できる',
    caseMeta({
      id: 'SYS-035',
      screen: '通知公告',
      priority: 'P1',
      perspectives: ['delete'],
      steps: ['先頭行の削除を押す', 'OK を押す'],
      expected: ['一覧から該当の公告が消える'],
    }),
    async ({ page }) => {
      await page.goto('/system/notice');
      await expect(page.getByRole('main')).toBeVisible();

      const delNoticeTitle = `削除対象公告_${Date.now()}`;

      // Add a disposable notice to delete
      await page.getByRole('button', { name: '通知追加' }).click();
      await expect(page.getByRole('heading', { name: '通知追加' })).toBeVisible();
      await page.fill('#title', delNoticeTitle);
      await page.fill('#content', '削除テスト用内容');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('heading', { name: '通知追加' })).not.toBeVisible();
      await expect(page.locator('table').getByText(delNoticeTitle)).toBeVisible();

      // Delete that notice
      const row = page.locator('table tbody tr', { hasText: delNoticeTitle });
      await row.getByRole('button', { name: '削除' }).click();
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).toBeVisible();
      await page.click(`[data-testid="${TESTIDS.CONFIRM_DIALOG_OK}"]`);
      await expect(page.locator(`[data-testid="${TESTIDS.CONFIRM_DIALOG}"]`)).not.toBeVisible();
      await expect(page.locator('table').getByText(delNoticeTitle)).not.toBeVisible();
    }
  );
});
