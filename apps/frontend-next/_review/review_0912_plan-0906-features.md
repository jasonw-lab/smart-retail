# レビュー報告書: 機能単位実装計画 2026-09-06（demo2 反映版）

- **レビュー対象**: [`apps/frontend-next/_docs/plan/plan_0906_features.md`](../_docs/plan/plan_0906_features.md)
- **レビュー実施日**: 2026-09-12
- **レビュアー**: Antigravity
- **ブランチ**: `feature/front-next-base`
- **目的**: 実装着手前の Plan に対する問題点・不足・リスクの洗い出し

---

## 1. 総合評価サマリー

本計画（`plan_0906_features.md`）は、姉妹リポジトリの計画（U0〜U15）をベースに現行コードとの差分を反映した堅実な構成となっています。
しかし、**Git管理・ブランチ前提の齟齬（着手ブロッカー）**、**Zod多言語化設計の欠陥による手戻りリスク**、**ESLint Flat Config のスコープ未定義による全体ビルド破壊リスク** など、実装前に解消すべき課題が複数確認されました。

### 指摘一覧

| # | 対象 | 区分 | 重大度 | 指摘内容 |
|---|---|---|---|---|
| 1 | 全体 / U0 | Git運用 | **Critical** | ルートの `.gitignore` により本 Plan 自体が Git 管理外（ignored）になっている |
| 2 | 全体 | 前提 | **High** | Plan 記載のブランチ名（`feat/retail-api-integration`）が存在せず、実ブランチは `feature/front-next-base` |
| 3 | U0 | 前提 | **High** | U0 の前提（未コミット差分が `.gitignore` のみ、旧plan 4件削除）が既に直前コミットで解消済みで合致しない |
| 4 | U5〜U13 | 設計 | **High** | Zodメッセージ多言語化の「方式 (a) 推奨」は全フォームの JSX 修正を強制し、動的パラメータ扱いも困難 |
| 5 | U5〜U13 | 品質 | **High** | 既存 E2E テストが日本語/英語の文言ハードコード照合を行っており、i18n 化で大量破損するリスク |
| 6 | U14 | 設計 | **High** | ESLint Flat Config で `files` によるスコープ限定をしない場合、`app/` からの import も巻き込まれビルド破壊 |
| 7 | U12 | 不整合 | **Medium** | U12 の規模が進捗表で「0/6（6機能）」と定義されているが、実際は config/notice 含む 8機能 |
| 8 | U4 | 誤認 | **Medium** | `products.spec.ts` の VRT が `welcome-message.tsx` の時刻依存によると記述されているが、商品一覧には同部品は存在しない |
| 9 | 手動確認 | 不足 | **Medium** | 手動確認手順（`pnpm dev`）に必須環境変数 `BACKEND_URL` の記述がなく、そのままでは起動時クラッシュする |
| 10 | U5〜U13 | テスト不足 | **Low** | 英語ロケール（`/en`）の自動回帰テスト（E2E）が計画に含まれておらず、表示崩れの自動検知ができない |
| 11 | U14 | 未確定 | **Low** | 横断フック（`useStoreOptions`）を stores 公開 API に残すか共通層に移すかの判断基準・手順が未確定 |

---

## 2. 重大な問題点（ブロッカー・高リスク）

### 指摘 1: ルートの `.gitignore` による Plan ファイル除外（Critical）
- **対象**: リポジトリルート [`.gitignore:83, 91`](../../../.gitignore)
- **現状**: ルートの `.gitignore` に `plan*.md` および `p*.md` のパターンが登録されています。このため、`apps/frontend-next/_docs/plan/plan_0906_features.md` が Git の追跡から除外（ignored）されており、通常の `git status` や `git add` で検知・コミットできません。
- **影響**: U0 や Plan の進捗更新をコミットしようとしても拒否されます。
- **推奨対応**: ルートの `.gitignore` に例外ルール（例: `!apps/frontend-next/_docs/plan/*.md`）を追加するか、ignore パターンを適正化してください。

### 指摘 2: 対象ブランチ名の相違（High）
- **対象**: `plan_0906_features.md`（3行目、386行目）
- **現状**: 「対象ブランチ: `feat/retail-api-integration`」と記載されていますが、現在のブランチは `feature/front-next-base` であり、該当ブランチはリポジトリに存在しません（移植元姉妹リポジトリの記述残存）。
- **影響**: コミット対象や作業ブランチの誤認が発生します。
- **推奨対応**: Plan 冒頭および共通ルールのブランチ名を `feature/front-next-base` に更新してください。

### 指摘 3: U0（作業ツリー確定と plan 入れ替え）の前提崩壊（High）
- **対象**: `plan_0906_features.md`（U0 セクション）
- **現状**: 「未コミット差分は `.gitignore` の1件のみ」「旧 plan 4件の削除と本ファイルの追加を2コミットで実施」と記載されています。しかし、直前のコミット `c698d5e` で旧 plan 4件はすでに削除済みであり、`apps/frontend-next/.gitignore` もコミット済みです。
- **影響**: Plan に記載された U0 のコミット内容が空（または前提と不一致）になり、そのままの手順では着手できません。
- **推奨対応**: U0 のタスク内容を「ルート `.gitignore` の修正と本 Plan ファイル（および本レビュー報告書）の Git 管理登録」へと再定義してください。

---

## 3. 設計・品質上のリスク

### 指摘 4: Zod バリデーションメッセージの多言語化方針（High）
- **対象**: `plan_0906_features.md`（287〜289行目）
- **現状**: 方式 (a: キー名を返して component 側で `t()`) を推奨としています。
- **リスク**:
  1. 現行のフォーム実装（[`product-form.tsx:86-88`](../features/products/components/product-form.tsx#L86-L88)、[`profile/page.tsx:123-127`](../app/%5Blocale%5D/%28dashboard%29/profile/page.tsx#L123-L127) など）では、`{errors.fieldName?.message}` を直接 `<p>` タグでレンダリングしています。
  2. 方式 (a) を採用すると、**全機能・全フォームコンポーネントの JSX をすべて書き換えて `t(errors.fieldName.message)` を挟む必要**が生じ、作業スコープが大幅に膨らみます。
  3. さらに、`max(100, '100文字以内で入力してください')` のように動的引数を伴うメッセージをキー名単体でどう補間するのかの設計が欠落しています。
- **推奨対応**:
  - スキーマ生成関数 `createProductSchema(t)` を渡す方式 (b)（または Zod のカスタム errorMap 方式）を再検討してください。方式 (b) であれば、コンポーネント側の JSX を一切変更せず、引数付き翻訳（`t('validation.max', { max: 100 })`）も自然に実現できます。

### 指摘 5: 既存 E2E テストの文言ハードコード照合による大量破損リスク（High）
- **対象**: `e2e/specs/stores.spec.ts`, `inventory.spec.ts`, `devices.spec.ts`, `system.spec.ts` 等
- **現状**: E2E spec では以下のように Toast メッセージやボタン名が日本語/英語でハードコード照合されています。
  - `getByText('店舗を登録しました')`
  - `getByText('廃棄を記録しました')`
  - `getByText('デバイスを登録しました')`
  - `getByRole('button', { name: 'キャンセル' })` / `Search` / `Reset`
- **リスク**: Plan では `system.spec.ts` の `字典` の誤字のみに言及していますが、他機能の i18n 化で文言が1文字でも変更・修正されると、多数の E2E spec が連鎖して失敗します。
- **推奨対応**: 各ユニットの受入条件・作業手順において、「既存 spec が照合している表示文言の完全一致確認」または「spec 側の文言修正」をチェックリストに明記してください。

### 指摘 6: U14（ESLint import 境界ルール）の Flat Config スコープ未定義（High）
- **対象**: [`eslint.config.mjs`](../eslint.config.mjs)、`plan_0906_features.md`（329行目）
- **現状**: `no-restricted-imports` に「他 feature の深い階層への import を禁止する」とあります。
- **リスク**: ESLint Flat Config において `files: ['features/**/*.{ts,tsx}']` などで適用対象を限定しない場合、ルートレベルのルールとして `app/`（各ページコンポーネント）や `components/layout/` から各 feature への import まで一律制限され、プロジェクト全体のビルドおよび Lint が大量にエラーとなります。
- **推奨対応**:
  - `files: ['features/**/*.{ts,tsx}']` に限定したルールブロックとして追加することを Plan に明記してください。
  - `app/` や `components/` からの import は制限対象外（垂直方向のアクセスは許可）であることを明示してください。

---

## 4. 記載内容の不整合・不足

### 指摘 7: U12（system i18n）の機能数母数の不整合（Medium）
- **対象**: `plan_0906_features.md`（111行目、136行目、152行目、304行目）
- **現状**: 作業状況表および進捗定義で「0/6（6機能）」とされていますが、304行目では `user/role/menu/dept/dict/log/config/notice` と **8機能** 列挙されています。
- **原因**: 姉妹リポジトリ（config / notice が存在しなかった）の「6機能」という記述がそのまま残っています。
- **推奨対応**: 進捗母数を「0/8」に修正し、サブタスクの定義を適正化してください。

### 指摘 8: U4 における VRT 原因の誤認（Medium）
- **対象**: `plan_0906_features.md`（252行目）
- **現状**: 「`welcome-message.tsx:14` の `getGreeting()` が実行時刻で挨拶文を切り替える。VRT は `dashboard.spec.ts:17` と `products.spec.ts:25` の2件」とあります。
- **実態**: [`welcome-message.tsx`](../features/dashboard/components/welcome-message.tsx) はダッシュボードでのみ使用されており、商品一覧（[`products/page.tsx`](../app/%5Blocale%5D/%28dashboard%29/products/page.tsx)）には含まれていません。`products.spec.ts` の VRT が時刻依存で揺れることはありません。
- **推奨対応**: `welcome-message.tsx` の影響範囲は `dashboard.spec.ts` のみであることを正しく記載し、`products.spec.ts` については別の非決定性要因（データのソート順やレンダリング待機など）があればそちらを点検するよう記述を修正してください。

### 指摘 9: 手動確認手順における必須環境変数 `BACKEND_URL` の欠落（Medium）
- **対象**: `plan_0906_features.md`（455〜456行目）
- **現状**: `pnpm mock:server` + `pnpm dev` で手動確認するよう案内されています。
- **実態**: `apps/frontend-next` には `.env` / `.env.local` が存在せず、[`lib/env/server.ts:5`](../lib/env/server.ts#L5) では `BACKEND_URL: z.string().url()` が必須です。単に `pnpm dev` を実行すると環境変数バリデーションエラーで起動時クラッシュします。
- **推奨対応**: `cp .env.example .env.local` を行うか、`BACKEND_URL=http://localhost:8091/api/v1 pnpm dev` で起動する手順を明記してください。

### 指摘 10: 英語ロケール（`/en`）に対する E2E 自動回帰テストの欠落（Low）
- **現状**: Plan の受入条件（319行目）は「`/en/...` で画面を開いて英語表示になることを目視確認する」のみです。
- **推奨対応**: 目視確認だけでなく、CI で回帰検知できるよう、主要画面の `/en` ルートに対する表示確認テストケース（またはスナップショット）の追加を検討してください。

### 指摘 11: 横断フック（`useStoreOptions`）の移行方針の未確定（Low）
- **現状**: `useStoreOptions` が 3つの feature から参照されています。Plan では「stores の公開 API にするか共通層へ移すかを判断する」とだけ書かれています。
- **推奨対応**: U14 着手前に「stores の公開 API（`features/stores/index.ts`）から re-export する」か「`lib/hooks/` に抽出する」かの基準をあらかじめ確定させておくとスムーズです。

---

## 5. 実装着手前の推奨対応手順（Action Items）

1. **Plan 本体の改訂**:
   - ブランチ名を `feature/front-next-base` に更新
   - U0 の内容を「ルート `.gitignore` の是正＋Plan の Git 追跡開始」に更新
   - U5 の Zod 多言語化方針を「方式 (b)（スキーマ生成関数方式）」に見直し
   - U12 の進捗母数を「0/8」に修正
   - U14 の ESLint 設定記述に `files: ['features/**/*.{ts,tsx}']` スコープを明記
2. **ルート `.gitignore` の修正**:
   - `apps/frontend-next/_docs/plan/*.md` および `apps/frontend-next/_review/*.md` を ignore 除外に追加
3. **Plan HTML の再同期**:
   - `python3 _scripts/build_plan_html.py --sync` を実行

---

## 2026/09/12 claude 対応完了

レビュー指摘1〜11をすべて確認し、対応した。対象は `_docs/plan/plan_0906_features.md`（正本）、`_docs/plan/plan_0906_features.html`（表示用）、およびリポジトリルートと `apps/frontend-next/` の `.gitignore`。

### 対応状況サマリー

| #   | 指摘内容                                        | 重大度       | 対応状況    |
| --- | ----------------------------------------------- | ------------ | ----------- |
| 1   | ルート `.gitignore` により Plan が Git 管理外   | **Critical** | ✅ 対応完了 |
| 2   | ブランチ名の相違                                | High         | ✅ 対応完了 |
| 3   | U0 の前提崩壊                                   | High         | ✅ 対応完了 |
| 4   | Zod 多言語化の方式 (a) 推奨                     | High         | ✅ 対応完了 |
| 5   | 既存 E2E の文言ハードコード照合                 | High         | ✅ 対応完了 |
| 6   | ESLint Flat Config のスコープ未定義             | High         | ✅ 対応完了 |
| 7   | U12 の機能数母数の不整合                        | Medium       | ✅ 対応完了 |
| 8   | U4 における VRT 原因の誤認                      | Medium       | ✅ 対応完了 |
| 9   | 手動確認手順の `BACKEND_URL` 欠落               | Medium       | ✅ 対応完了 |
| 10  | 英語ロケール（`/en`）の E2E 欠落                | Low          | ✅ 対応完了 |
| 11  | `useStoreOptions` の移行方針の未確定            | Low          | ✅ 対応完了 |

### 各指摘の対応詳細

#### 1. ルート `.gitignore` による Plan ファイル除外 ✅

- 変更内容: ルート `.gitignore` 末尾に `!apps/frontend-next/_docs/plan/*.md` と `!apps/frontend-next/_review/*.md` を追加。あわせて `apps/frontend-next/.gitignore` の `_review/*` 許可リストに本レビュー報告書を追加
- 変更ファイル: `.gitignore:96-98`、`apps/frontend-next/.gitignore:62`
- 判断理由: `git check-ignore -v` の実測では、plan md を ignore していたのはルートの `p*.md`（`:91`）、本レビュー報告書を ignore していたのは `apps/frontend-next/.gitignore:58` の `_review/*` だった。**ネストした `.gitignore` の規則は親より優先される**ため、レビュー報告書側は指摘の推奨（ルートへの例外追加）だけでは解決せず、両方に手を入れている
- 確認: `git status --short` に両ファイルが `??` として現れ、`git add` 可能な状態になった
- 補足: ルートの `p*.md` パターン自体は `package.md` 等も巻き込む広すぎる指定だが、リポジトリ全体に影響するためパターンの適正化は「追加で見つかった課題」に別タスクとして記載した

#### 2. 対象ブランチ名の相違 ✅

- 変更内容: `feat/retail-api-integration` → `feature/front-next-base`（md 3箇所、HTML 4箇所）
- 変更ファイル: `plan_0906_features.md:3,15,406`、`plan_0906_features.html:9,836,883,1348`

#### 3. U0 の前提崩壊 ✅

- 変更内容: U0 を「作業ツリーの確定と plan 入れ替え」から**「plan / レビュー文書の Git 追跡開始」**へ再定義。「前提の訂正」表を新設し、当初の想定と実態の差分を明記した
- 変更ファイル: `plan_0906_features.md`（U0 セクション全体、ユニット一覧、背景表）
- 判断理由: 指摘のとおり前提が崩れていたが、実測の結果**指摘の記述とも一部異なっていた**。旧 plan 4件は「`c698d5e` で削除済み」ではなく、`git log --all` で0件＝**一度も Git に追跡されていなかった**（ルートの ignore パターンで最初から除外されていた）。よって削除コミットは元から不要。この実態を表に反映している
- コミット構成も実態に合わせて更新（コミット1 = `.gitignore` 是正、コミット2 = plan md とレビュー報告書の追加）

#### 4. Zod バリデーションメッセージの多言語化方針 ✅

- 変更内容: 推奨を **方式 (a) → 方式 (b)（スキーマ生成関数 `createProductFormSchema(t)`）** に変更。実装形のコード例（スキーマ側・component 側）と `useMemo` 必須の注意を追記
- 変更ファイル: `plan_0906_features.md`（共通手順 手順5）、`plan_0906_features.html`
- 判断理由（実測値を根拠として明記）:
  - Zod スキーマは13ファイル（`features/{products,stores,devices,inventory}/schemas/`、`features/system/schemas/` 8件、`login-form.tsx` 内1件）
  - `{errors.<field>.message}` を直接描画する箇所が **44箇所**。方式 (a) はこの全箇所の JSX 書き換えを強制する
  - `max(100, '100文字以内で入力してください')` のような引数付きメッセージがあり、(a) では補間できない
  - (b) の欠点（`t` 依存でユニットテストしづらい）は、本リポジトリに `*.test.ts` が1件も無く（テストは Playwright E2E のみ）、スキーマの他 component 再利用も現状ゼロのため実害が無い
- あわせて `validation` namespace の共通キー（`required` / `maxLength` 等）を U5 で確定させる旨を追記した

#### 5. 既存 E2E の文言ハードコード照合 ✅

- 変更内容: 共通手順6に、着手時の洗い出し `grep` コマンドと2つの表を追加
  - 「照合文言の分類」表: **mock データ由来**（`テスト商品1` `東京本店` 等＝i18n の影響なし）と **UI 文言由来**（`店舗を登録しました` 等＝1文字変えれば落ちる）を分けて判断する基準
  - 「実測済みの UI 文言照合（2026-09-12）」表: ユニット別に spec のファイル:行と照合文言を列挙した着手前チェックリスト
- 変更ファイル: `plan_0906_features.md`（共通手順6 + 新設2表）、`plan_0906_features.html`
- 判断理由: 指摘のとおり全機能に波及するリスクがあった。ただし実測すると `getByText('テスト商品1')` のような **mock データ由来の照合は i18n 化の影響を受けない**ため、一律に「完全一致確認」を課すと不要な作業が増える。影響を受けるものだけを列挙する形にした
- 補足: `products.spec.ts:79-81` のバリデーションエラー確認は `.text-destructive` のクラス照合で文言に依存しないため、指摘4の Zod i18n 化では壊れない旨も明記した

#### 6. U14 の ESLint Flat Config スコープ未定義 ✅

- 変更内容: `files: ['features/**/*.{ts,tsx}']` に限定した**独立ルールブロック**として追加する旨を明記し、設定例を追記。`app/` `components/` からの import（縦方向）は制限対象外であることも明示
- 変更ファイル: `plan_0906_features.md`（U14 実装内容）、`plan_0906_features.html`
- 判断理由: 現行 `eslint.config.mjs:14-46` の `no-restricted-imports` は `files` の無いルートレベル設定で全ファイルに適用されており、指摘のとおりビルド破壊リスクがあった
- 追加で判明した論点を明記: **Flat Config では同じルール名を後段ブロックが再指定すると上書きになる**。`files: ['features/**']` ブロックを足すと `features/` 配下では既存の `paths` 指定（`@/e2e/testids` / `next/link` / `next/navigation` の禁止）が消えてしまうため、既存 `paths` 3件を新ブロックにも書き写す必要がある旨を注意書きとして追加した

#### 7. U12 の機能数母数の不整合 ✅

- 変更内容: 進捗母数を `0/6` → `0/8` に修正（作業状況表・状態の定義・規模表）
- 変更ファイル: `plan_0906_features.md:138,154,324`、`plan_0906_features.html`（`--sync` で反映）
- 確認: `app/[locale]/(dashboard)/system/` の実ディレクトリは `config` / `dept` / `dict` / `log` / `menu` / `notice` / `role` / `user` の8件
- 補足: U2 の記述にある「既存は user/role/menu/dept/dict/log の6テスト」は `system.spec.ts` のテスト数（実測6件）であり、機能数とは別物のため変更していない

#### 8. U4 における VRT 原因の誤認 ✅

- 変更内容: `welcome-message.tsx` の影響範囲は `dashboard.spec.ts:17` のみと訂正。`products.spec.ts:25` については時刻固定では直らないことを明記し、疑うべき非決定性要因（描画完了待ち／mock のソート順／画像・フォント読み込み）を順序付きで追記
- 変更ファイル: `plan_0906_features.md`（U4 4-1）、`plan_0906_features.html`
- 確認: `WelcomeMessage` の利用箇所は `app/[locale]/(dashboard)/page.tsx:61` のみ（grep 実測）
- 「まず3回連続実行して再現を確認する。再現しなければ触らない」という元の方針は維持した

#### 9. 手動確認手順の `BACKEND_URL` 欠落 ✅

- 変更内容: 検証コマンド節に `cp .env.example .env.local`（初回のみ）を追加。`.env.local` を作らない場合の `BACKEND_URL=... pnpm dev` も併記。HTML 側には起動時クラッシュの警告 callout を追加
- 変更ファイル: `plan_0906_features.md`（検証コマンド節）、`plan_0906_features.html`
- 確認: `lib/env/server.ts:5` は `BACKEND_URL: z.string().url()` が必須、`.env` / `.env.local` は未作成で `.env.example` のみ存在。`package.json` の `start:test` も同じ形で環境変数を直接渡している

#### 10. 英語ロケール（`/en`）の E2E 欠落 ✅

- 変更内容: 受入条件に項目を追加し、U5 で `e2e/specs/i18n.spec.ts` を新規作成、以降のユニットでケースを1件ずつ足す方針を明記。雛形コードも追記
- 変更ファイル: `plan_0906_features.md`（各ユニットの受入条件）、`plan_0906_features.html`
- 確認: `e2e/specs/` に `/en` ルートを開く spec は現在1件も存在しない（grep 実測）
- 判断理由: 雛形は `main` 内に日本語が残っていたら落とす形にしたが、mock データ（`テスト商品1` 等）が `main` に出る画面では使えないため、その場合は特定要素に絞る旨を注記した。VRT スナップショットは ja/en 二重管理の維持コストが見合わないため `/en` では撮らない方針とした

#### 11. `useStoreOptions` の移行方針の未確定 ✅

- 変更内容: 判断を先送りせず、**`features/stores/index.ts` から re-export する**方針に確定。`lib/hooks/` へは移さない旨と判断理由を明記
- 変更ファイル: `plan_0906_features.md`（U14 実装内容）、`plan_0906_features.html`
- 判断理由: `useStoreOptions` は `store-api.client` と TanStack Query のキーに依存しており stores feature の所有物である。`lib/hooks/` へ出すと共有層が features の API に逆依存し、U14 が解消しようとしている結合方向の問題がそのまま残る。`lib/hooks/` に置くのは「どの feature にも属さない純粋なユーティリティフック」に限る
- 確認: 参照元は transactions / inventory / devices の3 feature・5箇所（grep 実測）

### 付随して修正したもの（レビュー指摘外）

- **`plan_0906_features.html` の入れ子リストが潰れる表示バグ**: `.step-list li` / `.accent-list li` が子孫セレクタだったため、入れ子 `<ul>` の `<li>` にも `display: flex` と `border-left` が適用され、テキストが細い縦カラムに潰れていた。直下セレクタ（`.step-list > li` / `.accent-list > li`）に限定し、`.step-body` ラッパを追加して解消。指摘4・6・11 で入れ子リストを追加した結果として顕在化したもので、元から潜在していた
- ルート `.gitignore` の EOF 改行欠落（`ign*` の行末）を修正

### 未対応（U0 実装時に行う）

- `apps/frontend-next/.gitignore:65` の `*storybook.logstorybook-static`（改行欠落による2エントリ連結）の分割と EOF 改行 — U0 コミット1 の作業範囲のため、計画の実装時に行う
- 上記 `.gitignore` 変更のコミット（現時点ではワークツリーに適用済み・未コミット）

### 検証

- `python3 _scripts/build_plan_html.py --check` → `OK 16 ユニット (未着手=16) / HTML 同期済み`
- HTML のタグ対応を機械検証 → 未閉じ・不整合ともに0件
- ブラウザで全5カテゴリを表示確認（入れ子リスト・表・コードブロックの描画崩れなし）
- `git check-ignore -v` で plan md / レビュー報告書がともに否定規則にマッチすることを確認
