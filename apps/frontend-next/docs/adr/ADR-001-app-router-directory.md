# ADR-001: App Router採用とディレクトリ方針

## ステータス
承認済み (2025-05)

## 背景
SmartRetail ProのNext.js版フロントエンドを `apps/frontend-next/` として新規構築する。既存のVue3版（`apps/frontend/`）と並行運用しつつ、同一のSpring Boot バックエンドAPIに接続する。

Next.js 13以降、App RouterとPages Routerの2つのルーティング方式が存在する。App RouterはReact Server Components（RSC）を基盤とし、サーバーサイドでのデータ取得やストリーミングレンダリングが可能。

## 検討した選択肢

### 選択肢1: App Router（採用）
- React Server Componentsによるサーバーサイドレンダリング
- Nested Layouts、Parallel Routes、Intercepting Routes
- Route Handlers（API Routes相当）
- Streaming / Suspenseによる段階的UI表示

### 選択肢2: Pages Router
- 従来の安定したアーキテクチャ
- getServerSideProps / getStaticPropsによるデータ取得
- 豊富な既存ドキュメント・事例

### 選択肢3: ハイブリッド
- 段階的移行が可能
- 両ルーティング方式が共存

## 決定
**App Routerを採用する。**

### 採用理由
1. **Server Components活用**: 認証済みダッシュボードでもRSCを活用し、初回ロードのJavaScriptを削減
2. **Nested Layouts**: 管理画面の共通レイアウト（サイドバー、ヘッダー）を効率的に実装
3. **Route Handlers**: JWT認証のBFF層として活用可能（ADR-002参照）
4. **loading.tsx / error.tsx**: ローディング・エラー状態を標準化
5. **将来性**: Next.js開発チームがApp Routerを推奨、新機能はApp Router中心

### ディレクトリ構成

```
apps/frontend-next/
├── app/                          # App Router
│   ├── (auth)/                   # 認証なしグループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # 認証必須グループ
│   │   ├── layout.tsx            # サイドバー + ヘッダー + 認証チェック
│   │   ├── page.tsx              # ダッシュボードトップ
│   │   ├── products/
│   │   │   ├── page.tsx          # 商品一覧
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # 商品詳細
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx  # 商品編集
│   │   │   └── new/
│   │   │       └── page.tsx      # 商品新規作成
│   │   ├── categories/
│   │   ├── inventory/
│   │   ├── sales/
│   │   └── alerts/
│   ├── api/                      # Route Handlers
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── refresh/route.ts
│   │       └── logout/route.ts
│   ├── globals.css
│   ├── layout.tsx                # Root Layout
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── features/                     # 機能モジュール（Vertical Slice）
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── products/
│   │   ├── components/
│   │   │   ├── product-table.tsx
│   │   │   └── product-form.tsx
│   │   ├── hooks/
│   │   │   └── use-products.ts
│   │   ├── lib/
│   │   │   └── product-api.ts
│   │   └── types/
│   │       └── product.ts
│   ├── dashboard/
│   ├── inventory/
│   ├── sales/
│   └── alerts/
│
├── components/                   # 共通コンポーネント
│   ├── ui/                       # shadcn/ui
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb.tsx
│   └── providers/
│       ├── query-provider.tsx
│       └── theme-provider.tsx
│
├── lib/                          # 共通ユーティリティ
│   ├── api/
│   │   ├── client.ts             # fetch wrapper
│   │   └── server.ts             # Server Component用
│   ├── auth/
│   │   └── session.ts
│   └── utils.ts                  # cn() helper等
│
├── types/                        # グローバル型定義
│   └── api.ts
│
└── docs/
    └── adr/
```

### Route Groups の使い分け

| グループ | 用途 | レイアウト |
|---------|------|-----------|
| `(auth)` | ログイン、パスワードリセット | 認証不要、シンプルレイアウト |
| `(dashboard)` | 管理画面全般 | 認証必須、サイドバー+ヘッダー |

## 却下した選択肢の理由

### Pages Routerを却下した理由
- Server Components、Streamingが利用不可
- Next.js公式がApp Routerを推奨、Pages Routerは将来的にメンテナンスモード移行の可能性
- 新規プロジェクトでPages Routerを選択する技術的優位性がない

### ハイブリッドを却下した理由
- 2つのルーティングパターンが混在し、コードベースの複雑性が増大
- チームメンバーが両方を理解する必要がある
- 新規プロジェクトのため段階的移行のメリットがない

## トレードオフ

### 受け入れるリスク
- App Routerは比較的新しく、一部サードパーティライブラリの対応状況に注意が必要
- Server ComponentsとClient Componentsの境界設計に習熟が必要（ADR-003参照）
- キャッシュ戦略（revalidate、tags）の学習コスト

### 軽減策
- ADR-003でServer/Client境界を明確化
- 公式ドキュメント・実装パターンに準拠
- features/配下にVertical Slice構成を採用し、機能ごとの凝集度を高める

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| ルーティング | `app/` ディレクトリベースのファイルシステムルーティング |
| レイアウト | Route Groups + Nested Layouts |
| データ取得 | Server Componentでfetch、Client ComponentでTanStack Query |
| 認証 | Route Handlers経由でJWT管理（ADR-002参照）|
| ローディング | `loading.tsx` + Suspense |
| エラー | `error.tsx`、`not-found.tsx` |
