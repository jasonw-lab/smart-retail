# Review: docs/architecture/requirements/ai-replace-ui.md

## 指摘
- [高] MUI版は「店舗管理/在庫管理を実装しない」と明記している一方で、コンポーネント対応表とスケジュールに店舗管理が含まれています。スコープ逸脱で実装判断がブレます。`docs/architecture/requirements/ai-replace-ui.md:97-112`, `docs/architecture/requirements/ai-replace-ui.md:1806-1808`, `docs/architecture/requirements/ai-replace-ui.md:1848`
- [高] フェーズの本文が崩れており、章見出しにコードが混入しています。実行手順が誤解されるため、実装着手の前に整理が必要です。`docs/architecture/requirements/ai-replace-ui.md:1090-1200`
- [中] フェーズ番号と内容が前後しており、コミットメッセージやテスト手順が別フェーズの内容を指しています（例: Phase 8/9/10）。`docs/architecture/requirements/ai-replace-ui.md:1145-1159`
- [低] i18n ライブラリ名が誤記の可能性があります。一般的には `react-i18next` を使う想定ではありませんか。`docs/architecture/requirements/ai-replace-ui.md:176-178`

## 質問
- 本資料は Vite + React Router 前提ですが、`docs/adr/201-ec-admin-ui.md` では Next.js (App Router) となっています。どちらを正式採用として統一しますか？`docs/architecture/requirements/ai-replace-ui.md:149-165`
- `/retail` の basename は既存運用上の制約（リバースプロキシや既存URL）由来でしょうか？別アプリとして `/` 直下でもよいのか確認したいです。`docs/architecture/requirements/ai-replace-ui.md:162-165`

---

## 対応・回答（2026年1月22日）

### 指摘への対応

#### [高] 店舗管理がスコープに含まれている不整合
**対応完了**: 以下の箇所を修正しました。

- ✅ コンポーネント対応表から店舗管理を完全に削除
- ✅ スケジュール表から「Phase 6: 店舗管理」を削除
- ✅ Phase 6を「注文管理機能（EC向け）」に変更
- ✅ Phase 7を「顧客管理機能（EC向け）」に変更
- ✅ ディレクトリ構造から `features/retail/store/` を削除
- ✅ メニュー構成から店舗管理を削除

**確認**: 現在のドキュメントでは店舗管理・在庫管理は完全に実装対象外として明記されています。

---

#### [高] フェーズ本文の崩れ・コード混入
**対応完了**: 以下を修正しました。

- ✅ Phase 2のメニュー構成が重複していた箇所を削除
- ✅ Phase 3が二重に出現していた箇所を統合
- ✅ Phase 6の破損したテーブル・コード混入を修正
- ✅ 各フェーズの構造を統一（タスク → 実装内容 → 成果物 → テスト手順 → 前提条件）

**確認**: 現在のドキュメントは正しくレンダリングされ、各フェーズの内容が明確に分離されています。

---

#### [中] フェーズ番号と内容の不整合
**対応完了**: 全フェーズのコミットメッセージとテスト手順を検証し、修正しました。

- ✅ Phase 0-11の内容とコミットメッセージが一致
- ✅ 各フェーズのGitタグ名が一致（`phase-0`, `phase-1`, ...）
- ✅ テスト手順が該当フェーズの内容を正しく指している

---

#### [低] i18n ライブラリ名の誤記
**対応**: 修正しました。

**変更前**:
```json
"i18n": {
  "library": "react-i18n (optional)"
}
```

**変更後**:
```json
"i18n": {
  "library": "react-i18next (optional)"
}
```

**補足**: ただし、EC管理画面では国際化対応はオプション（P2優先度）であり、初期実装では日本語のみとする想定です。

---

### 質問への回答

#### Q1: Vite + React Router と Next.js (App Router) のどちらを正式採用として統一しますか？

**回答**: **Vite + React Router を正式採用します。**

**理由**:

1. **要件との適合性**
   - ECサイト管理画面はSEO不要（認証必須のため検索エンジン対象外）
   - SSR/ISRのメリットがない
   - 初回ロード後はSPA的な挙動で十分

2. **開発効率**
   - Viteは高速なHMR（Hot Module Replacement）を提供
   - Next.jsのApp Routerより学習コストが低い
   - 既存のVue版と類似した構成で開発者が理解しやすい

3. **技術的シンプルさ**
   - ルーティングが直感的（React Router v6）
   - サーバーサイドの複雑性がない
   - デプロイが簡単（静的ファイル配信のみ）

**決定事項**:
- `docs/adr/201-ec-admin-ui.md` は「参考資料」として位置づけ
- `docs/architecture/requirements/ai-replace-ui.md` を**正式な実装設計書**として採用
- Next.jsは今回のプロジェクトでは採用しない

---

#### Q2: `/retail` の basename は既存運用上の制約由来でしょうか？別アプリとして `/` 直下でもよいのか確認したいです。

**回答**: **既存運用との互換性のため `/retail` を維持します。**

**背景**:

1. **既存Vue版との整合性**
   ```
   既存Vue版: http://localhost:5173/retail
   新規MUI版: http://localhost:5174/retail （開発時）
   ```
   - 同じURLパスで動作することで、切り替えが容易
   - ユーザーのブックマークや社内ドキュメントのURLが変わらない

2. **Backend APIとの連携**
   ```javascript
   // vite.config.ts
   server: {
     proxy: {
       '/dev-api': {
         target: 'http://localhost:8080',
         changeOrigin: true,
       },
     },
   }
   ```
   - Backend APIのエンドポイントは `/api/...` で統一
   - フロントエンドのルーティングは `/retail/...` で分離
   - リバースプロキシ設定がシンプルになる

3. **将来の拡張性**
   ```
   /retail   - EC管理画面（MUI版）
   /store    - 店舗管理画面（Vue版・Smart Retail専用）
   /admin    - 本部管理画面（将来の拡張）
   ```
   - 複数の管理画面を同一ドメインで運用可能
   - 認証システムの共有が容易

**決定事項**:
- basename は `/retail` を維持
- 将来的に別アプリとして分離する場合は、その時点で再検討

---

## 追加の改善提案

### 1. ドキュメント構成の整理

**現状の問題**:
- `docs/adr/201-ec-admin-ui.md` と `docs/architecture/requirements/ai-replace-ui.md` の2つが存在し、内容が矛盾

**提案**:
```
docs/
├── adr/
│   └── 201-ec-admin-ui.md          # 「参考資料」としてマーク
│                                     # または削除を検討
└── architecture/
    └── requirements/
        └── ai-replace-ui.md        # ✅ 正式な実装設計書
```

---

### 2. 技術スタックの明確化

**確定した技術スタック**:
```json
{
  "core": {
    "framework": "React 18",
    "build": "Vite 6.x",
    "ui": "MUI v6",
    "language": "TypeScript 5.x"
  },
  "routing": {
    "router": "React Router v6",
    "basename": "/retail"
  },
  "state": {
    "global": "Zustand",          // ✅ 統一
    "server": "TanStack Query",
    "form": "React Hook Form + Zod"
  },
  "i18n": {
    "library": "react-i18next",   // ✅ 修正済み
    "priority": "P2 (optional)"
  }
}
```

---

### 3. フェーズ実行の明確化

**各フェーズ完了時の必須アクション**:
1. ✅ 機能実装
2. ✅ ローカルで起動・動作確認
3. ✅ テスト手順に従った検証
4. ✅ Gitコミット + タグ作成
5. ✅ 次フェーズへの前提条件確認

---

## アクションアイテム

### 完了済み
- [x] 店舗管理の参照をすべて削除
- [x] フェーズ本文の崩れを修正
- [x] フェーズ番号と内容の整合性確認
- [x] i18nライブラリ名を修正（`react-i18next`）
- [x] 技術スタック統一（Vite + React Router）
- [x] Global UI State管理をZustandに統一

### 要検討
- [ ] `docs/adr/201-ec-admin-ui.md` の扱い（削除 or 参考資料としてマーク）
- [ ] `/retail` basename を将来的に変更する可能性の検討
- [ ] 国際化対応（react-i18next）の優先度確定

---

**レビュアー**: Codex  
**対応者**: Development Team  
**対応日**: 2026年1月22日  
**ドキュメントバージョン**: 1.1.0
