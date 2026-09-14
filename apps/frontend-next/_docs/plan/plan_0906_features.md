# 機能単位実装計画 2026-09-06（demo2 反映版）

作成日: 2026-09-06 / 対象ブランチ: `feature/front-next-base` / 実装担当: Kimi

改訂: 2026-09-12（レビュー [`_review/review_0912_plan-0906-features.md`](../../_review/review_0912_plan-0906-features.md) の指摘1〜11を反映）

このファイルは**単体で着手できる**ように書いてある。着手前に他のドキュメントを読む必要はない。

本計画は、姉妹リポジトリ（`learning/tech-lead-react-demo`）の `_docs/plan/plan_0905_features.md`（元版・U0〜U15）を**本リポジトリのコードと突き合わせて再構成**したもの。元版のユニット番号との対応は「ユニット一覧」の元版列を参照。

---

## 背景

本リポジトリは `feature/front-next-base` ブランチで小売 API 統合（config / notice / profile / files / categories / payments 等）を進めており、元版とはコード状態が大きく異なる。突き合わせの結果、元版ユニットの適用可否は以下の通り。

| 元版 | 内容                     | demo2 での判定                                                                 |
| ---- | ------------------------ | ------------------------------------------------------------------------------ |
| U0   | 作業ツリーの確定         | **再定義**: 旧 plan 4件は Git 未追跡のため削除不要。ルート `.gitignore` の是正と plan / レビューの Git 追跡開始が主題 |
| U1   | import 配置の是正        | **対象外**: `lib/api/result.ts` は52行で末尾 import なし。指摘49 の元レビューも本リポジトリに存在しない |
| U2   | E2E 非決定性の解消       | **再定義**: VRT 時刻固定は有効。フィルタリセットは機構が異なるため再現確認から |
| U3   | system API 統一          | **縮小**: 生 fetch は `log-api.client.ts` のみ。ただし `/system/log` クラッシュの実害あり |
| U4   | 辞書項目画面             | **大半完了**: UI は実装済み。mock ハンドラと E2E が欠けている                  |
| U5   | ナビ導線                 | **拡大**: products / devices / transactions の3項目が未搭載                    |
| U6〜U13 | i18n                  | **部分適用済み**: useTranslations 使用16ファイル。残りを機能単位で潰す         |
| U14  | import 境界              | **適用可**: 違反リストは demo2 の実態に更新                                    |
| U15  | WS チケット残リスク      | **そのまま適用可**                                                             |

---

## 前提知識

### 技術スタック

| カテゴリ         | 技術                                  |
| ---------------- | ------------------------------------- |
| フレームワーク   | Next.js 15 (App Router)               |
| UI               | shadcn/ui + Radix UI + Tailwind CSS v4 |
| サーバー状態     | TanStack Query v5                     |
| クライアント状態 | Zustand v5                            |
| フォーム         | React Hook Form + Zod                 |
| 国際化           | next-intl（`ja` / `en`、既定は `ja`） |
| WebSocket        | @stomp/stompjs                        |
| テスト           | Playwright (E2E) のみ                 |

パッケージマネージャは **pnpm**。

### Server / Client 境界

```
app/[locale]/(dashboard)/<domain>/page.tsx   ← Server Component
  └─ features/<domain>/lib/*-api.server.ts   ← fetchFromBackend で Backend 直接 fetch
       └─ initialData として *-table-client.tsx に渡す
            └─ features/<domain>/lib/*-api.client.ts  ← fetchApi で /api/proxy 経由
```

- Server Component は `fetchFromBackend`（`lib/api/server.ts`。先頭に `import 'server-only'` あり）
- Client Component は `fetchApi`（`lib/api/client.ts`。`x-csrf-token` 自動付与あり、`:144`）。**生の `fetch` は使わない**
- 本リポジトリには `lib/hooks/use-table-query-params.ts` は**存在しない**。テーブルの検索条件は `useState` + `router.push` 直接（例: `features/stores/components/store-table-client.tsx:113`）

### 再利用する既存部品（新規に作らないこと）

| 部品                    | 場所                       | 役割                                                                |
| ----------------------- | -------------------------- | ------------------------------------------------------------------- |
| `fetchApi`              | `lib/api/client.ts`        | CSRF ヘッダ自動付与 / 401 リフレッシュ / timeout                    |
| `unwrapApiResponse`     | `lib/api/result.ts`        | `{code,msg,data}` エンベロープの解除（`responseSchema` 引数は無い） |
| `fetchFromBackend`      | `lib/api/server.ts`        | Server Component 用の Backend 直接 fetch                            |
| `TESTIDS` / `testId()`  | `lib/testing/testids.ts`   | E2E セレクタ。本番コードから `@/e2e/testids` の import は ESLint 禁止済み |

### i18n の作法

- Client Component: `const t = useTranslations('<namespace>')`
- Server Component: `const t = await getTranslations('<namespace>')`
- 参照実装: `features/auth/components/login-form.tsx`
- 文言は `messages/ja.json` / `messages/en.json`。**両方に同じキーを追加する**（現在 376 キーで一致済み）
- ナビゲーションは `@/i18n/navigation` の `Link` / `useRouter` / `usePathname` を使う（ESLint で禁止済み）

### E2E の作法

- spec: `e2e/specs/*.spec.ts`（14 spec）
- モック API: `e2e/mocks/mock-server.ts`（`apiResponse()` で `{code:'00000',msg,data}` に包む）。system 系の POST/PUT/DELETE ハンドラは `/users` `/roles` `/menus` `/depts` `/dicts` に既存
- ログインは `e2e/fixtures/auth.ts` の `login(page)` を使う
- セレクタは `data-testid` 優先（spec は `e2e/testids.ts` から import）

### 本リポジトリに存在しないもの（元版の記述を持ち込まない）

- `pnpm dev:all` / `pnpm test:unit` スクリプト、`*.test.ts` ユニットテスト
- `_review/review_0719_architecture.claude.md`（指摘48/49 の元ファイル）→ レビュー記録の追記は `_review/review_0710_adr-architecture.claude.md`（指摘5/12/25）のみ可能
- ADR-012 / ADR-013

なお `_scripts/build_plan_html.py`（進捗 HTML 同期スクリプト）は元リポジトリから**移植済み**。`_docs/plan/plan_0906_features.html` は生成物であり、アンカー内ブロックは直接編集せず `--sync` で更新する。

---

## ユニット一覧

定義（着手中に書き換えない表）。

| #   | ユニット                            | 種別          | 元版   | 主対象                                                              | 依存    |
| --- | ----------------------------------- | ------------- | ------ | ------------------------------------------------------------------- | ------- |
| U0  | plan / レビューの Git 追跡開始      | 整理          | U0     | ルート `.gitignore`、`apps/frontend-next/.gitignore`                | -       |
| U1  | log API クライアントの fetchApi 化  | 不具合修正    | U3     | `features/system/lib/log-api.client.ts`                             | U0      |
| U2  | dict items の mock/E2E 整備         | 機能補完      | U4     | `e2e/mocks/mock-server.ts`, `e2e/specs/system.spec.ts`              | U0      |
| U3  | products/devices/transactions 導線  | 機能追加      | U5     | `components/layout/sidebar.tsx`                                     | U0      |
| U4  | E2E 非決定性の点検・解消            | 品質          | U2     | `e2e/specs/{dashboard,products,stores,devices,transactions}.spec.ts` | U0      |
| U5  | i18n: products（基準実装）          | i18n(0710#25) | U6     | `features/products/`                                                | U0      |
| U6  | i18n: stores                        | i18n          | U7     | `features/stores/`                                                  | U5      |
| U7  | i18n: devices                       | i18n          | U8     | `features/devices/`                                                 | U5      |
| U8  | i18n: inventory                     | i18n          | U9     | `features/inventory/`                                               | U5      |
| U9  | i18n: transactions                  | i18n          | U10    | `features/transactions/`                                            | U5      |
| U10 | i18n: alerts                        | i18n          | U11    | `features/alerts/`                                                  | U5      |
| U11 | i18n: dashboard                     | i18n          | U12    | `features/dashboard/`                                               | U4, U5  |
| U12 | i18n: system                        | i18n          | U13    | `features/system/`（45ファイル・最大）                              | U1, U5  |
| U13 | i18n: その他（categories/files/payments/profile/auth） | i18n | -      | 上記以外の features と `app/**/profile`                             | U5      |
| U14 | feature 間 import 境界の ESLint 強制 | 品質(0710#12) | U14    | `eslint.config.mjs`, `features/*/index.ts`                          | U5〜U13 |
| U15 | WS チケットの残リスク明文化         | 設計(0710#5)  | U15    | `_docs/adr/ADR-005-stomp-realtime.md`                               | -       |

---

## 作業状況

**この表が進捗の正本。** 実装コミットとは別コミットで更新する。表を書き換えたら `python3 _scripts/build_plan_html.py --sync` で HTML に反映し、コミット前に `python3 _scripts/build_plan_html.py --check` を通す。

| #   | 状態   | 進捗 | 更新日 | メモ |
| --- | ------ | ---- | ------ | ---- |
| U0  | 完了   | 2/2  | 2026-09-12 | gitignore是正・planおよびレビュー文書追跡開始 |
| U1  | 完了   | -    | 2026-09-12 | fetchApi化・E2Eパス |
| U2  | 完了   | -    | 2026-09-12 | mockハンドラ・E2E追加・7テストパス |
| U3  | 完了   | -    | 2026-09-12 | sidebar導線追加・E2E全27テストパス |
| U4  | 完了   | -    | 2026-09-12 | VRT時刻固定・スナップショット更新・3連続パス |
| U5  | 完了   | -    | 2026-09-13 | 基準実装確定・schema生成関数(方式b)・i18n.spec追加・全12テストパス |
| U6  | 完了   | -    | 2026-09-13 | stores i18n化・E2E 8テストパス |
| U7  | 完了   | -    | 2026-09-14 | devices i18n化・CRUD E2E拡充・全11テストパス |
| U8  | 完了   | -    | 2026-09-14 | inventory i18n化・CRUD E2E拡充・全14テストパス |
| U9  | 未着手 | -    | -      |      |
| U10 | 未着手 | -    | -      |      |
| U11 | 未着手 | -    | -      |      |
| U12 | 未着手 | 0/8  | -      |      |
| U13 | 未着手 | -    | -      |      |
| U14 | 未着手 | -    | -      |      |
| U15 | 未着手 | -    | -      |      |

### 状態の定義

| 状態         | 意味                                         |
| ------------ | -------------------------------------------- |
| 未着手       | 手を付けていない                             |
| 着手中       | 作業中。メモに「いま何をしているか」を書く   |
| レビュー待ち | 実装は済んだが受入条件の確認が終わっていない |
| 完了         | 受入条件をすべて満たし、コミット済み         |
| 保留         | ブロックされている。**メモに理由必須**       |

- 同時に「着手中」にするユニットは**1つまで**
- 進捗はサブタスクがあるユニットのみ `済/全`（U0 は2コミット、U12 は8機能）
- 更新日は `YYYY-MM-DD`

---

## U0. plan / レビュー文書の Git 追跡開始

### 前提の訂正（2026-09-12 実測）

着手前に想定していた状態は、直前のコミット `c698d5e` / `21a6db2` で既に解消済み、または最初から成立していなかった。

| 当初の想定                             | 実態                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| 未コミット差分が `.gitignore` の1件ある | `git status` はクリーン。`apps/frontend-next/.gitignore` はコミット済みで `test-results` も記載済み |
| 旧 plan 4件を削除する必要がある        | `plan_0619.md` / `impl.md` / `tech-leader-todo.md` / `TODO-feature-todo.md` は**一度も Git に追跡されていない**（`git log --all` で0件）。削除コミットは不要 |
| 本 plan を追加するだけでよい           | ルート `.gitignore:83` `plan*.md` / `:91` `p*.md` により本 md が **ignored**。`git add` が拒否される（**真のブロッカー**） |

`_docs/plan/plan_0906_features.html`（生成物）は既に追跡済みで、**正本の md だけが追跡外**という捻れた状態になっている。これを解消するのが U0 の主題。

### 実装内容

| #   | コミットメッセージ                                                 | 含める変更                                                                                                                                                                      |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `chore(gitignore): track frontend-next plan and review docs`       | ルート `.gitignore` 末尾に `!apps/frontend-next/_docs/plan/*.md` と `!apps/frontend-next/_review/*.md` を追加（既存の ignore 行より**後ろ**に置く）。`apps/frontend-next/.gitignore` の `_review/*` 許可リストに本レビュー報告書を追加。ついでに同ファイル末尾の `*storybook.logstorybook-static`（改行欠落で2エントリが連結）を2行に分割し、EOF に改行を入れる |
| 2   | `docs(plan): add feature-unit implementation plan and review report` | `_docs/plan/plan_0906_features.md` と `_review/review_0912_plan-0906-features.md` の追加                                                                                         |

> ネストした `.gitignore` の否定規則は親の規則より優先される。ルート側の `review_*.md` は `apps/frontend-next/.gitignore` の `!_review/...` で上書きされるため、両方に手を入れる必要がある。

**適用状況（2026-09-12 時点）**: コミット1のうち `.gitignore` 2ファイルの否定規則追加は、本 plan を追跡可能にするため**ワークツリーに適用済み**（未コミット）。残りは `*storybook.logstorybook-static` の2行分割と EOF 改行、およびコミット作業。

**受入条件**

- `git check-ignore -v _docs/plan/plan_0906_features.md` が**否定規則**（`!`付き）を返す、または該当なしで終了する
- `git status --short` に両ファイルが `??` として現れ、`git add` できる
- `git status` がクリーン（コミット後）
- `pnpm lint` / `pnpm typecheck` が通る
- `_docs/plan/` に本 md と HTML が各1本だけ存在する

---

## U1. log API クライアントの `fetchApi` 統一（不具合修正・元版 U3）

### 問題

`features/system/lib/` の8クライアントのうち、生 `fetch` を使っているのは `log-api.client.ts` のみ（`user-api.client.ts` は fetchApi 済み。`:151` の export だけ Blob 扱いのため意図的に生 fetch で、コメント付き）。

`log-api.client.ts:13` の `getLogs` は `res.json()` をそのまま返すため `{code,msg,data}` のエンベロープごと返る。一方 `log-table-client.tsx:64-65` は `useLogs(params)` の戻り値を `displayData` として `:67` で `displayData.list.forEach(...)` するため、**クエリ解決後に `displayData.list` が undefined となり `/system/log` がハイドレーション後にクラッシュする**。GET のみなので CSRF 403 は起きないが、401 リフレッシュ・timeout も効かない。

### 実装内容

- `getLogs` を `fetchApi<LogPageResult>(path)` に置き換える。**参照実装: 同ディレクトリの `role-api.client.ts` / `dict-api.client.ts`**
- 書き換え後、`pnpm mock:server` + `pnpm dev`（2ターミナル）で `/system/log` を開き、リロード後も一覧が表示されコンソールにエラーが出ないことを実機確認する（`/logs` の GET ハンドラは `e2e/mocks/mock-server.ts:1306` に存在することを 2026-09-08 に確認済み。mock 追加は不要）

### 受入条件

- `/system/log` がハイドレーション後も正常に表示される
- `pnpm test:e2e` の system.spec が green

**コミット**: `fix(system): route log api client through fetchApi`

---

## U2. dict items の mock / E2E 整備（元版 U4 の残り）

辞書項目画面の UI は**実装済み**（`app/[locale]/(dashboard)/system/dict/[dictCode]/page.tsx`、`dict-item-table-client.tsx`、`dict-item-dialog.tsx`、Items ボタンは `dict-table-client.tsx:258` で有効、`dict-api.server.ts:67,75` に items 取得あり）。

欠けているのは mock とテスト:

- `e2e/mocks/mock-server.ts` に `/dicts/:dictCode/items` のハンドラが**存在しない** → mock 環境では items 画面の Server fetch が失敗し画面を検証できない
- `e2e/specs/system.spec.ts` に dict items のテストが無い（既存は user/role/menu/dept/dict/log の6テスト）

### 実装内容

- `mock-server.ts` に `/dicts/:dictCode/items` の GET / POST / PUT / DELETE ハンドラを追加（既存の dict ハンドラ `:1293` 付近を雛形に）
- `system.spec.ts` に「辞書項目の一覧表示」「辞書項目の作成」テストを追加

### 受入条件

- mock 環境で辞書一覧の Items から遷移し、項目の一覧・作成・編集・削除ができる
- `pnpm test:e2e` の system.spec が green

**コミット**: `test(e2e): add dict item mock handlers and coverage`

---

## U3. products / devices / transactions のナビゲーション導線（元版 U5）

`components/layout/sidebar.tsx` のメイン項目（`:46-52` 付近）は dashboard / stores / inventory / alerts のみで、`/products` `/devices` `/transactions` の3ページは存在するのに UI から到達できない（`header.tsx` のパンくずマップには名前がある）。文言キー `navigation.products` / `devices` / `transactions` は ja/en とも既存。

### 実装内容

- `sidebar.tsx` のメイン項目配列に3項目を追加する
  ```
  { titleKey: 'products', href: '/products', icon: ShoppingBag },
  { titleKey: 'devices', href: '/devices', icon: Monitor },
  { titleKey: 'transactions', href: '/transactions', icon: Receipt },
  ```
  - 配置は `dashboard` の後に `products`、`inventory` の後・`alerts` の前に `devices` / `transactions` が自然
  - アイコンは `lucide-react` から
- 折りたたみ時のツールチップ、`SIDEBAR_NAV_LINK` の testId は既存ロジックがそのまま効く。念のため確認する
- `e2e/specs/navigation.spec.ts` にサイドバーから3画面へ遷移するケースを追加（現在は dashboard/stores/inventory/alerts/system 系のみ）
- `e2e/specs/layout.spec.ts` に VRT スナップショットがあれば更新する

### 受入条件

- サイドバーから3画面へ遷移できる
- `navigation.spec.ts` / `layout.spec.ts` が green

**コミット**: `feat(layout): add products, devices and transactions to sidebar navigation`

---

## U4. E2E 非決定性の点検・解消（元版 U2 を再定義）

元版の原因分析（`use-table-query-params.ts` の `startTransition` 競合）は本リポジトリには**当てはまらない**（同フックは未導入、`router.push` 直接呼び出し）。まず再現するか確認し、再現したものだけ直す。指摘48 の元レビューファイルは本リポジトリに存在しないため、レビュー記録の追記は不要。

### 4-1. VRT の時刻固定

- `features/dashboard/components/welcome-message.tsx:14` の `getGreeting()` が実行時刻で挨拶文を切り替える。**ただし `WelcomeMessage` の利用箇所は `app/[locale]/(dashboard)/page.tsx:61` の1つだけ**なので、時刻依存の影響を受ける VRT は `dashboard.spec.ts:17` のみ
- `products.spec.ts:25` の VRT（`products-list.png`）に `welcome-message` は含まれない。**時刻固定では直らない**ため、揺れるなら別の非決定性要因を疑う
  - 疑う順: ① `waitForLoadState('networkidle')` だけで一覧データの描画完了を待てていない（`table` の行数や `TESTIDS` を明示的に待つ）／② mock データのソート順が不定／③ 画像・フォントの読み込み遅延
  - **まず3回連続実行して再現を確認する。再現しなければ触らない**
- `page.clock.setFixedTime()` で時刻を固定する（`page.clock` は Playwright 1.45+ で利用可能。本リポジトリは `@playwright/test 1.60.0` 導入済みのためアップグレード不要: 2026-09-08 に `pnpm list @playwright/test` で確認。着手時にバージョンが変わっていたら再確認し、1.45 未満ならアップグレードを先行する）
- アラートの相対時刻の元データ（`e2e/mocks/handlers.ts:230` の `mockAlerts[].createdAt`）は固定文字列なので、ブラウザ側の現在時刻を止めれば揺れないはず
- スナップショット更新が必要なら `pnpm exec playwright test --update-snapshots` を実行し、**差分画像を目視確認する**

### 4-2. フィルタリセットの安定性確認

- 対象: `stores.spec.ts:24` / `devices.spec.ts:38` / `transactions.spec.ts:39` のリセット後 `toHaveURL`
- 3回連続で実行して再現しなければ対応不要。**再現した場合のみ**待機条件を修正する（`timeout` の延長で誤魔化さない）

### 受入条件

- 対象 spec を3回連続で実行して全て green

```bash
CI=true pnpm exec playwright test e2e/specs/dashboard.spec.ts e2e/specs/products.spec.ts e2e/specs/stores.spec.ts e2e/specs/devices.spec.ts e2e/specs/transactions.spec.ts
```

**コミット**: `test(e2e): stabilize VRT with fixed clock`

---

## U5〜U13. 機能単位の i18n 適用（レビュー0710 指摘25）

本リポジトリは i18n が**部分適用済み**（`useTranslations` 使用は16ファイル: system の config/notice/dept/menu 系、`alert-list-client.tsx`、`profile` ページ等）。`system` namespace は128キーと充実しているが、features 配下にはまだ日本語ハードコードが多い。**1機能＝1コミット**で潰す。

### 共通手順（U5 の products で型を作り、U6 以降は踏襲）

1. 対象機能配下から日本語リテラルを洗い出す
   ```bash
   grep -rn "[ぁ-んァ-ヶ一-龥]" features/<domain> --include="*.tsx" --include="*.ts"
   ```
2. `messages/ja.json` の該当 namespace に既存キーがあれば**再利用する**
3. 不足分のみキーを追加。**`ja.json` と `en.json` に必ず同じキーを追加する**
4. Client Component は `useTranslations`、Server Component は `getTranslations`
5. Zod スキーマのエラーメッセージは `validation` namespace に寄せる。**方式（a: キー名を返して component 側で `t()` / b: `t` を渡すスキーマ生成関数）は U5 で確定し、以降踏襲する**
   - 判断基準: **(b)（スキーマ生成関数）を採用する。** 現行実装の実測（2026-09-12）に基づく:
     - スキーマは13ファイル（`features/{products,stores,devices,inventory}/schemas/`、`features/system/schemas/` 8件、`features/auth/components/login-form.tsx` 内に1件）
     - エラー表示は `{form.formState.errors.<field>.message}` を `<p>` に直接流す形が **44箇所**（例: `features/products/components/product-form.tsx:43,56`、`app/[locale]/(dashboard)/profile/page.tsx`）
     - (a) を採ると **この44箇所すべての JSX を `t(errors.<field>.message)` に書き換える**必要があり、U5〜U13 のスコープが大きく膨らむ
     - `max(100, '100文字以内で入力してください')` のように**引数を含むメッセージ**があり、キー名だけを返す (a) では `{max: 100}` の補間ができない
   - 実装形:
     ```ts
     // features/products/schemas/product-schema.ts
     import type { useTranslations } from 'next-intl';
     type T = ReturnType<typeof useTranslations<'validation'>>;

     export const createProductFormSchema = (t: T) =>
       z.object({
         productCode: z.string().min(1, t('required')),
         productName: z.string().min(1, t('required')).max(100, t('maxLength', { max: 100 })),
       });
     export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;
     ```
     ```tsx
     // component 側。JSX（errors.<field>.message の表示）は一切変更しない
     const t = useTranslations('validation');
     const schema = useMemo(() => createProductFormSchema(t), [t]);
     const form = useForm({ resolver: zodResolver(schema) });
     ```
     - `useMemo` を省くと毎レンダーで resolver が作り直されるので**必須**
     - `ProductFormValues` の export 名・型は据え置き、既存の import 側に影響を出さない
   - (b) の欠点（スキーマが `t` に依存する）は、本リポジトリに**ユニットテストが無く**（`*.test.ts` ゼロ、テストは Playwright E2E のみ）、スキーマの他 component 再利用も現状ゼロのため実害が無い
   - **`validation` namespace の共通キーは U5 で確定させる**（`required` / `maxLength` / `minValue` / `invalidFormat` 等）。U6 以降は原則このキーを再利用し、機能固有の文言のみ追加する
   - 確定した方式は `CONTRIBUTING.md` の「i18n の書き方」節に記録し、U6 以降の担当者はそこを参照する
6. **既存 E2E がテキスト照合している文言は、現行の表示文字列と一字一句同じにする。変える場合は spec も同じコミットで直す**
   - **着手時に必ず実行する**（対象機能の spec が何を文言照合しているかの洗い出し）:
     ```bash
     grep -rn "getByText('\|getByRole('button', { name: '\|getByLabel('\|getByPlaceholder('" e2e/specs/<domain>*.spec.ts
     ```
   - 照合文言は2種類ある。扱いが違うので分けて判断する（下表）
   - **demo2 固有の注意**: `system.spec.ts` は英語ボタン名（`Search` / `Reset` / `Add New Dictionary`）と日本語（`字典の追加` / `キャンセル`）が混在した文言を照合している。`字典` は誤字（正しくは `辞書`、`dict-dialog.tsx:84`）なので、U12 で `辞書の追加` に直し、spec を同時に更新する

#### 照合文言の分類

| 種別            | 例                                                                              | i18n 化の影響                      | 対応                                                                       |
| --------------- | ------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| mock データ由来 | `getByText('テスト商品1')` / `東京本店` / `レジ端末1`                           | **無し**（`e2e/mocks/` のデータ）  | 触らない                                                                   |
| UI 文言由来     | `getByText('店舗を登録しました')` / `getByRole('button', { name: 'キャンセル' })` | **あり**（1文字変えれば落ちる）    | ja の値を現行文字列と完全一致で移す。変える場合は同じコミットで spec も直す |

#### 実測済みの UI 文言照合（2026-09-12）— 各ユニットの着手前チェックリスト

| ユニット      | spec:行                                  | 照合文言                                                                                                           |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| U5 products   | `products-crud.spec.ts:44`               | `商品を作成しました`                                                                                               |
| U6 stores     | `stores.spec.ts:36`                      | `店舗を登録しました`                                                                                               |
| U7 devices    | `devices.spec.ts:62`                     | `デバイスを登録しました`                                                                                           |
| U8 inventory  | `inventory.spec.ts:95`                   | `廃棄を記録しました`                                                                                               |
| U11 dashboard | `navigation.spec.ts:102`                 | `再試行`                                                                                                           |
| U12 system    | `system.spec.ts:20,21,23,49,53,75,78`    | `Search` / `Reset` / `Add User` / `Add New Role` / `Permissions` / `Create Menu`                                    |
| U12 system    | `system.spec.ts:24,25,28,50,54,58,79`    | `ユーザーの追加` / `ユーザーの編集` / `役割の追加` / `役割の編集` / `権限設定` / `メニューの追加` / `キャンセル`    |

`products.spec.ts:79-81` のバリデーションエラー確認は `.text-destructive` のクラス照合で、**文言に依存しない**。U5 の Zod i18n 化で壊れない。

### ユニットごとの規模（日本語リテラル含有ファイル数・コメント含む概数）

| ユニット | 機能         | 概数 | 補足                                                                                          |
| -------- | ------------ | ---: | -------------------------------------------------------------------------------------------- |
| U5       | products     |    7 | **基準実装。方式を確定し `CONTRIBUTING.md` に「i18n の書き方」節を追記する**                  |
| U6       | stores       |    7 |                                                                                               |
| U7       | devices      |   10 | U3 でサイドバーに載るので表記の整合を取る                                                     |
| U8       | inventory    |   11 | `inventory-form.tsx` / 各ダイアログを含む                                                     |
| U9       | transactions |    7 | CSV エクスポートのヘッダ文言も対象                                                            |
| U10      | alerts       |   10 | STOMP 接続状態の表示文言を含む（`alert-list-client.tsx` は一部適用済み）                      |
| U11      | dashboard    |    6 | 挨拶文は U4 の VRT 時刻固定と整合を取る。**ja の文言は変えない**                              |
| U12      | system       |   45 | 最大。user/role/menu/dept/dict/log/config/notice の**8機能**で分割コミット可（進捗 0/8。dict item は dict に含める） |
| U13      | その他       |   10 | categories 4 / files 2 / payments 3 / auth 1。components の無い機能は hooks/lib のユーザー向け文言のみ |

### 各ユニットの受入条件

- 対象機能に日本語リテラルが残っていない（コメントを除く）
- `ja.json` と `en.json` のキー構造が一致する
  ```bash
  node -e "const a=require('./messages/ja.json'),b=require('./messages/en.json');const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?f(v,p+k+'.'):[p+k]);const A=f(a).sort(),B=f(b).sort();console.log(A.length,B.length,JSON.stringify(A.filter(x=>!B.includes(x))),JSON.stringify(B.filter(x=>!A.includes(x))))"
  ```
- **`en.json` の値が日本語のままコピーされていないこと**
  ```bash
  node -e "const a=require('./messages/ja.json'),b=require('./messages/en.json');const w=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?w(v,p+k+'.'):[[p+k,v]]);const B=Object.fromEntries(w(b));console.log(w(a).filter(([k,v])=>B[k]===v&&/[ぁ-んァ-ヶ一-龥]/.test(v)).map(([k])=>k))"
  ```
- 対象機能の E2E spec が green
- `/en/...` で画面を開いて英語表示になることを目視確認する
- **`/en` の自動回帰**: 現在 `e2e/specs/` に `/en` ルートを開く spec は**1件も無い**ため、目視確認は CI に残らない。U5 で `e2e/specs/i18n.spec.ts` を新規作成し、以降のユニットでケースを1件ずつ追加する
  ```ts
  // U5 で作る雛形。ja の文言が en に混入していたら落ちる
  test('商品一覧が英語で表示される', async ({ page }) => {
    await login(page);
    await page.goto('/en/products');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('main')).not.toHaveText(/[ぁ-んァ-ヶ一-龥]/);
  });
  ```
  - mock データ（`テスト商品1` 等）が `main` 内に出る画面では `not.toHaveText` が使えない。その場合は見出し・ボタン等の**特定要素**に絞って英語文言を照合する
  - VRT スナップショットは ja / en で別ファイルになり維持コストが増えるため、`/en` では**撮らない**

**コミット例**: `refactor(products): move hardcoded strings to i18n messages`

---

## U14. feature 間 import 境界の ESLint 強制（レビュー0710 指摘12）

### 実装内容

- `eslint.config.mjs` の `no-restricted-imports` に、他 feature の深い階層への import を禁止するパターンを追加する。公開 API（`@/features/<domain>` の `index.ts`）経由のみ許可する
- **必ず `files` でスコープを限定した独立ブロックとして追加する。既存ブロックに混ぜない**
  - 現行 `eslint.config.mjs:14-46` の `no-restricted-imports` は `files` の無いルートレベル設定で、**全ファイルに適用される**。ここに feature 深掘り禁止パターンを足すと `app/[locale]/(dashboard)/**/page.tsx` や `components/layout/` からの import まで巻き込み、`pnpm lint` / `pnpm build` が大量に落ちる
  - 禁止するのは **feature 間（横方向）** のみ。`app/` や `components/` から feature への import（**縦方向**）は**許可**する
  ```js
  // 既存のルートレベルブロックとは別に、配列の後ろへ追加する
  {
    files: ['features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: '他 feature へは公開 API（@/features/<domain>）経由で import すること。',
            },
          ],
        },
      ],
    },
  },
  ```
  - **注意**: Flat Config で同じルール名を後段ブロックが再指定すると**上書き**になる。上記ブロックは `features/**` にのみ効くため、`features/` 配下では既存の `paths` 指定（`@/e2e/testids` / `next/link` / `next/navigation` の禁止）が消える。**既存の `paths` 3件を上記ブロックにも書き写して両立させること**（`features/` 配下こそ `next/link` 禁止が効いてほしい箇所）
  - `group: ['@/features/*/*']` は自 feature 内の深掘りも巻き込むが、自 feature 内は相対 import（`../hooks/use-products`）が既存の書き方なので実害は出ない。着手時に `grep -rn "from '@/features/" features` で確認する
- **判明している違反（2026-09-06 実測）**: U5〜U13 の i18n で import が増減するため、着手前に以下で再検証すること
  ```bash
  grep -rn "from '@/features/" features --include="*.ts" --include="*.tsx" | grep -v "index"
  ```
  - `features/products/components/product-table-client.tsx` → `@/features/categories/hooks/use-categories`
  - `features/transactions/components/transaction-table-client.tsx` → `@/features/stores/hooks/use-stores`
  - `features/inventory/components/inventory-form.tsx` → `@/features/products/lib/product-api.client` と `@/features/stores/hooks/use-stores`
  - `features/inventory/components/inventory-table-client.tsx` → `@/features/stores/hooks/use-stores`
  - `features/devices/components/device-table-client.tsx` / `device-form.tsx` → `@/features/stores/hooks/use-stores`
  - `features/payments/types/payment.ts` → `@/features/transactions/types/transaction`（type-only）
- `index.ts` が無い feature（**alerts / auth / dashboard / files / products**）に公開 API として `index.ts` を追加する（既存: categories / devices / inventory / payments / stores / system / transactions）
- `useStoreOptions`（`features/stores/hooks/use-stores.ts:40`）は **transactions / inventory / devices の3 feature・5箇所**から参照されている（`transaction-table-client.tsx:14` / `inventory-form.tsx:21` / `inventory-table-client.tsx:32` / `device-table-client.tsx:16` / `device-form.tsx:20`）
  - **方針は先に確定させる: `features/stores/index.ts` から re-export し、利用側の import を `@/features/stores` に付け替える**（`lib/hooks/` へは移さない）
  - 判断理由: このフックは store ドメインの API（`store-api.client`）と TanStack Query のキーに依存しており、stores feature の所有物である。`lib/hooks/` へ出すと共有層が features の API に逆依存し、U14 が消そうとしている結合方向の問題がそのまま残る
  - `lib/hooks/` へ出すのは「どの feature にも属さない純粋なユーティリティフック」に限る。今回の対象には無い
- `_review/review_0710_adr-architecture.claude.md` の末尾に指摘12の対応ブロックを追記する

### スコープの但し書き（重要）

0710 指摘12 は**2論点**を含む。

1. ESLint 境界ルールが feature ごとの手動列挙でスケールしない ← **U14 で対応する**
2. Server/Client 境界のカバレッジに穴がある ← **U14 のスコープ外**

(2) について、本リポジトリも `lib/api/server.ts:1` に `import 'server-only'` があり（`server-only@^0.0.1` 導入済み）、Client から server モジュールへの import は推移的にビルド時エラーになる。U14 で (2) まで対応しない場合は、**レビュー記録で指摘12を「✅ 対応完了」にせず、(2) を「⚠️ 要対応（別タスク）」として明記する**。

### 受入条件

- `pnpm lint` が通り、意図的な例外（`eslint-disable`）がゼロ
- `pnpm build` が通る

**コミット**: `refactor(features): enforce cross-feature import boundaries`

---

## U15. WS チケット方式の残リスク明文化（レビュー0710 指摘5）

`app/api/ws/connect/route.ts:22` は短寿命チケットを検証した後に**生の accessToken を JS に返している**。恒久対応には Backend 側の改修が必要で、FE 単独では解消できない。

### 実装内容

- `_docs/adr/ADR-005-stomp-realtime.md` に以下を追記する
  - 現状の残リスク（accessToken が JS に露出する）
  - Backend 側に必要な対応
  - 移行条件
- FE 側の緩和状況: `features/alerts/hooks/use-stomp.ts` はトークンをローカル変数で取得後すぐ `connectHeaders` に渡している（`:101-102` 付近）。長寿命 state への保持がなければ追加対応は不要。接続確立後の参照破棄だけ確認する
- `_review/review_0710_adr-architecture.claude.md` の末尾に指摘5の対応ブロックを追記する

### 受入条件

- ADR-005 に残リスク・Backend 側必要対応・移行条件が明記されている
- `e2e/specs/alerts.spec.ts` が green

**コミット**: `docs(adr): record remaining ws ticket risk and migration conditions`

---

## 共通ルール

- **ブランチ**: `feature/front-next-base` で継続する
- **コミット**: 1ユニット＝1コミット、Conventional Commits 形式
  - AI 生成を示す文言・`Co-Authored-By` は**書かない**
  - author / committer は人間の値のままにする（`git config user.name` / `user.email` を変更しない）
- **スコープ**: 1ユニットの範囲を超える「ついで修正」をしない。気付いた別問題は本ファイル末尾の「追加で見つかった課題」に追記して次ユニット化する
- **レビュー記録**: 0710 指摘（5/12/25）に対応したら `_review/review_0710_adr-architecture.claude.md` の**末尾**に追記する。指摘48/49 の元ファイルは本リポジトリに存在しないため追記不要。**新規レビューファイルは作らない**
- **進捗**: 「作業状況」表を直接更新する。実装コミットには混ぜない
- **plan の本数**: この計画は `_docs/plan/` に md と HTML を各1本だけ維持する。新しい計画に差し替えるときは古い md / HTML を削除する（複数の plan を並存させない）
- **機能 issue の正本**: 機能別 issue の対応状態は `_docs/issues.html` が正本（AGENTS.md の UI-first フロー参照）。本計画のユニット完了時に該当 issue がある場合は issues.html も更新する

### レビュー記録の書式

```markdown
## YYYY/MM/DD HH:MM kimi 対応完了

### 対応状況サマリー

| #   | 指摘内容 | 重大度 | 対応状況    |
| --- | -------- | ------ | ----------- |
| 5   | ...      | High   | ✅ 対応完了 |

### 各指摘の対応詳細

#### 5. xxx ✅

- 変更内容: ...
- 変更ファイル: `path/to/file:line`
- 判断理由: ...
```

ステータス表記: ✅ 対応完了 / ⚠️ 要対応（別タスク）/ ❌ 対応不要（理由必須）

---

## 検証コマンド

静的チェック（本リポジトリに `test:unit` は存在しない）:

```bash
pnpm lint && pnpm typecheck
```

ビルド:

```bash
pnpm build
```

E2E フルスイート（本番ビルド + モックサーバーを自動起動する）:

```bash
pnpm test:e2e
```

単一 spec のみ:

```bash
CI=true pnpm exec playwright test e2e/specs/system.spec.ts
```

VRT スナップショット更新:

```bash
pnpm exec playwright test --update-snapshots
```

手動確認（2ターミナルで起動）:

`lib/env/server.ts:5` は `BACKEND_URL` を**必須**（`z.string().url()`）として起動時に検証し、欠けていると例外で落ちる。リポジトリには `.env.example` しか無く `.env` / `.env.local` は未作成なので、**初回のみ環境ファイルを用意する**。

```bash
cp .env.example .env.local   # 初回のみ。BACKEND_URL=http://localhost:8091/api/v1 が入る
```

```bash
pnpm mock:server   # ターミナル1 (port 8091)
pnpm dev           # ターミナル2 (port 3001)
```

`.env.local` を作らずに済ませる場合は環境変数を直接渡す（`package.json` の `start:test` と同じ形）:

```bash
BACKEND_URL=http://localhost:8091/api/v1 pnpm dev
```

---

## 追加で見つかった課題

突き合わせ時・作業中に見つかった、現ユニットの範囲外の問題をここに追記する。

**ユニット化の判断基準**: 進行中のユニットを壊さない小粒の修正は、現行計画に新ユニットとして追記してよい（依存と「作業状況」表も更新する）。それ以外は **U0〜U15 完了後に本セクションを棚卸し**し、必要なものを次期計画にユニット化する。

- **`.gitignore` 末尾の連結行**: `apps/frontend-next/.gitignore:65` の `*storybook.logstorybook-static` は改行欠落で2エントリが連結している。EOF 改行も無い。U0 コミット1で修正する（**未対応**）
- **ルート `.gitignore` の広すぎる ignore パターン**: `p*.md`（`:91`）は `package.md` `proposal.md` など任意の `p` 始まりの md を巻き込む。U0 では `apps/frontend-next/` 配下の否定規則で回避したが、パターン自体の適正化はリポジトリ全体に影響するため別タスク化する
- **`profile` のフォームも i18n 対象**: `app/[locale]/(dashboard)/profile/page.tsx` はページが `app/` 配下にあり `features/` の grep から漏れる。U13 の対象に含める（ユニット一覧の主対象に `app/**/profile` と記載済み）
- **`字典の追加` の誤字**: `dict-dialog.tsx:84`（正しくは `辞書`）。U12 で文言移動時に修正し、`system.spec.ts` の照合も同時に直す
- **system.spec.ts の英日混在照合**: `Add New Dictionary` / `Search` / `Reset` 等の英語ボタン名と日本語が混在。U12 で画面文言を namespace に寄せる際に spec も整理する
- **`user-api.client.ts:151` の export**: Blob 取得のため意図的に生 fetch（コメント付き）。`fetchApi` が Blob を扱えるようにする拡張をやるなら別ユニット化する
- **demo2 固有の差分（元版との構造差）**: config / notice / profile / files / categories / payments は元版 plan の対象外機能。i18n は U12/U13 でカバーするが、E2E の spec は config/notice/profile 用が無い（必要なら別ユニット化）
