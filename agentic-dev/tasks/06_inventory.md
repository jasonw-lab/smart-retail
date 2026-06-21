# 追加したい機能
Task 06: 在庫管理画面 Backend Integration

# 背景
frontend-nextの在庫管理画面をsmart-dx-backendの在庫APIに接続する。
ページネーション用の `/page` エンドポイントがバックエンドに不足している。

# 期待する振る舞い
- 在庫一覧がページネーション付きで表示 (`GET /api/v1/retail/inventories/page`) ※Backend追加
- 在庫検索・フィルタが正常動作
- 在庫詳細の表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - Frontend:
    - `features/inventory/types/inventory.ts` (バックエンドInventoryVOに合わせて拡張)
    - `features/inventory/lib/inventory-api.client.ts`
  - Backend:
    - `InventoryController.java` (追加: `/page` エンドポイント with PageResult<InventoryVO>)

# スコープ外
- 在庫調整機能
- 棚卸機能
- UI変更

# 完了の目安
- 在庫一覧が正常表示
- ページネーションが正常動作
- E2Eテスト通過
