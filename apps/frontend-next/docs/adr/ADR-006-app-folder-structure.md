# ADR-006: Next.js App Routerフォルダ構成

## ステータス
承認済み (2025-05)

## 背景
Next.js App Routerでは、`app/`ディレクトリ配下のファイル・フォルダ構成がルーティングに直結する。SmartRetail Proは業務システム（管理画面）であり、以下の要件を満たすフォルダ構成が必要:

- 認証有無によるレイアウト分離
- 機能モジュールごとの整理
- Server/Client Componentの責務分離
- コロケーション（関連ファイルを近くに配置）

## 検討した選択肢

### 選択肢1: Route Groups + features/コロケーション（採用）
- `app/`はルーティングのみ
- ビジネスロジック・コンポーネントは`features/`に配置
- Route Groupsで認証有無を分離

### 選択肢2: app/内にすべて配置
- page.tsx、components、hooks等をすべて`app/`配下に配置
- Next.js公式のコロケーション推奨に準拠

### 選択肢3: pages/的なフラット構造
- `app/`直下にすべてのページを配置
- グルーピングなし

## 決定
**Route Groups + features/コロケーション（選択肢1）を採用する。**

### 採用理由

1. **ルーティングとビジネスロジックの分離**
   - `app/`はルーティング定義（page.tsx, layout.tsx）に専念
   - 複雑なコンポーネント・フックは`features/`に配置
   - app/の見通しが良くなる

2. **機能モジュールの凝集度**
   - 商品管理に関するものは`features/products/`に集約
   - 関連ファイルが近くにあり、変更影響範囲が明確

3. **テスト・リファクタリングの容易さ**
   - features/配下は独立したモジュールとしてテスト可能
   - 機能追加・削除がfeatures/単位で完結

### フォルダ構成

```
apps/frontend-next/
├── app/                              # ルーティング層
│   ├── (auth)/                       # 認証不要グループ
│   │   ├── layout.tsx                # シンプルレイアウト（センタリング）
│   │   ├── login/
│   │   │   └── page.tsx              # ログインページ
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                  # 認証必須グループ
│   │   ├── layout.tsx                # ダッシュボードレイアウト
│   │   │                             #   - Sidebar
│   │   │                             #   - Header
│   │   │                             #   - AuthGuard
│   │   ├── page.tsx                  # ダッシュボードトップ
│   │   │
│   │   ├── products/                 # 商品管理
│   │   │   ├── page.tsx              # 一覧 [Server]
│   │   │   ├── loading.tsx           # ローディング
│   │   │   ├── error.tsx             # エラー
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # 新規作成
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # 詳細
│   │   │       └── edit/
│   │   │           └── page.tsx      # 編集
│   │   │
│   │   ├── categories/               # カテゴリ管理
│   │   │   ├── page.tsx
│   │   │   └── ...
│   │   │
│   │   ├── inventory/                # 在庫管理
│   │   │   ├── page.tsx              # 在庫一覧
│   │   │   ├── in/
│   │   │   │   └── page.tsx          # 入庫
│   │   │   └── out/
│   │   │       └── page.tsx          # 出庫
│   │   │
│   │   ├── sales/                    # 売上管理
│   │   │   ├── page.tsx              # 売上一覧
│   │   │   └── analytics/
│   │   │       └── page.tsx          # 売上分析
│   │   │
│   │   ├── alerts/                   # アラート管理
│   │   │   └── page.tsx              # アラート一覧（STOMP）
│   │   │
│   │   └── settings/                 # 設定
│   │       ├── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   │
│   ├── api/                          # Route Handlers
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   └── ws-token/route.ts
│   │   └── proxy/
│   │       └── [...path]/route.ts    # APIプロキシ
│   │
│   ├── globals.css                   # グローバルスタイル
│   ├── layout.tsx                    # Root Layout
│   ├── loading.tsx                   # グローバルローディング
│   ├── error.tsx                     # グローバルエラー
│   └── not-found.tsx                 # 404
│
├── features/                         # 機能モジュール層
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx        # [Client]
│   │   │   └── logout-button.tsx     # [Client]
│   │   ├── lib/
│   │   │   └── auth-api.ts
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   └── types/
│   │       └── auth.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── product-table.tsx     # [Client] TanStack Table
│   │   │   ├── product-form.tsx      # [Client] React Hook Form
│   │   │   ├── product-card.tsx      # [Server] 静的表示
│   │   │   └── product-filters.tsx   # [Client] 検索フィルタ
│   │   ├── lib/
│   │   │   └── product-api.ts        # API関数
│   │   ├── hooks/
│   │   │   ├── use-products.ts       # TanStack Query
│   │   │   └── use-product-form.ts   # フォームロジック
│   │   ├── schemas/
│   │   │   └── product-schema.ts     # Zodスキーマ
│   │   └── types/
│   │       └── product.ts
│   │
│   ├── categories/
│   │   └── ...
│   │
│   ├── inventory/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── sales/
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── kpi-cards.tsx         # [Server] 静的KPI表示
│   │   │   ├── sales-trend-chart.tsx # [Client] Recharts
│   │   │   ├── inventory-status.tsx  # [Client] Recharts
│   │   │   └── recent-alerts.tsx     # [Client] リアルタイム
│   │   └── lib/
│   │       └── dashboard-api.ts
│   │
│   └── alerts/
│       ├── components/
│       │   └── alert-list.tsx        # [Client] STOMP購読
│       ├── hooks/
│       │   ├── use-stomp.ts
│       │   └── use-alert-subscription.ts
│       ├── store/
│       │   └── alert-store.ts        # Zustand
│       └── types/
│           └── alert.ts
│
├── components/                       # 共通コンポーネント層
│   ├── ui/                           # shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── layout/                       # レイアウトコンポーネント
│   │   ├── sidebar/
│   │   │   ├── sidebar.tsx           # [Client] 開閉状態
│   │   │   ├── sidebar-nav.tsx
│   │   │   └── sidebar-item.tsx
│   │   ├── header/
│   │   │   ├── header.tsx            # [Client] ユーザーメニュー
│   │   │   ├── user-menu.tsx
│   │   │   └── notifications.tsx
│   │   └── breadcrumb.tsx            # [Server]
│   │
│   ├── data-display/                 # データ表示系
│   │   ├── data-table.tsx            # [Client] TanStack Table wrapper
│   │   ├── stat-card.tsx             # [Server]
│   │   └── empty-state.tsx           # [Server]
│   │
│   └── providers/                    # Providers
│       ├── query-provider.tsx        # TanStack Query
│       ├── theme-provider.tsx        # next-themes
│       └── app-providers.tsx         # 統合Provider
│
├── lib/                              # ユーティリティ層
│   ├── api/
│   │   ├── client.ts                 # Client Component用fetch
│   │   └── server.ts                 # Server Component用fetch
│   ├── utils.ts                      # cn(), formatDate()等
│   └── constants.ts                  # 定数
│
├── store/                            # グローバル状態
│   └── app-store.ts                  # サイドバー開閉等
│
├── types/                            # グローバル型定義
│   ├── api.ts                        # API共通型
│   └── index.ts
│
├── middleware.ts                     # 認証Middleware（プロジェクトルート必須）
│
└── docs/
    └── adr/
```

### Middleware配置について

**重要**: Next.jsのMiddlewareは以下の場所に配置する必要がある:
- プロジェクトルート: `middleware.ts`
- `src`ディレクトリ使用時: `src/middleware.ts`

`app/middleware.ts` に配置すると動作しない。

### Middleware vs Layout の認証責務

| 責務 | Middleware | (dashboard)/layout.tsx |
|-----|------------|----------------------|
| Cookie有無チェック | ○ | - |
| 未認証リダイレクト | ○ | - |
| 認証済みでのloginリダイレクト | ○ | - |
| AuthGuardコンポーネント | - | ○ |
| ユーザー情報取得 | - | ○ |
| レイアウト構造 | - | ○ |

```typescript
// middleware.ts（プロジェクトルート）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // 認証不要パス
  const publicPaths = ['/login', '/forgot-password', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (!isPublicPath && !accessToken) {
    // 未認証 → ログインへリダイレクト
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && accessToken) {
    // 認証済みでログインページ → ダッシュボードへ
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Route Groups詳細

| グループ | パス | レイアウト | 認証 |
|---------|------|-----------|------|
| `(auth)` | `/login`, `/forgot-password` | センタリング、ロゴのみ | 不要 |
| `(dashboard)` | `/`, `/products`, `/inventory`, ... | Sidebar + Header | 必須 |

### ファイル命名規則

| 種別 | 命名規則 | 例 |
|------|---------|-----|
| ページ | `page.tsx` | `app/(dashboard)/products/page.tsx` |
| レイアウト | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| ローディング | `loading.tsx` | `app/(dashboard)/products/loading.tsx` |
| エラー | `error.tsx` | `app/(dashboard)/products/error.tsx` |
| コンポーネント | kebab-case | `product-table.tsx` |
| フック | `use-*.ts` | `use-products.ts` |
| 型定義 | 単数形 | `product.ts` |
| API関数 | `*-api.ts` | `product-api.ts` |
| Zodスキーマ | `*-schema.ts` | `product-schema.ts` |

## 却下した選択肢の理由

### app/内にすべて配置を却下した理由
- ページ数が増えると`app/`配下が肥大化
- 機能間の依存関係が見えにくい
- テストファイルの配置が煩雑

### フラット構造を却下した理由
- 認証有無のレイアウト分離が困難
- 関連ページのグルーピングができない
- 大規模アプリでスケールしない

## トレードオフ

### 受け入れるリスク
- `app/`と`features/`の間でimportが発生
- ファイル数が多くなる
- 初期学習コスト

### 軽減策
- パスエイリアス（`@/features/products`）で可読性確保
- 明確な命名規則でファイル検索を容易に
- READMEに構成方針を記載
- ESLint境界ルールでFeature間の不正importを防止

### Feature境界の維持（ESLint設定）

Feature間での無秩序なimportを防ぐため、`eslint-plugin-import`で境界ルールを設定:

```javascript
// eslint.config.mjs
import importPlugin from 'eslint-plugin-import';

export default [
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Feature間の直接import禁止（types/publicを除く）
            {
              target: './features/products',
              from: './features/!(products)/**/*',
              except: ['**/types/**', '**/public/**'],
              message: 'Feature間の直接importは禁止。types/またはpublic/のみ許可。',
            },
            {
              target: './features/alerts',
              from: './features/!(alerts)/**/*',
              except: ['**/types/**', '**/public/**'],
            },
            // 他のfeatureも同様に設定...

            // Client専用ファイルをServer Componentからimport禁止
            {
              target: './app/**/page.tsx',
              from: './**/*.client.ts',
              message: 'Server Componentから*.client.tsのimportは禁止。',
            },
            {
              target: './app/**/page.tsx',
              from: './features/**/hooks/**',
              message: 'Server ComponentからClient専用hooksのimportは禁止。',
            },
          ],
        },
      ],
    },
  },
];
```

**Feature間import許可範囲:**

| importソース | 許可 | 備考 |
|-------------|-----|------|
| `features/*/types/` | ○ | 型定義は共有可能 |
| `features/*/public/` | ○ | 公開APIとして明示的にexport |
| `features/*/components/` | × | 内部実装として保護 |
| `features/*/hooks/` | × | 内部実装として保護 |
| `features/*/lib/` | × | 内部実装として保護 |

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| ルーティング | `app/`配下のpage.tsx |
| レイアウト | Route Groups + layout.tsx |
| コンポーネント | `features/*/components/` + `components/` |
| データ取得 | `features/*/lib/` + `lib/api/` |
| 状態管理 | `features/*/store/` + `store/` |
