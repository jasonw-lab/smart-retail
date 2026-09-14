# 並行実行指示書: 残タスク（U10 Alerts & U11 Dashboard + U6/U7 E2E拡充）

## メタ情報

- **実行モード**: 方法 A（Antigravity ネイティブ `invoke_subagent` による並行実行）
- **オーケストレータ**: 親エージェント
- **サブエージェント構成**:
  - Subagent A (worker-u10): U10 アラート画面 (Alerts)
  - Subagent B (worker-u11): U11 ダッシュボード (Dashboard)
  - Subagent C (worker-u6-u7): U6 (Stores) & U7 (Devices) の 8大E2Eパターン拡充
- **ワークスペース**: 各サブエージェントは `Workspace: 'branch'` で独立実行

---

## 1. 親エージェントへの指示（オーケストレーション手順）

親エージェントは以下の手順でタスクを統括してください：

1. **サブエージェントの同時起動 (`invoke_subagent`)**:
   `Subagents` 配列に以下の 2〜3 体を同時に指定して起動します。
   - `TypeName: 'self'`
   - `Workspace: 'branch'`
   - `Role: 'U10 Alerts Engineer'` / `'U11 Dashboard Engineer'` / `'U6-U7 E2E Engineer'`
   - `Prompt`: 下記の各サブエージェント向け詳細プロンプトを渡す。

2. **サブエージェント完了待ち & ブランチ統合**:
   - 各サブエージェントから完了報告を受信したら、ブランチを作業ツリーに順次マージします。
   - 共有ファイル（`messages/ja.json`, `messages/en.json`, `e2e/mocks/mock-server.ts`）に衝突がないか確認し、結合します。

3. **統合品質ゲートの実行**:
   親環境にて以下を実行し、全テストのパスを確認します：
   ```bash
   cd apps/frontend-next
   pnpm typecheck && pnpm lint
   CI=true pnpm exec playwright test e2e/specs/alerts.spec.ts e2e/specs/dashboard.spec.ts e2e/specs/stores.spec.ts e2e/specs/devices.spec.ts
   pnpm test:smoke # 実バックエンド結合スモークテスト
   ```

4. **進捗更新 & コミット**:
   - `apps/frontend-next/_docs/plan/plan_0906_features.md` の作業状況表（U10, U11 等）を「完了」に更新。
   - `python3 _scripts/build_plan_html.py --sync` を実行。
   - コミットを作成: `feat(domains): complete U10 alerts, U11 dashboard and E2E expansions via parallel subagents`

---

## 2. 各サブエージェントの詳細指示

### 【Subagent A】 U10 アラート画面 (Alerts)
- **対象ディレクトリ**: `features/alerts/`, `e2e/specs/alerts.spec.ts`
- **作業内容**:
  1. **API正規化 & 多層防衛**: バックエンド API（`/api/v1/retail/alerts`）が配列でも `{ list, total }` でも安全に処理できるマッパーを整備。
  2. **i18n 完全対応**: `alert-list-client.tsx` 等の日本語ハードコードを `alerts` namespace に完全移行（`ja.json` / `en.json` に追加）。
  3. **モック E2E 網羅**: `alerts.spec.ts` にて以下を検証：
     - 種別・ステータスでの絞り込みと合致しないアラートの除外（`toHaveCount(0)`）
     - 0件空状態の正常表示（クラッシュゼロ）
     - 既読・確認操作の正常動作
     - STOMP WebSocket 接続状態の表示
  4. **自己検証**: `pnpm typecheck && pnpm exec playwright test e2e/specs/alerts.spec.ts` をパスして親に完了報告。

---

### 【Subagent B】 U11 ダッシュボード (Dashboard)
- **対象ディレクトリ**: `features/dashboard/`, `e2e/specs/dashboard.spec.ts`
- **作業内容**:
  1. **i18n 完全対応**: `kpi-cards.tsx`, `sales-chart.tsx`, `alert-panel.tsx`, `welcome-message.tsx` の日本語ハードコードを `dashboard` namespace に移行。
  2. **売上推移チャートの安定性**: 7日 / 30日 / 1年タブの切り替え時に「売上推移データを取得できません」が出ず、データが安全に描画されること。
  3. **モック E2E 網羅**: `dashboard.spec.ts` にて以下を検証：
     - KPIカード4枚の正常表示
     - 7日 / 30日 / 1年タブの切り替えとグラフ描画
     - アラートパネルの表示と各行のクリック動作
     - VRT 時刻固定による安定性確認
  4. **自己検証**: `pnpm typecheck && pnpm exec playwright test e2e/specs/dashboard.spec.ts` をパスして親に完了報告。

---

### 【Subagent C】 U6 (Stores) & U7 (Devices) の 8大E2Eパターン拡充
- **対象ディレクトリ**: `e2e/specs/stores.spec.ts`, `e2e/specs/devices.spec.ts`
- **作業内容**:
  1. **Stores E2E 拡充**:
     - 単一検索、除外検証（`toHaveCount(0)`）、店舗ステータス絞り込み、リセット復帰
     - ページネーション（次ページ `?page=2` 遷移、前ページ復帰）
  2. **Devices E2E 拡充**:
     - デバイス名検索、除外検証、デバイス種別・ステータス絞り込み、リセット復帰
     - ページネーション（次ページ `?page=2` 遷移）
  3. **自己検証**: `pnpm exec playwright test e2e/specs/stores.spec.ts e2e/specs/devices.spec.ts` をパスして親に完了報告。

---

## 3. 安全停止ルール（Circuit Breaker）

- 各サブエージェントは、同一エラーに対して2回修正失敗した場合は作業を止め親にエラー報告すること。
- 親エージェントはマージコンフリクトが自動解決できない場合、無理な上書きをせず人間に介入を仰ぐこと。
