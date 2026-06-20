# 追加したい機能
Task 01: ログイン画面 Backend Integration

# 背景
frontend-nextのログイン画面をsmart-dx-backendの認証APIに接続する。
現在はMock Auth（ENABLE_LOCAL_AUTH_MOCK=true）で動作しており、実バックエンドへの切り替えが必要。

# 期待する振る舞い
- ログインフォームからバックエンドの `/api/v1/auth/login` へ認証リクエスト送信
- Captcha取得・検証が正常動作 (`/api/v1/auth/captcha`)
- JWT Token (access_token, refresh_token) をhttpOnly Cookieに保存
- Token Refresh が正常動作 (`/api/v1/auth/refresh-token`)
- ログアウト時にTokenを削除
- 認証失敗時に適切なエラーメッセージ表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/captcha/route.ts`
  - `app/api/auth/refresh/route.ts`
  - `app/api/auth/logout/route.ts`
  - `lib/auth/mock-auth.ts`
  - `features/auth/`
- Mock AuthはBACKEND_URL未設定時のみ有効化するよう制御

# スコープ外
- UI変更
- 新しい認証方式の追加
- パスワードリセット機能

# 完了の目安
- 実バックエンドでログイン/ログアウトが正常動作
- Token Refreshが自動実行される
- E2Eテスト (`e2e/specs/auth.spec.ts`) 通過
