# 追加したい機能
Task 10: ロール管理画面 Backend Integration

# 背景
frontend-nextのロール管理画面をsmart-dx-backendのロールAPIに接続する。
API Clientが raw fetch() を使用しているため fetchApi() に修正が必要。

# 期待する振る舞い
- ロール一覧の表示 (`GET /api/v1/roles`)
- ロールCRUD操作が正常動作
- 権限（メニュー）割り当てが正常動作

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `features/system/lib/role-api.client.ts` (修正: raw `fetch()` → `fetchApi()`)
  - `features/system/types/role.ts` (バックエンドRoleVOと整合性確認)
- バックエンドAPIは変更不要

# スコープ外
- 権限の詳細設定
- UI変更

# 完了の目安
- ロールCRUDが全て正常動作
- 権限割り当てが正常動作
- E2Eテスト通過
