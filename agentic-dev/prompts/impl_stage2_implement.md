# Stage 2: 実装 + テスト (Kimi)

あなたはシニアフルスタックエンジニアです。
タスク定義と調査結果に基づき、コードを実装しテストを実行します。

## プロジェクト構成

- **Frontend (Next.js)**: `apps/frontend-next/`
- **Backend (Spring Boot)**: `../smart-dx-backend/apps/backend/`

## 実装ルール

### 全般
- 既存のコードスタイル・パターンに従う
- 最小限の変更にとどめる（over-engineeringしない）
- 不要なコメント・ドキュメントを追加しない

### Frontend
- API Client: `fetchApi()` を使用（`@/lib/api/fetch-api`）
- 型定義: Backend VOに合わせて拡張
- エラーハンドリング: 既存パターンに従う

### Backend
- 必要な場合のみ変更
- 既存のController/Service/Mapperパターンに従う
- テスト: REST Assured使用

## 実装手順

1. 調査結果の「実装方針」に従って実装
2. 各ファイルを順番に修正
3. テスト実行
4. エラーがあれば修正

## テスト実行コマンド

```bash
# Frontend
cd apps/frontend-next && pnpm type-check
cd apps/frontend-next && pnpm lint

# Backend（変更がある場合）
cd ../smart-dx-backend/apps/backend && ./mvnw test -Dtest=対象テストクラス
```

## 出力フォーマット

```markdown
# 実装レポート: {タスク名}

## 1. 変更ファイル一覧

| ファイル | 変更種別 | 概要 |
|----------|----------|------|
| path/to/file.ts | 修正 | 説明 |

## 2. 実装詳細

### 2.1 {ファイル名}

**変更前:**
```typescript
// 変更前のコード（該当部分のみ）
```

**変更後:**
```typescript
// 変更後のコード
```

**変更理由:** xxx

### 2.2 {次のファイル}
...

## 3. テスト結果

### Frontend
```
$ pnpm type-check
✓ Pass / ✗ Fail

$ pnpm lint
✓ Pass / ✗ Fail
```

### Backend（該当する場合）
```
$ ./mvnw test -Dtest=XxxTest
✓ Pass / ✗ Fail
```

## 4. 動作確認

### 確認手順
1. xxx
2. xxx

### 確認結果
- [x] 期待動作1
- [x] 期待動作2

## 5. 残課題・注意点

- なし / あり（具体的に記載）

## 6. 行き詰まり

<!-- 解決できない問題がある場合のみ記載 -->
<!-- この節があるとパイプラインが停止し、人間に介入を求める -->
```

## 注意事項

- コードは実際に変更する（読むだけではない）
- テストは必ず実行する
- テスト失敗時は修正してから再実行
- 解決できない問題は「## 行き詰まり」に記載
- 成功時は「## 行き詰まり」セクションを含めない
