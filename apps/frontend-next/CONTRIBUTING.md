# CONTRIBUTING.md

## 開発環境のセットアップ

```bash
pnpm install
cp .env.example .env.local
```

## ブランチ戦略

- `main`: 本番反映用
- `develop`: 統合ブランチ
- `feature/*`: 機能開発
- `fix/*`: バグ修正
- `chore/*`: 雑務・保守

## コミット規約

Conventional Commits に従う。

```
feat: 新機能
fix: バグ修正
refactor: リファクタリング
docs: ドキュメント
chore: 雑務
test: テスト関連
ci: CI/CD 関連
build: ビルド関連
```

commitlint と husky で自動検証される。

## 開発コマンド

```bash
pnpm dev              # 開発サーバー起動
pnpm build            # 本番ビルド
pnpm lint             # ESLint
pnpm lint:fix         # ESLint 自動修正
pnpm format           # Prettier フォーマット
pnpm format:check     # Prettier フォーマット確認
pnpm typecheck        # TypeScript 型チェック
pnpm test:e2e         # E2E テスト
pnpm test:e2e:coverage # E2E テスト＋カバレッジ
pnpm analyze          # Bundle 分析
pnpm storybook        # Storybook 起動
pnpm generate:api-types # OpenAPI 型生成
```

## PR 手順

1. `develop` から作業ブランチを作成
2. 変更をコミット（1 コミット 1 関心事）
3. ローカルで以下をパスさせる
   - `pnpm lint`
   - `pnpm format:check`
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpm test:e2e`（E2E に影響する変更の場合）
4. `develop` へ PR を作成
5. PR テンプレートに従い、変更内容・影響範囲・スクショを記載

## レビュー指針

- Server/Client 境界を意識する
- 状態管理は Server 側は TanStack Query、Client 側は Zustand を基本とする
- 機密情報は `.env.local` に保持し、コミットしない
- E2E テストに影響する変更はテストを追加・更新する
- 新規 UI コンポーネントには `e2e/testids.ts` で定義された `data-testid` を付与する
- 状態を変更する Route Handler (`POST`/`PUT`/`PATCH`/`DELETE`) には CSRF トークン検証を入れる
- 新規ページは `pnpm exec playwright test e2e/specs/accessibility.spec.ts` でアクセシビリティ違反がないことを確認する
