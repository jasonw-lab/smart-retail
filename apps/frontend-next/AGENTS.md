# SmartRetail Pro - Frontend Agent Guide

このファイルは、AIコーディングエージェントが本プロジェクトを安全かつ効率的に作業するためのガイドです。人間の開発者が既知とする前提で記載しています。

## 共通ルール

- `~/ai-rules/ai-common.md`: 全プロジェクト共通の AI 運用ルール（言語・記述方針、設計変更時の修正履歴、レビュー記録、テスト・品質確認、コミット・PR 等）。本ファイルと衝突する場合は本ファイルを優先します。

## プロジェクト概要

SmartRetail Pro は小売店舗向けDXソリューションの管理画面フロントエンドです。既存の Vue3 + Vite 版から Next.js 15 App Router への移行版として開発されています。

- **対象ユーザー**: 店舗管理者、本部スタッフ、システム管理者
- **主要機能**: ダッシュボード、商品管理、店舗管理、端末管理、在庫管理、取引履歴、アラート（WebSocket）、システム管理（ユーザー/ロール/メニュー/部門/辞書/ログ）
- **設計方針**: Feature-based Vertical Slice、Server/Client の明確な境界分離、httpOnly Cookie による認証

## 技術スタック

| カテゴリ          | 技術                                           |
| ----------------- | ---------------------------------------------- |
| フレームワーク    | Next.js 15 (App Router), React 19              |
| 言語              | TypeScript 5 (strict mode)                     |
| スタイル          | Tailwind CSS v4 (`@import 'tailwindcss'` 方式) |
| UI コンポーネント | shadcn/ui + Radix UI + lucide-react            |
| フォーム          | React Hook Form + Zod                          |
| サーバー状態      | TanStack Query v5                              |
| クライアント状態  | Zustand v5                                     |
| 国際化            | next-intl (ja/en)                              |
| リアルタイム通信  | @stomp/stompjs (STOMP over WebSocket)          |
| E2E テスト        | Playwright + MSW (Standalone Mock Server)      |
| 品質              | ESLint + Prettier + husky + commitlint         |
| 監視              | Sentry + /api/health                           |
| ビルドツール      | Next.js 内蔵 (Turbopack/dev)                   |

## ディレクトリ構成

```
app/
├── [locale]/                  # 国際化ルート
│   ├── (auth)/                # 認証不要グループ (login)
│   └── (dashboard)/           # 認証必須グループ
│       ├── page.tsx           # ダッシュボード
│       ├── products/
│       ├── stores/
│       ├── devices/
│       ├── inventory/
│       ├── transactions/
│       ├── alerts/
│       └── system/            # user, role, menu, dept, dict, log
└── api/                       # Route Handlers
    ├── auth/                  # login, logout, refresh, me, captcha, ws-ticket, csrf
    ├── proxy/[...path]/       # Client Component 用 Backend Proxy
    ├── ws/connect/            # WebSocket チケット交換
    ├── health/                # ヘルスチェック
    └── report/                # CSP 違反レポート受信

features/                      # 機能モジュール (Vertical Slice)
├── auth/                      # ログインフォーム
├── products/
├── stores/
├── devices/
├── inventory/
├── transactions/
├── alerts/                    # WebSocket アラート
└── system/                    # システム管理全般
    ├── components/
    ├── hooks/
    ├── lib/*-api.client.ts
    ├── lib/*-api.server.ts
    ├── schemas/
    └── types/

components/
├── ui/                        # shadcn/ui プリミティブ
├── layout/                    # Header, Sidebar, MainContent
├── providers/                 # QueryProvider, ThemeProvider など
└── language-switcher.tsx

lib/
├── api/client.ts              # Client Component 用 fetch ラッパー（timeout / retry / 401 リフレッシュ / locale 対応リダイレクト）
├── api/server.ts              # Server Component 用 Backend 直接 fetch
├── auth/mock-auth.ts          # ローカルモック認証フォールバック
├── env/server.ts              # サーバー環境変数検証（Zod）
├── env/client.ts              # クライアント環境変数検証（Zod）
├── security/                  # レート制限・CSRF 等のセキュリティユーティリティ
├── ws/ticket-store.ts         # WebSocket 短寿命チケットストア
├── format.ts                  # 共通フォーマット関数
└── utils.ts                   # cn などのユーティリティ

store/
└── app-store.ts               # Zustand: サイドバー状態など

messages/
├── ja.json
└── en.json

e2e/
├── specs/                     # Playwright テスト（件数は e2e/specs/ を参照）
├── mocks/                     # MSW Standalone Mock Server
│   ├── mock-server.ts
│   └── handlers/
├── fixtures/auth.ts           # ログインヘルパー
├── testids.ts                 # data-testid 定数
└── playwright.config.ts       # 注意: ルートの playwright.config.ts が実際に使用される

_docs/
├── adr/                       # Architecture Decision Records (8件)
├── e2e-test-policy.md         # E2E テスト方針書
├── architecture.drawio
└── security.drawio

_review/                       # レビュー指摘・レビュー対応結果（Markdown / HTML レポート）

_scripts/                      # ソースドキュメント編集・生成用スクリプト（型生成・進捗同期等）
```

## ビルド・テスト・開発コマンド

パッケージマネージャは `pnpm` を使用します（Playwright 設定内でも pnpm コマンドを呼び出します）。

```bash
# 開発サーバー (port 3001)
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動 (port 3001)
pnpm start

# テスト用本番サーバー (mock backend 向け)
pnpm start:test

# ESLint
pnpm lint
pnpm lint:fix

# E2E 用モックサーバー (port 8091)
pnpm mock:server

# E2E テスト
pnpm test:e2e          # ヘッドレス
pnpm test:e2e:ui       # UI モード
pnpm test:e2e:headed   #  headed モード
```

**注意**:

- `pnpm test:e2e` はルートの `playwright.config.ts` を使用します。`e2e/playwright.config.ts` も存在しますが、現在有効ではありません。
- E2E 実行時は `webServer` によりモックサーバー（`MOCK_PORT`、既定 8091）と Next.js 本番サーバー（`E2E_PORT`、既定 3002）が自動起動されます。
- `workers: 1` に設定されており、ログイン状態の競合を避けるため逐次実行されます。

## 実行時アーキテクチャとデータフロー

```
Browser (React 19)
    │
    ├─ Server Component ──► lib/api/server.ts ──► Spring Boot Backend API
    │                         (httpOnly Cookie から access_token を取得)
    │
    ├─ Client Component ──► lib/api/client.ts ──► /api/proxy/[...path] ──► Backend API
    │                         (401時に /api/auth/refresh で自動リフレッシュ)
    │
    └─ WebSocket (STOMP) ──► /api/auth/ws-ticket ──► /api/ws/connect ──► STOMP Broker
                              (短寿命チケットで accessToken を隠蔽)
```

### Server/Client 境界

| 場所                    | 種別             | データ取得                                    |
| ----------------------- | ---------------- | --------------------------------------------- |
| `page.tsx`              | Server Component | `fetchFromBackend` で Backend 直接 fetch      |
| `*TableClient`, `*Form` | Client Component | TanStack Query + `/api/proxy/*` Route Handler |
| `AlertListClient`       | Client Component | `useStomp` + WebSocket                        |

### 可観測性

- **ヘルスチェック**: `GET /api/health` でバックエンド接続状態と応答時間を返却します。
- **エラー監視**: Sentry で React レンダリングエラーと API エラーを収集します。
- **Web Vitals**: `useReportWebVitals` で開発時に Core Web Vitals をログ出力します。

### 認証フロー

1. ログイン: `POST /api/auth/login` → `access_token` / `refresh_token` を httpOnly Cookie に設定
2. Server Component: `cookies().get('access_token')` → Backend 直接 fetch
3. Client Component: `/api/proxy/*` → Route Handler 経由で Backend へ転送（自動リフレッシュ付き）
4. WebSocket: 短寿命チケット方式でトークンを隠蔽

### ミドルウェア

`middleware.ts` で以下を処理します:

- `next-intl` による locale ルーティング（`ja` / `en`、default: `ja`、prefix: `as-needed`）
- 静的アセット・API Route のスキップ
- `access_token` Cookie の存在チェック。未認証時は `/{locale}/login?redirect=...` へリダイレクト

## コーディング規約

- **TypeScript**: `strict: true`。`any` の使用は警告対象（`@typescript-eslint/no-explicit-any: warn`）。未使用変数は警告（アンダースコア始まりは許可）。
- **パスエイリアス**: `@/*` を使用します。
- **インデント・引用符**: 2 スペース、シングルクォート、セミコロン付き。
- **コンポーネント**: 名前付き function export。ファイル名はケバブケース（例: `device-form.tsx`）、コンポーネント名は PascalCase。
- **Server/Client**: `page.tsx` は原則 Server Component。`'use client'` は state/effects/forms/ブラウザ API/TanStack Query 使用時のみ付与します。
- **API クライアント**: Server 用と Client 用を分離します。
  - Server: `features/<domain>/lib/*-api.server.ts` → `fetchFromBackend`
  - Client: `features/<domain>/lib/*-api.client.ts` → `fetchApi`
- **バリデーション**: Zod スキーマは `features/<domain>/schemas/` に配置します。
- **スクリプト配置**: プロジェクトのソースコードと区別するため、ソースドキュメント編集・生成・同期用スクリプトは `_scripts/` に配置します。
- **フォーマット**: Prettier 導入済み。`pnpm format:check` で全体を確認し、必要なファイルだけ整形します。

## テスト戦略

- **E2E のみ**: ユニットテスト・コンポーネントテストは未導入です。
- **テストファイル**: `e2e/specs/*.spec.ts`（対象一覧はディレクトリを参照）。
- **テストケース一覧**: 各 test() の `caseMeta()`（`e2e/fixtures/case-meta.ts`）が正本です。`pnpm e2e:cases` で `_docs/testing/e2e-test-cases.xlsx` / `.md` を生成し、一覧ファイルは直接編集しません（書き方は `CONTRIBUTING.md` の「E2E テストケースの書き方」）。
- **モック**: `e2e/mocks/mock-server.ts` で Standalone HTTP Server を起動し、Backend API を模倣します。
- **ログイン**: `e2e/fixtures/auth.ts` の `login(page)` ヘルパーを使用します。
- **セレクタ方針**: `lib/testing/testids.ts` に data-testid 定数を一元管理し、コンポーネントとテストで共有します。
- **VRT**: ダッシュボード・商品一覧ページでスクリーンショット比較を実施しています。モックデータは決定論的に生成し、快照の安定性を保っています。
- **アクセシビリティ**: `e2e/specs/accessibility.spec.ts` で `@axe-core/playwright` により WCAG 2 AA 違反を検証しています。
- **カバレッジ**: Playwright 実行時に V8 カバレッジを収集し、閾値を設定しています。
- **レポート**: `e2e/playwright-report/`、`e2e/results.json`、`coverage/`、`test-results/`（トレース・スクリーンショット）が生成されます。これらは `.gitignore` 対象です。

## セキュリティ考慮事項

- **Cookie**: `access_token` / `refresh_token` は `httpOnly`、`sameSite: 'lax'`、本番のみ `secure`。localhost では `secure` を無効化しています。
- **CSP/セキュリティヘッダー**: `next.config.ts` で `Content-Security-Policy`（`report-to` / `report-uri` 付き）、`X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Permissions-Policy`、`Strict-Transport-Security` を設定しています。
- **API Proxy**: ブラウザ JavaScript から Backend トークンを隠蔽するため、Client 向け API は `/api/proxy/*` 経由とします。
- **CSRF 対策**: `/api/auth/csrf` による Double Submit Cookie 方式。状態変更リクエストは `x-csrf-token` ヘッダーで検証します。
- **レート制限**: `/api/auth/login` 等に簡易的な IP ベースのレート制限を適用しています（本番スケールでは Redis 等への置き換えを検討）。
- **WebSocket 認証**: `accessToken` を直接ブラウザに返さず、30 秒 TTL の短寿命チケットを介して交換します。
- **入力検証**: Zod スキーマでクライアント・サーバー双方を検証します。
- **機密情報**: 秘密情報は `.env.local` に保持し、コミットしないでください。

## 環境変数

`.env.example` をコピーして `.env.local` を作成します。アプリケーション起動時に `lib/env/server.ts` / `lib/env/client.ts` で Zod スキーマにより検証されます。必須項目が欠けている場合は起動失敗します。

```env
# Backend API URL (Server-side only)
BACKEND_URL=http://localhost:8080/api/v1

# WebSocket エンドポイント (ブラウザに公開)
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8091/ws

# モック API モード (true で有効化)
NEXT_PUBLIC_MOCK_API=false

# ローカルモック認証を強制 (任意)
ENABLE_LOCAL_AUTH_MOCK=true

# 本番チケットストア用 Redis URL (任意)
REDIS_URL=redis://localhost:6379
```

E2E 実行時は `E2E_PORT` / `MOCK_PORT` でポートを上書き可能です（既定: 3002 / 8091）。

## レビュー運用ルール

AI および開発者による設計・計画・コードのレビュー結果および指摘対応レポートは、プロジェクトルート直下の `_review/` フォルダへ格納します（`~/ai-rules/ai-common.md` 第3章・第8章に規定されるレビュー格納先 `docs/.review/` は、本プロジェクトでは `_review/` に読み替えて適用します）。

- **格納場所**: `_review/`
- **対象ドキュメント**:
  - 設計・計画・コードに対するレビュー指摘（Markdown）
  - レビュー指摘への対応レポート（HTML / Markdown）
- **命名規則**:
  - レビュー指摘（Markdown）: `review_<MMDD>_<対象>.<agent>.md` または `review_<MMDD>_<対象>.md`
    - 例: `review_0908_plan_0906_features.claude.md`、`review_0719_adr-011.kimi.md`
  - レビュー対応レポート（HTML）: `review_<MMDD>_<対象>-response.html`（または指摘ファイルと同名で拡張子 `.html`）
    - 例: `review_0710_adr-architecture-response.html`
- **レビュー指摘ファイルの必須項目**:
  - レビュー対象ファイル・行番号/機能
  - レビュー日、レビュアー（エージェント名または開発者名）
  - 全体評価
  - 指摘事項（重要度/重大度、対象箇所、指摘内容、推奨対応）
- **レビュー対応HTMLレポートの作成**:
  - `~/ai-rules/ai-common.md` 第3章のルールに準拠し、自己完結型HTMLとして生成・格納します。

## スクリプト運用ルール（\_scripts）

プロジェクトのソースコード（`app/`, `features/`, `components/`, `lib/` 等）と明確に区別するため、ソースドキュメントの編集・変換・生成・同期などを行う補助スクリプトは、すべて `_scripts/` フォルダへ配置します（`scripts/` ではなく `_scripts/` を使用します）。

- **格納場所**: `_scripts/`
- **対象スクリプト**:
  - ソースドキュメントの編集・同期用スクリプト（例: 進捗 HTML 同期 `_scripts/build_plan_html.py`）
  - API 型定義生成等の補助スクリプト（例: `_scripts/generate-api-types.ts`）
  - E2E テストケース一覧の生成スクリプト（`_scripts/build-e2e-cases.ts`）
- **運用原則**:
  - アプリケーションの実行時ソースコードは配置せず、ドキュメント編集および開発支援目的のスクリプトに限定します。
  - スクリプト追加・更新時は、`package.json` の npm scripts や関連ドキュメント内のパス表記も `_scripts/` に統一します。

## コミット・PR ガイドライン

- **コミットメッセージ**: Conventional Commits スタイルを推奨（例: `feat:`, `refactor:`, `docs:`, `chore:`）。
- **コミット内容**: 1 コミット 1 関心事。命令形で記述します。
- **PR**: 変更内容、影響するルート・機能、関連する Issue/ADR を記載。UI 変更はスクリーンショットを添付。
- **必須確認**: `pnpm lint`・`pnpm format:check`・`pnpm typecheck`・`pnpm build` はパスさせてください。E2E に影響する変更は `pnpm test:e2e` も確認してください。

## 既知の課題と注意点

- **Prettier / Husky**: Prettier・husky・commitlint は導入済みです。pre-commit 時に `eslint --fix` と `prettier --write` が実行されます。
- **data-testid**: `lib/testing/testids.ts` に定義し、ログイン・サイドバー等の主要コンポーネントに実装済みです。今後の画面追加時も継続的に付与してください。
- **Playwright 設定**: ルートの `playwright.config.ts` が有効です。`e2e/playwright.config.ts` は現在使用されていません。
- **CI/CD**: `.github/workflows/ci.yml` と `pr-check.yml` を使用します。PR は全 base が対象です。必須チェックの保護設定と本番デプロイの有無は別途確認してください。
- **脆弱性スキャン**: `npm audit` / Snyk 等の自動化は未導入です。
- **next.config.ts**: `reactCompiler: false` を明示設定しています（Next.js 16 移行時は `next lint` の廃止に注意）。

## UI-first API 項目整合フロー

本プロジェクトは Next.js フロントエンドへの移行版であり、Backend API は既存 Vue 版からの継続または新規整備が進行中です。そのため、**UI レイアウト・フォーム・テーブルに表示/入力されている項目を正として**、Backend API と frontend 型定義を整合させる作業を継続的に実施します。

### 基本方針

1. **UI を正とする**
   - フォーム入力項目、テーブル列、フィルター条件、詳細ダイアログに含まれる項目を収集します。
   - これらを API レスポンス/リクエストの必須項目と見なします。

2. **API 項目の照合**
   - 各機能の `features/<domain>/types/*.ts`、`lib/*-api.client.ts`、`lib/*-api.server.ts` と比較します。
   - 必要に応じて `smart-dx-backend/docs/api-interface-design.html` または Backend ソースを参照します。

3. **frontend 側の先行追加**
   - API 項目が不足している場合、まず frontend 側の TypeScript 型・API クライアント・Zod スキーマに追加します。
   - Backend 未修正時でも、frontend 型を整合状態に保ち、後続の Backend 改修に備えます。

4. **Backend 修正の記録（docs/html 出力）**
   - Backend 改修が必要な項目は `_docs/api-modifications.html` に一覧化します。
   - 各項目に対して「何を追加/変更するか」「なぜ必要か」を明記します。
   - Backend 修正後、設計書 `api-interface-design.html` を同じ変更で更新します。

5. **E2E mock server の更新**
   - 追加項目があれば `e2e/mocks/mock-server.ts` および `e2e/mocks/handlers.ts` の mock データも更新します。
   - ただし既存 E2E テストを壊さないよう、既存フィールドは維持します。

### 作業手順

```
1. UI 項目収集（forms / tables / dialogs / filters）
2. 現状の API 型・Backend 設計書と照合
3. 差分（不足項目・型不一致・名称不一致）をリスト化
4. frontend 型/API クライアントを更新
5. _docs/api-modifications.html を生成・更新
6. E2E mock server を更新
7. pnpm typecheck / lint / build で検証
```

実装の進め方（機能単位・backend e2e → frontend e2e の逐次フロー）は `_docs/workflow.md` を参照してください。機能別 issue の内容と対応状態は `_docs/issues.html` が正本であり、機能完了後に issues.html をメンテナンスします。

### 注意点

- Backend コード（`smart-dx-backend` プロジェクト）を修正する場合は、別途明示的な指示または PR 作成を行います。
- UI 項目を正としますが、明らかにフロントエンド側の未実装や誤りと思われる場合は `_docs/api-modifications.html` に「Frontend 要修正」として明記します。
- 新規機能追加時は、必ず上記フローを適用し、API 項目の抜け漏れを防ぎます。

## 関連ドキュメント

- `README.md`: プロジェクト概要、技術スタック比較（Vue 版との差分）
- `CLAUDE.md`: 関連リソース（Backend パス等）
- `_docs/adr/ADR-*.md`: アーキテクチャ決定記録
- `_docs/e2e-test-policy.md`: E2E テスト方針書
- `_docs/api-modifications.html`: UI-first 整合で判明した Backend API 修正一覧
- `_docs/workflow.md`: 機能単位の段階的実装ワークフロー
- `_docs/issues.html`: 機能単位 issue の内容と対応状態（正本）
- `_review/`: レビュー指摘・対応結果の格納ディレクトリ
- `_scripts/`: ソースドキュメント編集・生成用スクリプト

## 修正履歴

| 日付       | 改訂者      | 内容                                                                                                                |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| 2026/09/10 | antigravity | レビュー結果の格納先を `_review/` とする運用ルール、ディレクトリ構成、関連ドキュメントを追記                        |
| 2026/09/10 | antigravity | scripts フォルダをソースと区別するため `_scripts/` へリネームし、ソースドキュメント編集スクリプトの配置ルールを追記 |
| 2026/09/10 | codex       | workflow レビュー指摘に対応し、spec 件数の固定表記、Prettier・CI の前提と必須確認コマンドを更新                     |
