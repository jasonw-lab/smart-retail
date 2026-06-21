# 追加したい機能
Task 12: ログ管理画面 Backend Integration

# 背景
frontend-nextのログ管理画面をsmart-dx-backendのログAPIに接続する。

# 期待する振る舞い
- ログ一覧がページネーション付きで表示 (`GET /api/v1/logs/page`)
- 日付範囲、ユーザー、操作種別でフィルタ
- ログ詳細の表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `features/system/lib/log-api.client.ts` (fetchApi()使用確認)
  - `features/system/types/log.ts` (バックエンドLogVOと整合性確認)
- バックエンドAPIは変更不要

# スコープ外
- ログのエクスポート
- ログの削除
- UI変更

# 完了の目安
- ログ一覧が正常表示
- フィルタが正常動作
- E2Eテスト通過
