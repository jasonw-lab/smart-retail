# タスク指示書: U9 取引履歴画面 (Transactions) Backend Integration & E2E 網羅テスト

## メタ情報

- **ユニット番号**: U9
- **対象機能**: 取引履歴画面 (`/transactions`)
- **対象フェーズ**: 実装 〜 E2E テスト（実バックエンド結合スモーク含む）
- **実行エージェント**: Antigravity CLI (`agy`) 自律エージェント
- **準拠ガイドライン**: 
  - `{kb}/workflow/ai-dev.md`（多層防衛・8大E2Eパターン・ハイブリッド検証。実体: `/Volumes/Dev/Git/learning/kb/workflow/ai-dev.md`）
  - [`apps/frontend-next/_docs/plan/plan_0906_features.md`](../../apps/frontend-next/_docs/plan/plan_0906_features.md)（U9 定義）
  - [`AGENTS.md`](../../AGENTS.md)（ディレクトリ制限・トークン最適化ルール）

---

## 1. 目的とゴール

取引履歴画面（`/transactions`）において、**「モックでは動くが実機でクラッシュする／検索やページネーションが効かない」** という API 契約乖離の罠（過剰モックの罠）を完全に排除します。

### 完了条件
1. **多層防衛アーキテクチャの適用**:
   - バックエンド API（`SalesController.java`: `GET /api/v1/retail/sales`）が全件返却（`List<Sales>`）であっても、ページング形式（`{ list, total }`）であっても安全に正規化し、クライアントサイド防衛フィルタ & ページネーションスライスを動作させる。
2. **i18n 完全対応**:
   - `features/transactions/` 配下の日本語ハードコードを排除し、`messages/ja.json` および `messages/en.json` に統一キーを配置。
3. **E2E 8大パターンの網羅**:
   - 単一条件、厳密な除外検証（Negative Test）、セレクト検索、複合検索、0件空状態、リセット復帰、次ページ遷移（`?page=2`）、詳細ダイアログ開閉、CSVエクスポートを検証。
4. **実バックエンド結合スモーク（`test:smoke`）通過**:
   - 実機（:8080）相手に画面クラッシュ（`ErrorBoundary`）ゼロ、実DBデータによる絞り込み・除外を約4秒で検証。
5. **品質ゲート合格 & 単一コミット**:
   - 型チェック・モックE2E・Liveスモークをすべてパスし、進捗表を更新して Git コミット。

---

## 2. 実装タスク一覧

### Task 1: API 正規化 & 多層防衛マッパーの実装
- **対象ファイル**:
  - `features/transactions/lib/transaction-mapper.ts` (新規作成または拡張)
  - `features/transactions/lib/transaction-api.client.ts`
  - `features/transactions/lib/transaction-api.server.ts`
- **指示**:
  - バックエンドレスポンスが配列 `Transaction[]` の場合と、オブジェクト `{ list, total }` の場合の両方を安全に解釈する `aggregateTransactions(items, query)` 関数を実装（U8 の `inventory-mapper.ts` を雛形にする）。
  - クエリパラメータ（`orderNumber`, `storeId`, `paymentMethod`, `startDate`, `endDate`, `pageNum`, `pageSize`）による防衛的フィルタリングとスライスを適用。
  - 未知の決済種別やステータスが来てもクラッシュしないフォールバック（`DEFAULT_CONFIG`）を用意。

---

### Task 2: i18n 化（日本語ハードコードの完全移行）
- **対象ファイル**:
  - `features/transactions/components/transaction-table-client.tsx`
  - `features/transactions/components/transaction-detail-dialog.tsx`
  - `messages/ja.json`
  - `messages/en.json`
- **指示**:
  - `transaction-table-client.tsx` 内の「店舗」「決済方法」「期間」「注文番号」「本日」「昨日」「すべての店舗」等の文言を `useTranslations('transactions')` および `common` に移行。
  - `ja.json` と `en.json` に同一キーを追加（値が英語になっていることを検証）。
  - 既存 E2E が参照している文言（例: `カード`, `詳細`, `CSV出力` 等）との不整合を起こさないこと。

---

### Task 3: モック E2E テストの 8 大パターン拡充
- **対象ファイル**:
  - `e2e/specs/transactions.spec.ts`
  - `e2e/mocks/mock-server.ts` (必要に応じたハンドラ整合)
- **必須検証ケース**:
  1. **サマリーカード & 初期一覧表示**: 件数・売上合計の表示確認
  2. **P1: 単一テキスト検索**: 注文番号（例: `TXN-20260529-001`）での絞り込み
  3. **P2: 厳密な除外検証**: 該当しない別注文番号が画面上に存在しない（`toHaveCount(0)`）こと
  4. **P3: セレクト検索**: 決済方法（カード/現金/QR）および店舗での絞り込み
  5. **P4: 複合検索 (AND)**: 店舗 × 決済方法 × 期間の掛け合わせ
  6. **P5: 該当0件 (Empty State)**: 存在しない注文番号で検索し、クラッシュせず空メッセージが表示されること
  7. **P6: リセット復帰**: リセット押下で全件復帰し、URL がリセットされること
  8. **P7: ページネーション（次ページ遷移）**:
     - 次のページ（Next）ボタン押下で 2 ページ目に遷移し、URL に `?page=2` が反映されること
     - 前のページ（Prev）で 1 ページ目に戻ること
  9. **詳細ダイアログ**: 詳細ボタン押下でダイアログが開き、金額・明細・閉じるボタンが動作すること
  10. **CSV エクスポート**: ダウンロードイベントが発火し、正しいファイル名形式であること

---

### Task 4: 実バックエンド結合スモークテストの拡充
- **対象ファイル**:
  - `apps/frontend-next/e2e/specs/live-smoke.spec.ts`
- **指示**:
  - 実バックエンド巡回ステップに `/ja/transactions` を追加。
  - `ErrorBoundary`（`エラーが発生しました`）が発火していないことを検証。
  - 実DBの取引データに対して、注文番号または決済方法での検索・絞り込み・除外（`toHaveCount(0)`）を検証。

---

## 3. 自動品質ゲート（判定基準）

各ステップ完了後、以下の3つのコマンドを順次実行し、**すべてエラーゼロ（Green）** であることを確認すること：

```bash
cd apps/frontend-next

# ゲート 1: 静的型検査 & リント
pnpm typecheck && pnpm lint

# ゲート 2: モック E2E フルテスト (Transactions)
CI=true pnpm exec playwright test e2e/specs/transactions.spec.ts

# ゲート 3: 実機結合スモークテスト (要: バックエンド :8080 起動)
pnpm test:smoke
```

---

## 4. 安全装置・サーキットブレーカー（自動停止ルール）

トークンの無駄な浪費（迷走ループ）を防ぐため、以下のいずれかに該当した場合は**作業を即座に中断し、人間に報告して介入を仰ぐこと**:

1. **型エラーの連鎖**: 同一のエラーに対して 2 回コード修正を行っても解決しない場合。
2. **E2E テストの失敗ループ**: テストが 2 回連続で失敗し、原因が特定できない場合。
3. **環境・DB起因のエラー**: `test:smoke` の失敗原因が Docker コンテナ停止や DB 接続拒否（500/Connection Refused）である場合（フロントコードの誤修正を防止）。

---

## 5. コミット & 進捗記録手順

すべてのゲートを通過したら、以下を実施して完了とします：

1. **進捗ドキュメント更新**:
   - `apps/frontend-next/_docs/plan/plan_0906_features.md` の「作業状況」表の U9 を「完了」に更新。
   - `python3 _scripts/build_plan_html.py --sync` を実行。
   - `python3 _scripts/build_plan_html.py --check` を通す。
2. **Git コミット**:
   ```bash
   git add .
   git commit -m "feat(transactions): integrate backend, i18n and comprehensive E2E tests"
   ```

---

## 6. Antigravity CLI (`agy`) 実行コマンド例

本指示書を Antigravity CLI から直接実行するコマンド：

```bash
# 対話的に自律実行を開始する場合
agy -i "workflow/plans/task_u9_transactions.md の指示書を読み、Task 1 から Task 5 までを自律的に実行してください。3大品質ゲートをすべて通過したことを確認してからコミットを作成してください。同一エラー2回発生時は停止して人間に報告してください。" --effort high --dangerously-skip-permissions

# または非対話（バックグラウンド/ヘッドレス）で一気に完遂させる場合
agy -p "workflow/plans/task_u9_transactions.md の指示書に従い U9 を自律完結してください。" --effort high --dangerously-skip-permissions
```
