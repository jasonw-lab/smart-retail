# 追加したい機能
Task 09: ユーザー管理画面 Backend Integration

# 背景
frontend-nextのユーザー管理画面をsmart-dx-backendのユーザーAPIに接続する。
API Clientが raw fetch() を使用しているため fetchApi() に修正が必要。

# 期待する振る舞い
- ユーザー一覧がページネーション付きで表示 (`GET /api/v1/users/page`)
- ユーザーCRUD操作が正常動作
- ロール割り当てが正常動作
- ステータス変更が正常動作

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `features/system/lib/user-api.client.ts` (修正: raw `fetch()` → `fetchApi()`)
  - `features/system/types/user.ts` (バックエンドUserVOと整合性確認)
- バックエンドAPIは変更不要

# スコープ外
- パスワードポリシー設定
- 二要素認証
- UI変更

# 完了の目安
- ユーザーCRUDが全て正常動作
- API ClientがfetchApi()を使用
- E2Eテスト通過
