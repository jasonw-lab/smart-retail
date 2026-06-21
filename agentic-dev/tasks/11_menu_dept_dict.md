# 追加したい機能
Task 11: メニュー・部門・辞書管理画面 Backend Integration

# 背景
frontend-nextのシステム管理画面（メニュー、部門、辞書）をsmart-dx-backendに接続する。

# 期待する振る舞い
- メニュー管理: ツリー構造でメニュー表示、CRUD操作 (`/api/v1/menus`)
- 部門管理: ツリー構造で部門表示、CRUD操作 (`/api/v1/depts`)
- 辞書管理: 辞書一覧・項目のCRUD操作 (`/api/v1/dicts`)

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `features/system/lib/menu-api.client.ts` (fetchApi()使用確認)
  - `features/system/lib/dept-api.client.ts` (fetchApi()使用確認)
  - `features/system/lib/dict-api.client.ts` (fetchApi()使用確認)
  - 各types/*.ts (バックエンドVOと整合性確認)
- バックエンドAPIは変更不要

# スコープ外
- UI変更

# 完了の目安
- 3画面全てのCRUDが正常動作
- E2Eテスト通過
