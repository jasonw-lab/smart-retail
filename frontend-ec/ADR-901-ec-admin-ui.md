# EC管理画面 フロントエンド設計構成案 (2026年版)　

本資料は参考資料です。正式な実装設計は `docs/architecture/requirements/ai-replace-ui.md` を参照してください。

MUI（Material UI）をベースとし、拡張性・保守性、および開発現場での評価を最大化するためのアーキテクチャ設計です。

---

## 1. 技術スタック概要

| レイヤー | 選定技術 | 役割・選定理由 |
| :--- | :--- | :--- |
| **Core Framework** | **React 18 + Vite** | SPAとしての高速な開発体験とビルド。管理画面に必要十分な構成。 |
| **Routing** | **React Router v6** | 明確なルーティング定義と柔軟なレイアウト制御。 |
| **UI Library** | **MUI (Material UI) v6+** | 業界標準のコンポーネントライブラリ。開発スピードと一貫性を確保。 |
| **State Management** | **TanStack Query (v5+)** | **Server State管理。** キャッシュ、自動再取得、通信状態の管理を担う。 |
| **Form Management** | **React Hook Form + Zod** | 複雑なバリデーションを型安全に実装。MUIとの親和性も高い。 |
| **Global State** | **Zustand (最小限)** | ログイン情報やテーマ設定など、アプリ全体で共有するUI状態のみ。 |
| **Data Grid** | **MUI X (Data Grid)** | 大量データのソート、フィルタ、編集を効率化するEC必須コンポーネント。 |

---

## 2. 状態管理の戦略（責務分離の原則）

「どこに何の状態があるか」を明確に分離することで、コードの肥大化と不整合を防ぎます。

### 2.1 Server State (サーバーの状態)
* **対象:** 注文一覧、商品詳細、在庫データ、売上分析データ
* **管理:** `TanStack Query (useQuery, useMutation)`
* **メリット:**
    * Reduxでの手動更新が不要。
    * ウィンドウフォーカス時の自動更新など、ECに不可欠な「最新性」を担保。

### 2.2 Form State (入力中の状態)
* **対象:** 商品登録・編集、設定変更
* **管理:** `React Hook Form`
* **ポイント:**
    * MUIコンポーネントとは `Controller` を介して連携。
    * バリデーション（桁数、型、必須チェック）は `Zod` で一元管理。

### 2.3 Local UI State (画面固有の状態)
* **対象:** モーダルの開閉、タブの切り替え、検索条件の一時保持
* **管理:** `useState`, `useReducer`
* **ポイント:** 原則として、その画面（コンポーネント）の中に閉じ込める。

### 2.4 Global UI State (アプリ全体の状態)
* **対象:** ログインユーザー、通知（スナックバー）、サイドバーの開閉状態
* **管理:** `Zustand`
* **理由:** 実装の一貫性を保ち、Reduxよりもボイラープレートが少ないため。

---

## 3. UIアーキテクチャ設計

### ディレクトリ構造案

```text
src/
├── app/              # App初期化 (router, theme, providers)
├── components/       
│   ├── ui/           # MUIをラップした共通部品 (Button, TextField等)
│   └── shared/       # アプリ全体で使う部品 (Header, Sidebar)
├── features/         # 機能単位のモジュール (ECの核)
│   ├── products/     # 商品管理機能
│   │   ├── api/      # hooks (useQuery, useMutation)
│   │   ├── components/
│   │   └── types/
│   └── orders/       # 注文管理機能
├── hooks/            # 汎用カスタムフック
├── lib/              # ライブラリ設定 (axios, mui-theme, zod)
└── store/            # Global State (Zustand)
```
