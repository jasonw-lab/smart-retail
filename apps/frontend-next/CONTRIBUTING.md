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

## i18n の書き方

多言語化（next-intl）は機能単位（1機能＝1コミット）で適用します。

### 1. 基本作法
- **Client Component**: `const t = useTranslations('<namespace>');`
- **Server Component**: `const t = await getTranslations('<namespace>');`
- **メタデータ**: `export async function generateMetadata(): Promise<Metadata> { ... }` 内で `await getTranslations()` を使用
- **ナビゲーション**: `@/i18n/navigation` の `Link`, `useRouter`, `usePathname` を使用（ESLint で強制）
- **辞書ファイル**: `messages/ja.json` と `messages/en.json`。**両方に必ず同一のキー構造を追加する**（値の日本語漏れは禁止）

### 2. Zod スキーマのバリデーションメッセージ（方式 b: スキーマ生成関数）
スキーマ定義では `t` を引数に受け取る生成関数パターンを採用します。

```ts
// features/<domain>/schemas/<domain>-schema.ts
import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationTranslation = ReturnType<typeof useTranslations<'validation'>>;

export const create<Domain>FormSchema = (t: ValidationTranslation) =>
  z.object({
    code: z.string().min(1, t('required')),
    name: z.string().min(1, t('required')).max(100, t('maxLength', { max: 100 })),
    price: z.number().min(0, t('minValue', { min: 0 })),
  });

export type <Domain>FormValues = z.infer<ReturnType<typeof create<Domain>FormSchema>>;
```

Component 側では `useMemo` でスキーマを生成して `zodResolver` に渡します（毎レンダーの再生成を防ぐため `useMemo` 必須）。

```tsx
const tValidation = useTranslations('validation');
const schema = useMemo(() => create<Domain>FormSchema(tValidation), [tValidation]);
const form = useForm<<Domain>FormValues>({ resolver: zodResolver(schema), ... });
```

### 3. validation namespace の共通キー
- `required`: "この項目は必須です" / "This field is required"
- `email`: "有効なメールアドレスを入力してください" / "Please enter a valid email address"
- `minLength`: "{min}文字以上で入力してください" / "Must be at least {min} characters"
- `maxLength`: "{max}文字以内で入力してください" / "Must be at most {max} characters"
- `minValue`: "{min}以上で入力してください" / "Must be at least {min}"
- `invalidUrl`: "有効なURLを入力してください" / "Please enter a valid URL"
- `number`: "数値を入力してください" / "Please enter a number"
- `positive`: "正の数を入力してください" / "Please enter a positive number"

### 4. E2E テストとの整合性
- 既存の E2E spec が `getByText` / `getByRole` / `getByPlaceholder` などでテキスト照合している文字列は、`messages/ja.json` の値を現行表示と完全に一致させること。

