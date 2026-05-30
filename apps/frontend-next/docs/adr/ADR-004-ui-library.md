# ADR-004: UIライブラリ選定（shadcn/ui + Radix UI + Tailwind CSS）

## ステータス
承認済み (2025-05)

## 背景
既存のVue3版フロントエンドはElement Plusを採用している。Next.js版では、App Router（React Server Components）との相性を重視してUIライブラリを選定する必要がある。

業務システム（管理画面）として以下の要件がある:
- テーブル、フォーム、モーダル、ドロワー等のコンポーネント
- 国際化（i18n）対応
- アクセシビリティ対応
- Vue版（Element Plus）との視覚的な一貫性は必須ではない

## 検討した選択肢

### 選択肢1: shadcn/ui + Radix UI + Tailwind CSS（採用）
- Radix UIプリミティブベースのコピー&ペースト型コンポーネント
- Tailwind CSSによるユーティリティファーストスタイリング
- コード所有型（ライブラリ依存ではなくソースコードを所有）

### 選択肢2: Ant Design
- Alibaba製、業務システム向けコンポーネントが充実
- Element Plusと同じ設計思想（Alibaba系）

### 選択肢3: MUI (Material-UI)
- Google Material Designベース
- React UIライブラリとして最も普及

### 選択肢4: Mantine
- モダンなReact UIライブラリ
- フル機能のコンポーネントセット

## 決定
**shadcn/ui + Radix UI + Tailwind CSSを採用する。**

### 採用理由

1. **App Router / RSCとの相性**
   - Radix UIプリミティブはRSC対応プロジェクトで境界制御しやすい設計
   - `"use client"`の配置を開発者が完全制御可能
   - Button, Badge, Card等の表示系コンポーネントはServer Componentで利用可能

2. **コード所有型アーキテクチャ**
   - コンポーネントをプロジェクトにコピーして所有
   - ライブラリのバージョンアップに依存しない
   - 必要に応じて自由にカスタマイズ可能
   - 依存地獄を回避

3. **Tailwind CSSによる一貫したスタイリング**
   - ユーティリティファーストで高速な開発
   - CSS変数によるテーマ管理
   - 未使用クラス除去による最小バンドルサイズ

4. **アクセシビリティの担保**
   - Radix UIはWAI-ARIA準拠
   - キーボードナビゲーション、スクリーンリーダー対応が標準

5. **技術トレンド**
   - Vercel/Next.js公式テンプレートで採用
   - React/Next.jsエコシステムの主流
   - コミュニティの活発な開発

### コンポーネント分類（Server/Client）

| コンポーネント | Server Component | Client Component | 備考 |
|---------------|-----------------|------------------|------|
| Button | ○ | ○ | インタラクションなしならServer可 |
| Badge, Card | ○ | ○ | 表示のみならServer可 |
| Table (静的) | ○ | - | データ表示のみ |
| Dialog, Sheet | - | ○ | 開閉状態管理が必要 |
| Select, Dropdown | - | ○ | インタラクション必須 |
| Form, Input | - | ○ | 入力状態管理が必要 |
| Tabs | - | ○ | 選択状態管理が必要 |
| Toast, Sonner | - | ○ | トリガーが必要 |

### ディレクトリ構成

```
components/
├── ui/                    # shadcn/ui コンポーネント
│   ├── button.tsx         # Server/Client両方で利用可
│   ├── card.tsx           # Server/Client両方で利用可
│   ├── badge.tsx          # Server/Client両方で利用可
│   ├── table.tsx          # Server/Client両方で利用可
│   ├── dialog.tsx         # Client専用（"use client"）
│   ├── select.tsx         # Client専用
│   ├── form.tsx           # Client専用
│   ├── input.tsx          # Client専用
│   ├── sheet.tsx          # Client専用
│   └── ...
└── custom/                # プロジェクト固有コンポーネント
    ├── data-table.tsx     # TanStack Table wrapper（Client）
    └── ...
```

### shadcn/ui 初期設定

```json
// components.json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 業務コンポーネントの補完

shadcn/uiには高機能なデータテーブル等が標準では含まれないため、以下で補完:

| 機能 | 実装方法 |
|------|----------|
| データテーブル | TanStack Table + shadcn/ui Table |
| フォームバリデーション | React Hook Form + Zod + shadcn/ui Form |
| チャート | Recharts |
| 日付ピッカー | shadcn/ui DatePicker (react-day-picker) |
| リッチテキスト | 必要に応じてTiptap等 |

## 却下した選択肢の理由

### Ant Designを却下した理由
- **RSC制約**: Server Componentからドットコンポーネント（`Select.Option`、`Form.Item`）アクセスでエラー
- **`"use client"`の強制**: 多くのコンポーネントがClient Component必須
- **スタイリング複雑性**: `@ant-design/cssinjs`とApp Routerの統合に追加設定が必要
- **バンドルサイズ**: Tree-shakingしても比較的大きい

### MUI (Material-UI)を却下した理由
- **RSC対応の制約**: Emotionベースのスタイリングがサーバーコンポーネントと相性が悪い
- **バンドルサイズ**: 大きい
- **カスタマイズコスト**: Material Designから離れたデザインにするコストが高い

### Mantineを却下した理由
- **RSC対応が発展途上**: App Router対応は進行中だが完全ではない
- **エコシステム規模**: shadcn/uiと比較してコミュニティが小さい

## トレードオフ

### 受け入れるリスク
- 業務システム向けの複雑なコンポーネント（高機能テーブル等）は自前構築が必要
- shadcn/uiのコンポーネント数はAnt Design/MUIより少ない
- Tailwind CSS習熟が必要

### 軽減策
- TanStack Table + shadcn/ui Tableで高機能テーブルを構築
- React Hook Form + Zod + shadcn/ui Formで型安全なフォーム
- 必要に応じてRadix UIプリミティブから自作
- Tailwind CSS設定でデザインシステムを統一

## 技術スタック

| ライブラリ | 役割 | バージョン |
|-----------|------|-----------|
| shadcn/ui | UIコンポーネント | 最新（Tailwind v4対応） |
| Tailwind CSS | スタイリング | v4 |
| Radix UI | プリミティブ | 最新 |
| TanStack Table | テーブル | 8.x |
| React Hook Form | フォーム | 7.x |
| Zod | バリデーション | 3.x |
| Recharts | チャート | 2.x |
| Lucide React | アイコン | 最新 |
| next-themes | テーマ切り替え | 最新 |

### Tailwind CSS v4 設定

Tailwind v4ではCSSベースの設定が主流となる。

```bash
# インストール
pnpm add tailwindcss @tailwindcss/postcss
```

```css
/* app/globals.css */
@import 'tailwindcss';

/* shadcn/ui用のテーマ変数 */
@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0.115 254.624);
  --color-primary-foreground: oklch(0.985 0 0);
  /* ... その他のCSS変数 */
}
```

```json
// components.json (shadcn/ui v4対応)
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "",  // v4ではconfigファイル不要
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**注意**: Tailwind v4では `tailwind.config.ts` は基本的に不要。テーマカスタマイズはCSS `@theme` ディレクティブで行う。

参照: [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)

## Vue版（Element Plus）との比較

| 観点 | Element Plus (Vue) | shadcn/ui (React) |
|------|-------------------|-------------------|
| コンポーネント数 | ◎ 豊富 | ○ 必要十分 |
| RSC対応 | - (Vue) | ◎ |
| カスタマイズ性 | ○ | ◎ |
| バンドルサイズ | △ | ◎ |
| 学習コスト | ○ | ○ |
| デザイン統一 | 自動 | Tailwind設定で制御 |

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| スタイリング | Tailwind CSS（ユーティリティクラス） |
| テーマ | CSS変数 (`@theme`ディレクティブ、v4ではconfig不要) |
| コンポーネント配置 | components/ui/ |
| フォーム | React Hook Form + Zod + shadcn/ui Form |
| テーブル | TanStack Table + shadcn/ui Table |
| アイコン | Lucide React |
