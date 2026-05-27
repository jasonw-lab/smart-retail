# Review Request: frontend-next 初期実装

## 概要

`apps/frontend-next/` の初期実装が完了しました。
ADR-001〜007に基づくNext.js 15 App Router版フロントエンドのコードレビューをお願いします。

## 実装範囲

### 技術スタック
- Next.js 15.3 + React 19
- TypeScript 5.8 (strict mode)
- Tailwind CSS v4 + shadcn/ui
- TanStack Query v5 + Zustand v5
- React Hook Form v7 + Zod
- @stomp/stompjs（リアルタイム通信）

### 実装機能
1. **認証システム**
   - JWT認証（httpOnly Cookie保存）
   - Route Handler経由のトークンリフレッシュ
   - ログイン/ログアウト

2. **ダッシュボード**
   - KPI表示（Server Component）
   - サイドバー/ヘッダーレイアウト

3. **商品管理**
   - 一覧（ページネーション、検索）
   - 新規作成/編集/削除
   - Server/Client Component分離

4. **アラートシステム**
   - STOMP WebSocket接続
   - 短寿命チケット認証方式
   - リアルタイム受信・表示

## 参照ADR

| ADR | 内容 | 実装ファイル |
|-----|------|-------------|
| ADR-001 | App Router採用 | `app/` 全体 |
| ADR-003 | Server/Client境界 | `features/*/lib/*.server.ts`, `*.client.ts` |
| ADR-004 | UI選定（shadcn/ui） | `components/ui/` |
| ADR-005 | STOMP認証 | `app/api/auth/ws-ticket/`, `features/alerts/hooks/` |
| ADR-007 | 状態管理 | `features/*/hooks/`, `store/` |

## レビュー対象ファイル

### 優先度: 高（設計・セキュリティ）
```
middleware.ts                           # 認証ミドルウェア
lib/api/server.ts                       # Server Component用fetch
lib/api/client.ts                       # Client Component用fetch
app/api/auth/login/route.ts             # ログインAPI
app/api/auth/refresh/route.ts           # トークンリフレッシュ
app/api/auth/ws-ticket/route.ts         # WebSocket接続チケット
app/api/proxy/[...path]/route.ts        # API Proxy
features/alerts/hooks/use-stomp.ts      # STOMP接続管理
```

### 優先度: 中（機能実装）
```
features/products/lib/product-api.server.ts
features/products/lib/product-api.client.ts
features/products/hooks/use-products.ts
features/products/components/product-table-client.tsx
features/products/components/product-form.tsx
features/alerts/components/alert-list-client.tsx
```

### 優先度: 低（UI/設定）
```
app/layout.tsx
app/(dashboard)/layout.tsx
components/layout/sidebar.tsx
components/layout/header.tsx
components/ui/*.tsx
package.json
tsconfig.json
```

## レビュー観点

### 1. ADR準拠
- [ ] Server/Client境界は適切か（ADR-003）
- [ ] API関数の分離パターンは正しいか
- [ ] 状態管理の責務分離は明確か（ADR-007）

### 2. セキュリティ
- [ ] httpOnly Cookie設定は適切か
- [ ] XSS対策（トークン露出）は十分か
- [ ] STOMP接続チケットのTTL/ワンタイム消費は正しく実装されているか
- [ ] CSRF対策は考慮されているか

### 3. パフォーマンス
- [ ] Server Componentの活用は最大化されているか
- [ ] TanStack Queryのキャッシュ戦略は適切か
- [ ] 不要なClient Component化はないか

### 4. エラーハンドリング
- [ ] 401時のリダイレクト処理は適切か
- [ ] API エラー時のユーザーフィードバックは適切か
- [ ] STOMP切断時の再接続ロジックは正しいか

### 5. コード品質
- [ ] 型定義は厳密か
- [ ] 命名規則は一貫しているか
- [ ] 重複コードはないか

## 補足情報

### 動作確認方法
```bash
cd apps/frontend-next
pnpm install
cp .env.example .env.local
# BACKEND_URL を設定
pnpm dev
```

### 未実装（Phase 2予定）
- カテゴリ管理ページ
- 在庫管理ページ
- 売上管理ページ
- E2Eテスト
- CI/CD設定

## 期待するレビュー出力

`review/review_0526_frontend-next-impl.codex.md` に以下の形式で記載をお願いします：

```markdown
### 指摘1. タイトル
YYMMDD HH:MM codex

重大度: High / Medium / Low

対象: `path/to/file:line`

詳細...

推奨:
- ...
```
