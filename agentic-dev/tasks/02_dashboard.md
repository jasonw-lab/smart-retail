# 追加したい機能
Task 02: ダッシュボード画面 Backend Integration

# 背景
frontend-nextのダッシュボード画面をsmart-dx-backendのダッシュボードAPIに接続する。
現在はMock Data (`features/dashboard/lib/mock-data.ts`) で動作している。

# 期待する振る舞い
- KPIカードがバックエンドAPI (`/api/v1/retail/dashboard/kpi`) からデータ取得
- 売上トレンドチャートがバックエンドAPI (`/api/v1/retail/dashboard/sales-trend`) からデータ取得
- データ取得失敗時にエラー表示
- ローディング状態の表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `app/[locale]/(dashboard)/page.tsx`
  - `features/dashboard/lib/` (新規作成: dashboard-api.client.ts, dashboard-api.server.ts)
  - `features/dashboard/types/` (型定義確認)
  - `features/dashboard/lib/mock-data.ts` (削除または条件分岐)
- Server ComponentでSSR、Client Componentでリアルタイム更新

# スコープ外
- ダッシュボードのレイアウト変更
- 新しいKPI指標の追加

# 完了の目安
- 全KPIカードが実データを表示
- 売上トレンドチャートが実データを表示
- E2Eテスト (`e2e/specs/dashboard.spec.ts`) 通過
