調査を出力フォーマットに従ってまとめます。

---

# 調査結果: Task 01 - ログイン画面 Backend Integration

## 1. フロントエンド現状

### 対象ファイル
- `apps/frontend-next/app/api/auth/login/route.ts`: ログインAPI Route
- `apps/frontend-next/app/api/auth/captcha/route.ts`: Captcha取得API Route
- `apps/frontend-next/app/api/auth/refresh/route.ts`: Token Refresh API Route
- `apps/frontend-next/app/api/auth/logout/route.ts`: ログアウトAPI Route
- `apps/frontend-next/lib/auth/mock-auth.ts`: Mock認証ロジック
- `apps/frontend-next/features/auth/components/login-form.tsx`: ログインフォームUI

### 現状の問題点

1. **Content-Type不一致** (`login/route.ts:77-83`)
   - 現状: `application/json`でPOST
   - バックエンド期待: `multipart/form-data`
   - Vueフロントエンド(`apps/frontend/src/api/auth.api.ts:8-19`)では`FormData`を使用

2. **Mock Authのフォールバック問題** (`login/route.ts:61-72, 94-107`)
   - `BACKEND_URL`がlocalhost含む場合、常にMock Authが有効になる
   - バックエンド接続失敗時もMock Authにフォールバック
   - 要件: BACKEND_URL未設定時のみMock有効化

3. **ログアウトHTTPメソッド不一致** (`logout/route.ts:14`)
   - 現状: `DELETE`メソッド
   - バックエンド: `POST`メソッド (`apps/frontend/src/api/auth.api.ts:42`)

4. **Captchaエラーハンドリング** (`captcha/route.ts:15-21, 31-37`)
   - バックエンド未接続時にダミーCaptchaを返す
   - 本番環境では適切なエラー返却が必要

## 2. バックエンドAPI

### エンドポイント一覧
| Method | Path | 説明 | 実装状況 |
|--------|------|------|----------|
| POST | `/api/v1/auth/login` | ログイン（multipart/form-data） | 済 |
| GET | `/api/v1/auth/captcha` | Captcha取得 | 済 |
| POST | `/api/v1/auth/refresh-token?refreshToken=xxx` | Token Refresh | 済 |
| POST | `/api/v1/auth/logout` | ログアウト | 済 |
| GET | `/api/v1/users/me` | ユーザー情報取得 | 済 |

### バックエンド変更が必要な箇所
- なし（全API実装済み）

## 3. 型定義の差分

### Frontend型 (login/route.ts)
```typescript
interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
  tenantId?: number;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
```

### Backend期待（Vue参照）
```typescript
// LoginFormData
{
  username: string;
  password: string;
  captchaId: string;  // 必須
  captchaCode: string; // 必須
  tenantId?: string;   // string型
}

// LoginResult
{
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
```

### 差分・修正必要箇所
- `captchaId`: optional → 必須に変更（validation）
- `captchaCode`: optional → 必須に変更（validation）
- `tenantId`: `number` → `string`に変更

## 4. 実装方針

### 変更ファイル一覧
1. `apps/frontend-next/app/api/auth/login/route.ts`
   - Content-Typeを`multipart/form-data`に変更
   - Mock Auth判定ロジックを修正（BACKEND_URL未設定時のみ）
   - フォールバックロジックを削除

2. `apps/frontend-next/app/api/auth/logout/route.ts`
   - HTTPメソッドを`DELETE`から`POST`に変更

3. `apps/frontend-next/app/api/auth/captcha/route.ts`
   - BACKEND_URL未設定時のみダミーCaptcha返却
   - 接続エラー時は500エラーを返却

4. `apps/frontend-next/app/api/auth/refresh/route.ts`
   - Mock判定ロジックを修正（BACKEND_URL未設定時のみ）

5. `apps/frontend-next/lib/auth/mock-auth.ts`
   - `isLocalMockAuthEnabled()`からlocalhost判定を削除

### 実装手順
1. `mock-auth.ts`の`isLocalMockAuthEnabled()`を修正
2. `login/route.ts`でFormData送信に変更、Mock判定ロジック修正
3. `captcha/route.ts`のエラーハンドリング修正
4. `refresh/route.ts`のMock判定ロジック修正
5. `logout/route.ts`のHTTPメソッドをPOSTに変更
6. E2Eテスト実行で動作確認

### UI変更
- なし（タスク定義によりスコープ外）

## 5. テスト方針

### ユニットテスト
- 既存のMockハンドラーを使用したE2Eテスト

### E2Eテスト
- `e2e/specs/auth.spec.ts`: 既存テスト
  - ログインページ表示
  - バリデーションエラー表示
  - 未認証リダイレクト
- 追加テスト候補:
  - ログイン成功→ダッシュボード遷移
  - ログイン失敗→エラーメッセージ表示
  - ログアウト→ログインページリダイレクト

### 実バックエンド接続テスト
- `BACKEND_URL=http://localhost:8091/api/v1`設定
- 手動でログイン/ログアウト動作確認
- Token Refresh自動実行確認
