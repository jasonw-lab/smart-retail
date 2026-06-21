# SmartRetail Pro - Frontend (Next.js)

> 本ファイルの共通ルールは [`../../rule.md`](../../rule.md) に集約しています。併せて参照してください。

## プロジェクト概要

SmartRetail向けNext.js 15 App Routerベースのフロントエンド。
小売店舗向けDXソリューションのUI/UX層を担当。

## 関連リソース

### 設計ドキュメント (正本)

```
/Users/wangjw/Dev/Git/ross-dev2024/vps/smart-retail-dx/docs/
├── architecture/
│   └── frontend-next.md       # FEアーキテクチャ設計
├── design/
│   ├── db/                    # DBスキーマ
│   └── ui/                    # UI仕様
└── plan-retail-multi-tenant.md
```

### バックエンド

```
/Users/wangjw/Dev/Git/ross-dev2024/vps/smart-dx-backend/
├── services/retail-be/        # Retail API (Spring Boot)
├── libs/smart-be-tenant/      # マルチテナント共通
└── CLAUDE.md                  # BE開発ルール
```

## 技術スタック

| カテゴリ         | 技術                    |
| ---------------- | ----------------------- |
| フレームワーク   | Next.js 15 (App Router) |
| UI               | shadcn/ui + Radix UI    |
| スタイル         | Tailwind CSS v4         |
| サーバー状態     | TanStack Query v5       |
| クライアント状態 | Zustand v5              |
| フォーム         | React Hook Form + Zod   |
| 国際化           | next-intl               |
| WebSocket        | @stomp/stompjs          |
| テスト           | Playwright (E2E) + MSW  |

## ディレクトリ構成

```
.
├── app/
│   ├── [locale]/              # 国際化ルート
│   │   ├── (auth)/            # 認証不要 (login)
│   │   └── (dashboard)/       # 認証必須
│   └── api/                   # Route Handlers
│       ├── auth/              # 認証API
│       └── proxy/[...path]/   # Backend Proxy
├── features/                  # 機能モジュール
│   ├── auth/
│   ├── products/
│   ├── stores/
│   ├── devices/
│   ├── transactions/
│   ├── inventory/
│   ├── alerts/
│   └── system/                # システム管理
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── layout/
│   └── providers/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Client Component用
│   │   └── server.ts          # Server Component用
│   └── utils.ts
├── store/                     # Zustand
├── messages/                  # i18n (ja.json, en.json)
└── _docs/adr/                 # Architecture Decision Records
```

## 開発コマンド

```bash
# 開発サーバー起動 (port 3001)
npm run dev

# ビルド
npm run build

# E2Eテスト
npm run mock:server          # モックサーバー起動
npm run test:e2e             # Playwright実行
npm run test:e2e:ui          # Playwright UI モード
```

## 環境変数

```env
BACKEND_URL=http://localhost:8080/api/v1
```

## Server/Client 境界

| 場所          | 種別   | データ取得                         |
| ------------- | ------ | ---------------------------------- |
| page.tsx      | Server | Backend直接fetch                   |
| *Table, *Form | Client | TanStack Query (Route Handler経由) |
| AlertList     | Client | STOMP WebSocket                    |

## 認証フロー

1. ログイン: `POST /api/auth/login` → Cookie (httpOnly) にトークン保存
2. Server Component: `cookies().get('access_token')` → Backend直接fetch
3. Client Component: `/api/proxy/*` → Route Handler経由 (自動リフレッシュ)
4. WebSocket: 短TTLチケット方式 (XSS対策)

## ADR一覧

- ADR-001: App Router採用とディレクトリ方針
- ADR-002: JWT認証 (ハイブリッドアプローチ)
- ADR-003: Server/Client境界
- ADR-004: UIライブラリ (shadcn/ui)
- ADR-005: STOMPリアルタイム
- ADR-006: Appフォルダ構成
- ADR-007: 状態管理 (Zustand)
- ADR-008: E2Eテスト (Playwright + MSW)

## 無視するフォルダ

`ign_*` にマッチするフォルダはエージェント操作の対象外です。明示的な指示がない限り、内部のファイルを読み取り・変更・参照しないでください。

## レビュールール

### レビュー実施時

- ファイル: `review/review_MMDD_対象名.{reviewer}.md`
- 指摘フォーマット: `### 指摘N. タイトル` + 重大度 (High/Medium/Low)

### 指摘対応時

- 元ファイルに対応ブロックを追記 (新規ファイル不可)
- ステータス: ✅ 対応完了 / ⚠️ 要対応 / ❌ 対応不要
