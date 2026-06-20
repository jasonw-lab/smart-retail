# 追加したい機能
Task 04: 店舗管理画面 Backend Integration

# 背景
frontend-nextの店舗管理画面をsmart-dx-backendの店舗APIに接続する。
ドロップダウン用の `/list` エンドポイントがバックエンドに不足している。

# 期待する振る舞い
- 店舗一覧がページネーション付きで表示 (`GET /api/v1/retail/stores/page`)
- ドロップダウン用店舗リスト取得 (`GET /api/v1/retail/stores/list`) ※Backend追加
- 店舗CRUD操作が正常動作
- 検索・フィルタが正常動作

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - Frontend:
    - `features/stores/types/store.ts` (拡張: address, phone, managerName等)
    - `features/stores/lib/store-api.client.ts`
    - `features/stores/lib/store-api.server.ts`
  - Backend:
    - `StoreController.java` (追加: `/list` エンドポイント)

# スコープ外
- 店舗の地図表示
- UI変更

# 完了の目安
- 店舗CRUDが全て正常動作
- ドロップダウンで店舗選択可能
- E2Eテスト通過
