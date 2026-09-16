import type { TestDetails, TestDetailsAnnotation } from '@playwright/test';

/**
 * E2E テストケースのメタ情報（テストケース一覧 Excel の正本）
 *
 * spec の test() 第2引数に caseMeta() を渡すと、Playwright の tag / annotation として記録され、
 * `pnpm e2e:cases` が `_docs/testing/e2e-test-cases.xlsx` / `.md` を生成する。
 * 一覧を手で編集せず、必ずこのメタ情報を更新して再生成すること。
 */

/** 画面（Excel の並び順もこの順） */
export const SCREENS = [
  'ログイン',
  'ダッシュボード',
  '商品管理',
  '店舗管理',
  '在庫管理',
  'デバイス管理',
  '取引履歴',
  'アラート',
  'ユーザー管理',
  'ロール管理',
  'メニュー管理',
  '部門管理',
  '辞書管理',
  'ログ管理',
  'システム設定',
  '通知公告',
  'プロフィール',
  '共通レイアウト',
  '全画面共通',
] as const;

/** 観点（カバレッジ表の列もこの順） */
export const PERSPECTIVES = {
  display: '表示',
  navigation: '画面遷移',
  'search-text': 'テキスト検索',
  'search-select': '選択検索',
  'search-combined': '複合検索',
  exclude: '除外確認',
  empty: '0件表示',
  reset: 'リセット',
  pagination: 'ページ送り',
  create: '登録',
  update: '更新',
  delete: '削除',
  validation: '入力チェック',
  dialog: '詳細・ダイアログ',
  export: 'CSV出力',
  auth: '認証・認可',
  error: 'エラー処理',
  i18n: '多言語',
  a11y: 'アクセシビリティ',
  security: 'セキュリティ',
  vrt: '見た目(VRT)',
  realtime: 'リアルタイム',
  smoke: '実機スモーク',
} as const;

/** 優先度（e2e-test-policy.md §4） */
export const PRIORITIES = {
  P0: '表示確認: 画面が表示できる・遷移できる・認証ガードが効く',
  P1: '主要操作: 検索・リセット・ページ送り・登録/更新/削除・ログイン/ログアウト・エラー処理',
  P2: '周辺機能: 多言語・通知・フルスクリーン・見た目(VRT)・アクセシビリティ',
} as const;

export type Screen = (typeof SCREENS)[number];
export type Perspective = keyof typeof PERSPECTIVES;
export type Priority = keyof typeof PRIORITIES;

export interface CaseMeta {
  /** ケース ID（例: STR-002）。`--grep @STR-002` で単体実行できる */
  id: string;
  screen: Screen;
  priority: Priority;
  perspectives: Perspective[];
  /** describe 側の suiteMeta() の前提条件に追加される */
  precondition?: string;
  steps: string[];
  expected: string[];
  /** 既知の弱点・未検証事項など */
  note?: string;
}

export function caseMeta(meta: CaseMeta): TestDetails {
  const annotation: TestDetailsAnnotation[] = [
    { type: 'screen', description: meta.screen },
    ...(meta.precondition ? [{ type: 'precondition', description: meta.precondition }] : []),
    ...meta.steps.map((description) => ({ type: 'step', description })),
    ...meta.expected.map((description) => ({ type: 'expected', description })),
    ...(meta.note ? [{ type: 'note', description: meta.note }] : []),
  ];
  return {
    tag: [
      `@${meta.id}`,
      `@${meta.priority.toLowerCase()}`,
      ...meta.perspectives.map((p) => `@${p}`),
    ],
    annotation,
  };
}

/** describe 単位の共通前提条件（配下の全テストに付与される） */
export function suiteMeta(meta: { precondition: string }): TestDetails {
  return { annotation: [{ type: 'precondition', description: meta.precondition }] };
}
