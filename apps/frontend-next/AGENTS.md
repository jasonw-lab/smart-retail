# SmartRetail Pro - Frontend Next.js 開発ガイド

> 本ファイルの共通ルールは [`../../rule.md`](../../rule.md) に集約しています。併せて参照してください。

このドキュメントは、本プロジェクトのAIコーディングエージェント向けガイドです。プロジェクトの構成、技術スタック、ビルド・テスト手順、コーディング規約、セキュリティ上の注意点をまとめています。

## プロジェクト概要

**SmartRetail Pro** の Next.js 15 App Router フロントエンドです。既存の Vue 3 版フロントエンドの移行版として構築されています。

- **アプリケーション名**: SmartRetail Pro
- **フレームワーク**: Next.js 15 (App Router) + React 19
- **言語**: TypeScript 5.8 (strict mode)
- **主要機能**: ダッシュボード、商品管理、店舗管理、端末管理、在庫管理、取引履歴、アラート（WebSocket）、システム管理（ユーザー/ロール/メニュー/部門/辞書/ログ）
- **バックエンド**: Spring Boot API（`BACKEND_URL` で指定）
- **国際化**: 日本語（`ja`）/ 英語（`en`）、デフォルトは `ja`

## 技術スタック

| 層 | 技術 |
|---|---|
| Framework | Next.js 15, React 19 |
| 言語 | TypeScript 5.8 |
| スタイル | Tailwind CSS v4 (`@theme` による CSS 変数) |
| UI コンポーネント | shadcn/ui (new-york) + Radix UI |
| アイコン | lucide-react |
| サーバー状態 | TanStack Query v5 |
| クライアント状態 | Zustand v5 |
| フォーム | React Hook Form + Zod + `@hookform/resolvers` |
| i18n | next-intl v4 |
| テーマ | next-themes |
| 日付 | date-fns |
| チャート | Recharts |
| 通知 | Sonner |
| WebSocket | @stomp/stompjs |
| E2E テスト | Playwright |
| E2E モック | カスタム Node HTTP サーバー (`e2e/mocks/mock-server.ts`) |

## 主要設定ファイル

| ファイル | 内容 |
|---|---|
| `package.json` | スクリプト、依存関係。`pnpm` が推奨。 |
| `next.config.ts` | next-intl プラグイン、CSP・セキュリティヘッダー、`NEXT_PUBLIC_APP_NAME` |
| `tsconfig.json` | `strict: true`, パスエイリアス `@/*`, `e2e` を `exclude` |
| `eslint.config.mjs` | Next.js 推奨 + `@typescript-eslint/no-unused-vars` / `no-explicit-any` |
| `postcss.config.mjs` | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| `components.json` | shadcn/ui 設定（new-york, RSC, Tailwind v4, baseColor neutral） |
| `middleware.ts` | next-intl ミドルウェア + `access_token` Cookie による認証保護 |
| `playwright.config.ts` | E2E 設定。Chromium のみ、`workers: 1`、モックサーバー・本番ビルドを自動起動 |
| `.env.example` | 環境変数のテンプレート |

## 開発・ビルド・テストコマンド

`pnpm` を使用してください（Playwright 設定も `pnpm` を呼び出します）。

```bash
# 依存関係インストール
pnpm install

# 開発サーバー（port 3001）
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動（port 3001）
pnpm start

# ESLint
pnpm lint
pnpm lint:fix

# E2E 用モックサーバー（port 8091）
pnpm mock:server

# E2E テスト
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:headed

# モックバックエンド向けに本番サーバーを起動
pnpm start:test
```

### 環境変数のセットアップ

```bash
cp .env.example .env.local
```

`.env.local` で最低限以下を設定してください。

```env
BACKEND_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8080/ws
```

- `BACKEND_URL` はサーバーサイド専用です。末尾に `/api/v1` を含めてください。
- `NEXT_PUBLIC_WS_ENDPOINT` はブラウザから WebSocket 接続に使用されます。
- `NEXT_PUBLIC_MOCK_API=true` でモック API モードを有効化できます。
- `ENABLE_LOCAL_AUTH_MOCK=true` でローカルモック認証を強制できます。

## アーキテクチャとランタイム

### Next.js App Router 構成

```
app/
├── layout.tsx                    # ルートレイアウト（next-intl 用の最小構成）
├── globals.css                   # Tailwind v4 テーマ + カスタムスタイル
├── [locale]/                     # 国際化ルート
│   ├── layout.tsx                # フォント・プロバイダー
│   ├── loading.tsx / error.tsx / not-found.tsx
│   ├── (auth)/                   # 認証不要ルートグループ
│   │   ├── layout.tsx            # ログイン画面用レイアウト
│   │   └── login/page.tsx
│   └── (dashboard)/              # 認証必須ルートグループ
│       ├── layout.tsx            # サイドバー + 認証チェック
│       ├── page.tsx              # ダッシュボード
│       ├── products/             # 商品管理
│       ├── stores/               # 店舗管理
│       ├── devices/              # 端末管理
│       ├── inventory/            # 在庫管理
│       ├── transactions/         # 取引履歴
│       ├── alerts/               # アラート
│       └── system/               # システム管理
└── api/                          # Route Handlers
    ├── auth/                     # ログイン/ログアウト/リフレッシュ/Me/Captcha/WS ticket
    ├── proxy/[...path]/          # クライアント向けバックエンドプロキシ
    └── ws/connect                # WebSocket チケット交換
```

### 認証・セッション管理

- JWT は `access_token` / `refresh_token` の httpOnly Cookie に保存されます。
- `middleware.ts` で保護対象パスに `access_token` がない場合は `/{locale}/login?redirect=...` へリダイレクトします。
- 公開パス: `/login`, `/api/auth/login`
- ローカル開発時は `lib/auth/mock-auth.ts` によるモック認証が自動有効化されます（`BACKEND_URL` が `localhost` / `127.0.0.1` の場合、または `ENABLE_LOCAL_AUTH_MOCK=true`）。

### Server Component / Client Component の境界

| 用途 | 種別 | データ取得先 |
|---|---|---|
| `page.tsx`, `layout.tsx` | Server Component | バックエンド直接 `fetch` (`lib/api/server.ts`) |
| `*TableClient`, `*Form`, `*Dialog` | Client Component | Route Handler 経由 (`lib/api/client.ts`) + TanStack Query |
| アラート | Client Component | STOMP WebSocket |

原則として `page.tsx` / `layout.tsx` は Server Component のままにし、state/effect/form/ブラウザ API/TanStack Query を使う場合のみ `'use client'` を付けてください。

### API アクセスパターン

#### Server Component 用: `lib/api/server.ts`

```typescript
import { fetchFromBackend } from '@/lib/api/server';

const data = await fetchFromBackend<ProductVO[]>('retail/products');
```

- パスには `BACKEND_URL` および `/api/v1` のプレフィックスを含めません。
- `access_token` Cookie から JWT を取得し、`Authorization: Bearer` ヘッダーで送信します。
- バックエンドのレスポンス `{ code, msg, data }` を unwrap し、`code === '00000'` 以外はエラーとします。
- トークンなし / 401 の場合は `redirect('/login')` します。async 関数内で `redirect()` を呼んだ場合、呼び出し側では `isRedirectError()` を使って NEXT_REDIRECT エラーを再 throw してください。

#### Client Component 用: `lib/api/client.ts`

```typescript
import { fetchApi } from '@/lib/api/client';

const data = await fetchApi<ProductVO[]>('/api/proxy/api/v1/retail/products');
```

- パスは `/api/proxy/api/v1/...` から始めます。Route Handler が重複する `api/v1` を取り除いてバックエンドへ転送します。
- 401 時に `/api/auth/refresh` で自動リフレッシュを試行し、成功すればリトライします。
- リフレッシュ失敗時は `/login` へ遷移します。

### WebSocket 認証フロー

1. クライアントが `/api/auth/ws-ticket` を GET → サーバーが 30 秒 TTL・1 回限りの UUID チケットを発行し、`lib/ws/ticket-store.ts` にアクセストークンを紐付けて保存。
2. クライアントが `/api/ws/connect` にチケットを POST → サーバーがチケットを消費し、短期間有効な WS 用トークンを返却。
3. クライアントが STOMP 接続時に `Authorization: Bearer <token>` を付与。

これにより、長期有効なアクセストークンをブラウザの WebSocket に露出させることを防ぎます。

## コード構成

### `features/<ドメイン>/` - Vertical Slice 構成

各機能は以下のディレクトリを持ちます。

```
features/products/
├── components/           # 機能固有の React コンポーネント
├── hooks/                # TanStack Query フック等
├── lib/                  # API クライアント、ユーティリティ
│   ├── product-api.client.ts
│   └── product-api.server.ts
├── schemas/              # Zod スキーマ
├── types/                # 機能固有の型
└── index.ts              # 公開 API の再エクスポート
```

主要機能:

- `features/auth/` - ログインフォーム
- `features/dashboard/` - KPI、売上チャート、アラートパネル
- `features/products/` - 商品 CRUD
- `features/stores/` - 店舗 CRUD
- `features/devices/` - 端末 CRUD
- `features/inventory/` - 在庫照会、補充/廃棄/履歴
- `features/transactions/` - 取引履歴
- `features/alerts/` - WebSocket アラート、接続管理
- `features/system/` - ユーザー/ロール/メニュー/部門/辞書/ログ

### 共有ディレクトリ

- `components/ui/` - shadcn/ui コンポーネントと `data-table`, `filter-bar`, `confirm-dialog`, `status-badge` などのカスタム共有 UI
- `components/layout/` - `sidebar.tsx`, `header.tsx`, `main-content.tsx`
- `components/providers/` - `query-provider.tsx`, `theme-provider.tsx`
- `lib/api/client.ts`, `lib/api/server.ts` - 前述の API ラッパー
- `lib/utils.ts` - `cn()` (clsx + tailwind-merge)
- `lib/format.ts` - 通貨、日時、パーセントのフォーマッター
- `lib/ws/ticket-store.ts` - WS チケットのインメモリストア
- `store/app-store.ts` - Zustand サイドバー状態
- `types/api.ts` - 共有型 (`PageResult`, `PageQuery`, `ApiResult`, `AuthToken`, `UserInfo`)
- `messages/ja.json`, `messages/en.json` - next-intl 翻訳
- `e2e/` - Playwright テスト、モックサーバー、fixture、testids

### `src/` ディレクトリ

`src/` は空です。ソースコードは `app/`, `features/`, `components/`, `lib/` などのプロジェクトルート直下に配置されます。

## 無視するフォルダ

`ign_*` にマッチするフォルダはエージェント操作の対象外です。明示的な指示がない限り、内部のファイルを読み取り・変更・参照しないでください。

## コーディング規約

### 命名規則

- ファイル名: **kebab-case**（例: `product-form.tsx`, `use-products.ts`, `product-api.client.ts`）
- React コンポーネント名 / 型名: **PascalCase**（例: `ProductForm`, `ProductTableClient`）
- コンポーネントは **named export** でエクスポート
- hooks は `use*` プレフィックス

### TypeScript / スタイル

- 2 スペースインデント、シングルクォート、セミコロン付き
- strict TypeScript
- パスエイリアス `@/*` を使用
- `any` の使用は警告対象（可能な限り避ける）
- 未使用変数は警告（`_` 始まりは許可）

### Server / Client の境界

- Server Component をデフォルトとする
- `'use client'` は以下の場合のみ使用:
  - React state / effect
  - フォーム入力
  - ブラウザ API
  - TanStack Query
  - Radix UI 等のクライアント専用インタラクティブコンポーネント

### フォーム・バリデーション

- Zod スキーマは `features/<domain>/schemas/` に配置
- React Hook Form と `@hookform/resolvers` で連携
- エラーメッセージは `messages/ja.json` / `messages/en.json` 経由で国際化

### UI / スタイル

- Tailwind CSS v4 は `app/globals.css` 内の `@theme` で設定
- shadcn/ui コンポーネントは `npx shadcn add <component>` で追加
- 独自デザインシステム "Stitch Design System" のカラーパレットが定義済み

### リンク・リダイレクト

- next-intl の `localePrefix: 'as-needed'` を使用
- リンクや `redirect()` には `@/i18n/navigation` の `Link` / `redirect` / `useRouter` を使用し、ロケールを正しく扱ってください

## テスト戦略

### E2E テスト (Playwright)

- 設定: `playwright.config.ts`（`e2e/playwright.config.ts` も同内容を手動同期）
- テストディレクトリ: `e2e/specs/`
- ブラウザ: Chromium のみ
- ワーカー: `workers: 1`（ログイン競合を避けるため）
- リトライ: CI で 2 回、ローカルで 1 回
- レポーター: HTML (`e2e/playwright-report/`), JSON (`e2e/results.json`), list

### モックサーバー

- `pnpm mock:server` で `e2e/mocks/mock-server.ts` を起動（port 8091、環境変数 `MOCK_PORT` で変更可）
- 認証、ダッシュボード、商品、店舗、端末、在庫、取引、アラート、システムモジュールのモックレスポンスを提供
- Playwright の `webServer` と `pnpm start:test` で使用
- `msw` パッケージはインストールされ、`e2e/mocks/handlers/` にハンドラファイルがありますが、現時点ではカスタム Node HTTP サーバーが主に使用されています

### テスト作成の指針

- スペック: `e2e/specs/*.spec.ts`
- 共通処理: `e2e/fixtures/auth.ts` の `login(page)` ヘルパーを使用
- セレクタ: `e2e/testids.ts` の `TESTIDS` 定数 / `testId()` ヘルパーを使用
- ユーザーに見えるアサーションとルート単位のフローを優先
- 単体テスト・カバレッジ閾値は未設定のため、変更後は `pnpm lint` と `pnpm test:e2e` で検証してください

### 既存の E2E スペック

- `auth.spec.ts` - ログイン、バリデーション、未認証リダイレクト
- `dashboard.spec.ts` - 認証後ダッシュボードの表示
- `navigation.spec.ts` - サイドバー遷移、システムメニュー展開、レスポンシブ
- `products.spec.ts` - 商品一覧/フォームの構造とバリデーション
- `security-headers.spec.ts` - CSP, X-Frame-Options, HSTS 等

## セキュリティ

### 認証・Cookie

- JWT は httpOnly Cookie に保存
- 本番環境では `Secure` 属性、ローカル開発時は無効
- `SameSite: 'lax'`
- クライアントコードはトークンに直接触れず、Server Component では `cookies()`、Client Component では `/api/proxy/*` 経由でアクセス

### セキュリティヘッダー

`next.config.ts` で以下を設定しています。

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security`

### 入力・出力

- フォームは Zod でクライアント側バリデーション
- バックエンドでも再バリデーション
- React JSX による自動エスケープ

### WebSocket

前述の通り、短期間・1 回限りのチケット方式を採用し、長期トークンの露出を防ぎます。

### 環境変数・シークレット

- シークレットは `.env.local` に保存（gitignore 済み）
- クライアントに露出すべきでない値には `NEXT_PUBLIC_` プレフィックスを付けない
- `next.config.ts` の `env` で公開する値は `NEXT_PUBLIC_APP_NAME` のみ

## デプロイ

### ビルド成果物

- Next.js 標準出力: `.next/`
- 静的エクスポート (`out/`) は未設定
- 本番実行: `next start -p 3001`

### Docker

- プロジェクト単体の Dockerfile は `platform/docker/frontend/Dockerfile` に存在しますが、**非推奨**です。現在はフロントエンドを VPS 上で直接ビルドし、メイン nginx コンテナで配信しています。
- インフラ（MySQL, Redis, MinIO 等）はモノレポルートの `platform/docker/docker-compose-env.yml` で起動します。
- バックエンドは `../smart-dx-backend/` 配下で管理されています。

### CI/CD

- 現時点では GitHub Actions 等の CI パイプラインは未導入です。

## 関連ドキュメント

- `README.md` - 人間向けプロジェクト概要（日本語）
- `CLAUDE.md` - AI 開発ルール（日本語）
- `_docs/adr/` - Architecture Decision Records
- `_docs/e2e-test-policy.md` - E2E テスト方針
- `_docs/architecture.drawio` - アーキテクチャ図

## コミット・PR ガイドライン

- Conventional Commit スタイルを推奨: `feat:`, `refactor:`, `docs:`, `chore:` 等
- コミットは焦点を絞り、命令形で記述
- PR には変更内容、影響範囲、関連 Issue/ADR、UI 変更のスクリーンショットを記載
- テスト結果（特に `pnpm lint` と関連する Playwright 実行）を明記
