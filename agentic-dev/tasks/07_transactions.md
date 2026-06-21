# 追加したい機能
Task 07: 取引履歴画面 Backend Integration

# 背景
frontend-nextの取引履歴画面をsmart-dx-backendの売上APIに接続する。
FrontendのTransaction型とBackendのSales型のマッピングが必要。
ページネーション用の `/page` エンドポイントがバックエンドに不足している。

# 期待する振る舞い
- 取引一覧がページネーション付きで表示 (`GET /api/v1/retail/sales/page`) ※Backend追加
- 取引検索・フィルタが正常動作（日付範囲、店舗、ステータス）
- 取引詳細の表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - Frontend:
    - `features/transactions/types/transaction.ts` (Transaction→Salesマッピング)
    - `features/transactions/lib/transaction-api.client.ts`
  - Backend:
    - `SalesController.java` (追加: `/page` エンドポイント with PageResult<SalesVO>)

# スコープ外
- 取引の編集・削除
- レシート印刷
- UI変更

# 完了の目安
- 取引一覧が正常表示
- ページネーションが正常動作
- E2Eテスト通過
