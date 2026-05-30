# E2Eテスト方針書 v2

**対象システム:** SmartRetail Pro 管理画面
**テスト構成:** Playwright + Standalone Mock Server + Claude CLI 自律修正
**最終更新:** 2026-05-30

---

## 1. スコープと目的

UIのみのE2Eテストを対象とする。バックエンドはStandalone HTTP Mock Serverでモックし、フロントエンドの画面表示・操作・状態遷移が仕様通りに動くことを保証する。

| 項目 | 内容 |
|------|------|
| 対象 | 画面表示・ユーザー操作・状態遷移（UI層） |
| モック | Standalone HTTP Mock Server (mock-server.ts) |
| 目的 | 画面リグレッションの早期検知 / 自律修正ループの安定基盤 |
| 非対象 | API実装・DB・決済/デバイス連携の正しさ |

---

## 2. テスト対象画面

ナビゲーションから到達できる画面を以下のグループで扱う。

| グループ | 画面 | 優先度 |
|---------|------|:------:|
| 認証 | ログイン | P0 |
| ダッシュボード | メイン | P0 |
| 店舗管理 | 店舗一覧 / 決済履歴 / デバイス一覧 | P1 |
| 商品・在庫 | 商品一覧 / 在庫一覧 | P1 |
| 横断機能 | アラート一覧 | P1 |
| 系統管理 | ユーザー管理 / ロール管理 / 部門管理 / 辞書管理 | P2 |
| 共通レイアウト | サイドバー / ヘッダー | P1 |

---

## 3. 画面共通のテストパターン

どの画面も「**検索フォーム → 一覧テーブル → ページネーション → 行操作**」という同じ骨格を持つ。

### 3.1 検索フォーム
- 各条件の入力・選択ができる
- 検索ボタンで結果が絞り込まれる
- リセットでフォームと結果が初期状態に戻る

### 3.2 一覧テーブル
- ヘッダー列が仕様通り
- モックデータが正しい件数・正しい列マッピングで描画される

### 3.3 ページネーション
- 総件数表示
- ページサイズ切替
- ページ移動でテーブル内容が切り替わる

### 3.4 行操作
- 編集・削除ボタンのクリックでモーダル／確認ダイアログが開く
- 新規登録ボタンが動作する

---

## 4. テストレベルと優先度

| 優先度 | レベル | 内容 | 自律修正 |
|:------:|--------|------|:--------:|
| **P0** | 表示確認 | 各画面が遷移先で正しくレンダリングされる | 可 |
| **P1** | 主要操作 | 検索・リセット・ページネーション・行操作 | 可 |
| **P2** | 周辺機能 | 言語切替・文字サイズ・通知など | 要確認 |

**進め方:** P0 全画面 → P1 → P2 の順で広げる。

---

## 5. モック方針（Standalone HTTP Server）

`e2e/mocks/mock-server.ts` で全APIをモック。各エンドポイントのレスポンスは `handlers.ts` で定義。

| パターン | 目的 | 実装状況 |
|----------|------|:--------:|
| 正常系 | 複数件・ページネーションが効く件数 | ✅ |
| 空配列 | 0件表示・空状態UIの確認 | 未 |
| サーバーエラー（500） | エラー表示の確認 | 未 |
| 大量／長文データ | 省略表示・レイアウト崩れの検証 | 未 |

テストはクエリパラメータでパターンを切替える設計を推奨（例: `?mock=empty`）。

---

## 6. セレクタ方針（必須）

### 6.1 原則: data-testid のみ使用

```typescript
// ✅ 良い例
await page.getByTestId('login-submit-button').click();
await expect(page.getByTestId('product-table')).toBeVisible();

// ❌ 悪い例（言語切替で壊れる）
await page.locator('text=ログイン').click();
await expect(page.locator('h3:has-text("Welcome")')).toBeVisible();
```

### 6.2 testids.ts で定数管理

```
e2e/
  testids.ts          # data-testid 定数を一元管理
```

```typescript
// e2e/testids.ts
export const TESTIDS = {
  // Auth
  LOGIN_FORM: 'login-form',
  LOGIN_USERNAME: 'login-username',
  LOGIN_PASSWORD: 'login-password',
  LOGIN_CAPTCHA: 'login-captcha',
  LOGIN_SUBMIT: 'login-submit',

  // Products
  PRODUCT_TABLE: 'product-table',
  PRODUCT_SEARCH_INPUT: 'product-search-input',
  PRODUCT_SEARCH_BUTTON: 'product-search-button',
  PRODUCT_NEW_BUTTON: 'product-new-button',
  // ...
} as const;
```

### 6.3 コンポーネント側の対応

コンポーネントには必ず `data-testid` を付与:

```tsx
<Button data-testid="login-submit" type="submit">
  {t('login.submit')}
</Button>
```

---

## 7. 安定性の担保

- 固定の `sleep` は使わない。`expect().toBeVisible()` / `waitFor` による明示的な待機
- 各テストは独立して実行でき、実行順に依存しない
- 失敗時の調査材料:
  - トレース: `trace: 'on-first-retry'`
  - 失敗時スクリーンショット: `screenshot: 'only-on-failure'`
  - レポーター: `['html'], ['json', { outputFile: 'e2e/results.json' }]`

---

## 8. 対象外（明記）

- バックエンドのビジネスロジック
- 実際のDB・決済・デバイス連携
- 性能・負荷テスト
- ブラウザ互換の網羅
- ピクセル単位のビジュアルリグレッション

---

## 9. ディレクトリ構成

```
e2e/
  specs/              # 画面別テスト
    auth.spec.ts
    dashboard.spec.ts
    products.spec.ts
    stores.spec.ts
    ...
  mocks/
    mock-server.ts    # Standalone HTTP mock server
    handlers.ts       # レスポンスデータ定義
    handlers/         # エンドポイント別ハンドラ（オプション）
  fixtures/
    auth.ts           # ログインヘルパー
  testids.ts          # data-testid 定数
  results.json        # テスト結果（自動生成）
playwright.config.ts
```

---

## 10. 自律修正ループ（Claude CLI）

### 10.1 目的

テスト失敗時にClaude CLIが自動で原因を特定し、修正を実施。人間の介入を最小化。

### 10.2 前提条件

| 条件 | 必須 |
|------|:----:|
| JSON形式のテスト結果出力 | ✅ |
| 失敗時スクリーンショット | ✅ |
| トレースファイル | ✅ |
| data-testid ベースのセレクタ | ✅ |

### 10.3 失敗パターンと対応

| パターン | 症状 | 自動修正 | 対応 |
|----------|------|:--------:|------|
| セレクタ不一致 | `locator not found` | ✅ | testids.ts とコンポーネントを照合・修正 |
| タイムアウト | `timeout waiting` | ✅ | waitFor条件の見直し、timeout値調整 |
| API応答不正 | `expect(received).toEqual(expected)` | ✅ | mock-server.ts のレスポンス修正 |
| レイアウト崩れ | スクショ目視必要 | ❌ | 人間にエスカレート |
| 仕様変更 | 複数箇所で失敗 | ❌ | 人間にエスカレート |

### 10.4 実行フロー

```
1. pnpm test:e2e --reporter=json
2. 失敗があれば results.json を解析
3. 失敗パターンを分類
4. 自動修正可能なら修正実施
5. 再実行（最大3回）
6. 修正不可 or 3回失敗 → 人間にエスカレート
```

### 10.5 Claude CLI 実行コマンド

```bash
# 自律修正モード
claude -p "e2e/results.json を読み、失敗テストを修正せよ。修正後は pnpm test:e2e で検証。"

# 単一テスト修正
claude -p "e2e/specs/auth.spec.ts:31 の失敗を修正せよ。スクショ: e2e/test-results/..."
```

### 10.6 エスカレーション基準

以下の場合は自動修正を中断し、人間に報告:

1. 3回の修正サイクルで解決しない
2. 5ファイル以上の変更が必要
3. 仕様に関わる判断が必要（期待値自体の変更）
4. セキュリティ関連コンポーネントの変更

---

## 11. CI/CD統合

### 11.1 GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    paths:
      - 'apps/frontend-next/**'
  pull_request:
    paths:
      - 'apps/frontend-next/**'

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install
        working-directory: apps/frontend-next

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium
        working-directory: apps/frontend-next

      - name: Run E2E tests
        run: pnpm test:e2e
        working-directory: apps/frontend-next

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: |
            apps/frontend-next/e2e/playwright-report/
            apps/frontend-next/test-results/
          retention-days: 7
```

### 11.2 成功/失敗基準

| 結果 | 基準 | アクション |
|------|------|-----------|
| 成功 | 全テストパス | マージ可 |
| 失敗（自動修正可） | セレクタ/タイムアウト系 | Claude CLI で自動修正 |
| 失敗（要確認） | 仕様関連/複数失敗 | レビュー依頼 |

### 11.3 アーティファクト

| ファイル | 用途 |
|----------|------|
| `e2e/playwright-report/` | HTMLレポート |
| `test-results/` | スクリーンショット・トレース |
| `e2e/results.json` | Claude CLI 解析用 |

---

## 12. 移行計画

### Phase 1: 基盤整備（現在）
- [x] Standalone Mock Server 実装
- [x] 基本テスト（auth, dashboard, products）
- [ ] testids.ts 作成
- [ ] コンポーネントへの data-testid 付与

### Phase 2: セレクタ移行
- [ ] 既存テストを data-testid ベースに書き換え
- [ ] JSON Reporter 追加

### Phase 3: 自律修正ループ
- [ ] results.json 出力設定
- [ ] Claude CLI 修正スクリプト作成
- [ ] CI/CD統合

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-05-30 | v2: 自律修正ループ追加、セレクタ方針明確化、CI/CD統合追加 |
| 2026-05-26 | v1: 初版作成 |
