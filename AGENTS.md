# AGENTS.md - SmartRetail Pro AI 向けプロジェクトガイド

> 本ファイルは、Codex およびその他の AI コーディングエージェントが本リポジトリで作業する際のガイドラインです。`AGENTS.md`（本ファイル）と `AGENT.md` を統合したものです。

## 共通ルール / Common Rules

全プロジェクト共通の AI 向けルールは下記を参照する。

@~/ai-rules/ai-common.md

## 参照ドキュメント / Reference Documents

### 要件定義 / Requirements
- `docs/architecture/design/smart-retail-requirements.md` - Smart Retail 要件定義

### 設計書 / Design
- `docs/architecture/design/smart-retail-ui-design.md` - UI 設計書
- `docs/architecture/design/smart-retail-ai.md` - AI 機能設計
- `docs/architecture/design/smart-retail-sql.md` - データベース設計

### ADR (Architecture Decision Records)
- `docs/adr/` - 技術選定の意思決定記録

### Issue 管理
- `docs/issues/plan_issue.md` - Issue 一覧とステータス管理
- `docs/issues/` - 個別の Issue ファイル

### その他
- `docs/source/code.md` - ソースコード関連ドキュメント
- `README.md` - 人間向けプロジェクト概要

## プロジェクト概要 / Project Overview

**SmartRetail Pro** - Retail inventory and sales management system

| Component | Path | Stack |
|-----------|------|-------|
| Backend API | `../smart-dx-backend/apps/backend/` | Java 17, Spring Boot 3.3, MyBatis Plus, Spring Security |
| Frontend UI | `apps/frontend/` | Vue 3, TypeScript, Vite, Element Plus, Pinia |
| Frontend EC | `apps/frontend-ec/` | E-commerce frontend (separate) |
| Frontend Next.js | `apps/frontend-next/` | Next.js 15, React 19, TypeScript 5.8 |
| Docker | `platform/docker/` | Docker Compose environment |

> **Note**: `apps/backend/` in this repository is deprecated. Use `../smart-dx-backend/apps/backend/` instead.

## 自動実行ルール / Auto-execution Rules

- **確認を求めない** - 作業中に確認を求めず自律的に判断して進める
- **常に自動で進める** - 明示的に停止を指示されない限り作業を継続する
- **ユーザー同意を前提とする** - 明示的な拒否がない限りユーザーの同意があるものとして扱う

### 確認が必要なコマンド

```bash
# ブランチ削除（確認必須）
git branch -d <branch>
git branch -D <branch>
git push origin --delete <branch>
```

## アプリケーション基盤の保護 / Application Foundation Protection

- **既存ソース構造を理解した上で実装を行う**
- **特に理由なければ、アプリ基盤関連の Code は変更しない**
- **temp フォルダ配下のドキュメントは無視してよい**（一次保存後で削除予定）

## 変更可能な範囲 / Modifiable Scope

Freely modifiable:
- `../smart-dx-backend/apps/backend/src/main/java/com/youlai/boot/modules/retail/`
- `../smart-dx-backend/apps/backend/src/main/resources/mapper/retail/`
- `apps/frontend/src/` (retail-related)
- `platform/docker/` (Docker configuration)

Changes outside these directories require justification.

## プロジェクト構造 / Project Structure

### Backend Structure

```
../smart-dx-backend/apps/backend/src/main/java/com/youlai/boot/
├── modules/retail/          # Business modules (modifiable)
│   ├── controller/          # REST endpoints
│   ├── converter/           # MapStruct converters (entity/form/vo)
│   ├── mapper/              # MyBatis mapper interfaces
│   ├── model/
│   │   ├── entity/          # Database entities
│   │   ├── form/            # Request DTOs for create/update
│   │   ├── query/           # Request DTOs for search
│   │   └── vo/              # Response DTOs
│   ├── service/             # Service interfaces
│   └── service/impl/        # Service implementations
├── common/                  # Shared utilities (protected)
├── config/                  # Spring configurations (protected)
├── core/                    # Core framework (protected)
├── shared/                  # Shared components (protected)
└── system/                  # System management (protected)
```

### Frontend Vue Structure

```
apps/frontend/src/
├── api/                     # API client modules
├── views/                   # Page components
├── components/              # Reusable components
├── store/                   # Pinia stores
├── router/                  # Vue Router config
├── utils/                   # Utilities (request.ts wraps axios)
└── types/                   # TypeScript definitions
```

### Frontend Next.js Structure

`apps/frontend-next/` 固有の詳細な構成・規約は `apps/frontend-next/AGENTS.md` を参照。

## ビルド・実行コマンド / Build & Run Commands

### Backend
```bash
# Run application
cd ../smart-dx-backend/apps/backend && ./mvnw spring-boot:run

# Run all tests
cd ../smart-dx-backend/apps/backend && ./mvnw test

# Run single test class
cd ../smart-dx-backend/apps/backend && ./mvnw test -Dtest=ProductControllerRestAssuredTest

# Build
cd ../smart-dx-backend/apps/backend && ./mvnw clean package -DskipTests
```

### Frontend (Vue)
```bash
# Install dependencies
cd apps/frontend && pnpm install

# Development server
cd apps/frontend && pnpm dev

# Build
cd apps/frontend && pnpm build

# Lint
cd apps/frontend && pnpm lint:eslint
cd apps/frontend && pnpm lint:prettier
cd apps/frontend && pnpm lint:stylelint
```

### Frontend Next.js
```bash
cd apps/frontend-next && pnpm install

# Development server (port 3001)
cd apps/frontend-next && pnpm dev

# Production build
cd apps/frontend-next && pnpm build

# Production server (port 3001)
cd apps/frontend-next && pnpm start

# Lint
cd apps/frontend-next && pnpm lint
cd apps/frontend-next && pnpm lint:fix

# E2E tests
cd apps/frontend-next && pnpm mock:server  # port 8091
cd apps/frontend-next && pnpm test:e2e
cd apps/frontend-next && pnpm test:e2e:ui
cd apps/frontend-next && pnpm test:e2e:headed
```

### Docker
```bash
# Start infrastructure (MySQL, Redis, MinIO)
cd platform/docker && docker compose -f docker-compose-env.yml --env-file .env up -d

# Start application (backend, frontend)
cd platform/docker && docker compose -f docker-compose-app.yml --env-file .env up -d

# Stop all
cd platform/docker && docker compose -f docker-compose-app.yml down
cd platform/docker && docker compose -f docker-compose-env.yml down
```

## 開発規約 / Development Conventions

### Backend
- All Java files: `@author jason.w`
- Tests: REST Assured integration tests extending `BaseControllerTest`
- Test location: `../smart-dx-backend/apps/backend/src/test/java/com/youlai/boot/modules/retail/`
- Test profile: `@ActiveProfiles("test")`

### Frontend Vue API Pattern
Use `request<any, T>()` from `@/utils/request`:
```typescript
return request<any, PageResult<ProductVO[]>>({
  url: `${BASE_URL}/page`,
  method: "get",
  params: queryParams,
});
```

The request wrapper returns `response.data.data` directly. Frontend receives:
- `Result<T>` -> `T`
- `PageResult<T>` -> `{ list, total }`

## バックエンド API 開発フロー / Backend API Development Flow

- **API 新規作成時**: ビジネスロジックソース + テストソースをセットで作成
- **controller 作成時**: 必ずテストコードも作成
- **ソースファイル修正時**: 上書きで対応
- **API 変更時**: 関連するビジネスロジック + テストソースも同時更新
- **Author 設定**: すべての Java ファイルの `@author` は `jason.w` とする

### ビジネスロジックの標準構造
```
../smart-dx-backend/apps/backend/src/main/java/com/youlai/boot/modules/retail/
├── controller          # REST API エンドポイント
├── converter          # entity, form, vo の変換
├── mapper             # MyBatis マッパーインターフェース
├── model/
│   ├── entity        # データベースエンティティ
│   ├── form          # 更新・追加 API のリクエストパラメータ
│   ├── query         # 検索 API のリクエストパラメータ
│   └── vo            # 検索時のレスポンスパラメータ
├── service            # ビジネスロジックインターフェース
└── service/impl       # ビジネスロジック実装

../smart-dx-backend/apps/backend/src/main/resources/mapper/retail/  # MyBatis XML マッパー
../smart-dx-backend/apps/backend/src/test/java/com/youlai/boot/modules/retail/  # テストコード
```

### 参照実装
以下のファイルを参考にして実装:
- **UserPageQuery.java** - ページネーション検索クエリ
- **User.java** (entity) - データベースエンティティ
- **UserForm.java** - 更新・追加フォーム
- **UserServiceImpl.java** - サービス実装
- **UserController.java** - REST コントローラー
- **UserConverter.java** - オブジェクト変換
- **ProductControllerRestAssuredTest.java** - テストケース参考

## フロントエンド連携ルール / Frontend Integration Rules

- **frontend も確認した上で変更を行う**
- バックエンド API との整合性を保つ
- データ構造の変更はフロントエンドへの影響を考慮する

### API 呼び出しの実装方針
- `apps/frontend/src/api/system/user.api.ts` と同じ形式で実装する
- `request<any, T>({ url, method, params, data })` を使用する（`request.get/post/...` 直呼びは避ける）
- `@/utils/request` は **成功時に `response.data.data` を返す**（code 判定して data を unwrap）ため、画面側で `res.data...` は参照しない
- `ApiResponse` のような独自ラッパ型は作らず、**バックエンドの `data` 部分の型**をそのまま `T` にする

### 戻り値の読み方（重要）
- `Result<T>`（例: 一覧・詳細）→ フロントが受け取るのは `T`
- `PageResult<T>`（ページング）→ フロントが受け取るのは `{ list, total }`（= `PageResult.data`）
  - 例: `res.list`, `res.total`（`res.data.list` ではない）

### 型・命名
- 画面側は API の返却形に合わせる（`records/current/size` などは使用しない）
- backend の `productName/unitPrice` 等の命名差は、画面側で必要に応じてマッピングして整合させる

## テスト駆動開発 / Test-Driven Development

- テスト配置場所: `../smart-dx-backend/apps/backend/src/test/java/com/youlai/boot/modules/retail`
- 参考テスト: `ProductControllerRestAssuredTest.java`
- REST Assured を使用した統合テスト

## 変更影響範囲チェックリスト / Change Impact Checklist

- [ ] ビジネスロジック（controller, service, mapper 等）
- [ ] MyBatis XML マッパーファイル
- [ ] テストソース
- [ ] フロントエンド API 呼び出し箇所（影響がある場合）

## マルチテナント対応レビュー / Multi-tenant Review

- SQL/DB 設計で `tenant_id` を追加する場合、単独の `fk_*_tenant` だけでは不十分。子テーブルの `tenant_id` と `store_id` / `product_id` / `sales_id` など参照先のテナントが一致することを、複合 FK や同等の制約で確認する。
- テナント内一意に変更すべき業務キーは漏れなく確認する。例: 店舗コード、商品コード、カテゴリコード、デバイスコード、注文番号。
- `TenantLineInnerInterceptor` の ignore 対象は最小化する。`tenant_id` を持たない明細テーブルを ignore する場合は、直接クエリを禁止し、必ず親テーブル JOIN でテナント条件を担保する。
- デモデータや移行 SQL の `DELETE` / `UPDATE` / 重複チェックにも `tenant_id` 条件を入れる。`tenant_id` を持たない子テーブルは親テーブル経由で対象テナントに限定する。
- 設計書の移行 SQL は既存 DDL の実インデックス名・制約名と照合し、そのまま実行できる名前になっているか確認する。
- Backend 側で `TenantLineInnerInterceptor`、テナントコンテキスト、JWT claims、INSERT 時の `tenant_id` 設定、ignore 対象テーブルのテストが揃っているか確認する。

## 設計変更 / Design Changes

設計変更時、設計書の修正履歴も更新する。

### レビュー指摘
レビュー時同じフォルダに `{file}_qa.md` に以下の形式で追記
```
- Q1 2025/01/01 14:00  {ai model}(指摘者)
xxxxx
- Q2 2025/01/01 14:01  {ai model}(指摘者)
xxxxx
```

### レビュー回答
レビュー指摘の対応及び回答時
対象設計書を更新する。
`{file}_qa.md` に以下の形式で追記
```
- Q1の回答 2025/01/01 14:02  {ai model}(回答者)
xxxxx
```

## Issue 対応フロー / Issue Workflow

### 1. ブランチ作成

- 新しい issue に対応するとき、ブランチを現在の branch から対応用 branch 新規作成する
```bash
git fetch origin
```
作業ブランチ: `feature/issue-<番号>-<概要>`

### 2. 実装
- Issue ファイル (`docs/issues/issue-XXX-*.md`) を確認
- **1 Issue = 1 ブランチ**で対応
- コミットメッセージに Issue 番号を含める
- GitHub Issue も作成する

### 3. テスト・ビルド確認
- ビルドエラーがないことを確認
- テストケースが全て通ることを確認
- コードの動作を検証

### 4. 動作確認（ユーザー目視）
- **テスト・ビルド完了後、一旦停止する**
- ユーザーが目視で動作確認を行う
- **直接コミットは行わない** - ユーザーの確認・承認を待つ

### 5. コミット・プッシュ
```bash
git add <files>
git commit -m "feat(scope): description (issue-XXX)"
git push -u origin feature/issue-XXX-description
```

**コミットメッセージの形式:**
- `feat(scope): 機能追加の説明 (issue-XXX)`
- `fix(scope): バグ修正の説明 (issue-XXX)`
- `refactor(scope): リファクタリングの説明 (issue-XXX)`
- **Author**: jason.w

### 6. PR 作成
```bash
gh pr create --title "[Phase X Backend/Frontend] 機能名" \
  --body "# Summary
- Issue #X の実装
- 主要な変更点の概要

# Changes
- 変更内容1
- 変更内容2
- 変更内容3

# Test plan
- テスト項目1
- テスト項目2
- テスト項目3

Closes #X" \
  --base develop
```

**PR 本文の形式:**
```markdown
# Summary
- Issue #X の実装
- 主要な変更点の概要

# Changes
- 変更内容1（ファイル名や機能名を具体的に）
- 変更内容2
- 変更内容3

# Test plan
- テスト項目1（実施したテストを具体的に）
- テスト項目2
- テスト項目3

Closes #X
```

**重要事項:**
- **PR は必ず develop ブランチへ提出する**
- PR 本文に `Closes #X` を記載して Issue と紐付ける
- PR がマージされると自動的に Issue が close される

### 7. PR 承認・マージ
- 承認・マージは GitHub Web UI で手動実施
- develop ブランチへマージ後、定期的に main ブランチへリリース

### 8. Issue 対応完了の記録
- **PR マージ後**、`plan_issue.md` を更新
- 該当 Issue のステータスを「対応完了」に変更
- 完了日時と PR 番号を記録

## 環境変数 / Environment Variables

- 環境変数は `apps/backend/.env` を参照する

## コミット・PR ガイドライン / Commit & PR Guidelines

- Conventional Commit スタイルを推奨: `feat:`, `refactor:`, `docs:`, `chore:` 等
- コミットは焦点を絞り、命令形で記述
- PR には変更内容、影響範囲、関連 Issue/ADR、UI 変更のスクリーンショットを記載
- テスト結果を明記

## 備考 / Notes

- `apps/backend/` は廃止予定。`../smart-dx-backend/apps/backend/` を使用すること。
- `apps/frontend-next/` 固有の詳細な規約は `apps/frontend-next/AGENTS.md` を参照すること。
