# AGENT.md

## 参照ドキュメント

### 要件定義
- `docs/architecture/design/smart-retail-requirements.md`

### 設計書
- `docs/architecture/design/smart-retail-ui-design.md`

### ADR (Architecture Decision Records)
- `docs/adr/`


## プロジェクト固有のルール（Smart Retail）

### アプリケーション基盤の保護
- **既存ソース構造を理解した上で実装を行う**
- **特に理由なければ、アプリ基盤関連のCodeは変更しない**

### 変更可能な範囲
下記のディレクトリは変更可能:
- `backend/src/main/java/com/youlai/boot/modules/retail`
- `backend/src/main/resources/mapper/retail`

**上記以外を変更する場合は、変更理由を確認してから実施すること**

### フロントエンド開発
- **frontendも確認した上で変更を行う**
- バックエンドAPIとの整合性を保つ
- データ構造の変更はフロントエンドへの影響を考慮する

### バックエンドAPI開発フロー
- **API新規作成時**: ビジネスロジックソース + テストソースをセットで作成
- **controller作成時**: 必ずテストコードも作成
- **ソースファイル修正時**: 上書きで対応
- **API変更時**: 関連するビジネスロジック + テストソースも同時更新
- **Author設定**: すべてのJavaファイルの `@author` は `jason.w` とする

### ビジネスロジックの標準構造
```
backend/src/main/java/com/youlai/boot/modules/retail/
├── controller          # REST API エンドポイント
├── converter          # entity, form, vo の変換
├── mapper             # MyBatis マッパーインターフェース
├── model/
│   ├── entity        # データベースエンティティ
│   ├── form          # 更新・追加APIのリクエストパラメータ
│   ├── query         # 検索APIのリクエストパラメータ
│   └── vo            # 検索時のレスポンスパラメータ
├── service            # ビジネスロジックインターフェース
└── service/impl       # ビジネスロジック実装

backend/src/main/resources/mapper/retail/  # MyBatis XML マッパー
backend/src/test/java/com/youlai/boot/modules/retail/  # テストコード
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

### フロントエンド連携ルール
- **API呼び出しの実装方針**: `frontend/src/api/system/user.api.ts` と同じ形式で実装する
  - `request<any, T>({ url, method, params, data })` を使用する（`request.get/post/...` 直呼びは避ける）
  - `@/utils/request` は **成功時に `response.data.data` を返す**（code判定してdataをunwrap）ため、画面側で `res.data...` は参照しない
  - `ApiResponse` のような独自ラッパ型は作らず、**バックエンドの `data` 部分の型**をそのまま `T` にする
- **戻り値の読み方（重要）**
  - `Result<T>`（例: 一覧・詳細）→ フロントが受け取るのは `T`
  - `PageResult<T>`（ページング）→ フロントが受け取るのは `{ list, total }`（= `PageResult.data`）
    - 例: `res.list`, `res.total`（`res.data.list` ではない）
- **型・命名**
  - 画面側は API の返却形に合わせる（`records/current/size` などは使用しない）
  - backend の `productName/unitPrice` 等の命名差は、画面側で必要に応じてマッピングして整合させる

### テスト駆動開発
- テスト配置場所: `backend/src/test/java/com/youlai/boot/modules/retail`
- 参考テスト: `ProductControllerRestAssuredTest.java`
- REST Assured を使用した統合テスト

### 変更影響範囲チェックリスト
- [ ] ビジネスロジック（controller, service, mapper等）
- [ ] MyBatis XML マッパーファイル
- [ ] テストソース
- [ ] フロントエンドAPI呼び出し箇所（影響がある場合）


## 設計変更

設計変更時、設計書の修正履歴も更新する

### レビュー指摘
レビュー時は `{file}_qa.md` に以下の形式で追記
```
## 時間 指摘者： gpt5.2
- Q1
xxxxx
- Q2
```

### レビュー回答
レビュー指摘の対応及び回答時
対象設計書を更新する。
`{file}_qa.md` に以下の形式で追記
```
## 時間 作成担当 claude 4.5
- Q1の回答
xxxxx
```


## Issue対応フロー

### 1. ブランチ作成
- 最新コードは origin/develop を pull 済み
```bash
git fetch origin
```
作業ブランチ: feature/issue-<番号>-<概要>


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

### 6. PR作成（Claude CLI で実行）
```bash
gh pr create --title "[Phase X Backend/Frontend] 機能名" \
  --body "## 概要\nIssue #X の実装\n\n## 実装内容\n- ...\n\nCloses #X" \
  --base develop
```

**重要事項:**
- **PRは必ずdevelopブランチへ提出する**
- PR本文に `Closes #X` を記載してIssueと紐付ける
- PRがマージされると自動的にIssueがcloseされる

### 7. PR承認・マージ（GitHub Web UI で実施）
- **Claude CLI では PR 作成まで**
- 承認・マージは GitHub Web UI で手動実施
- developブランチへマージ後、定期的にmainブランチへリリース

### 8. Issue対応完了の記録
- **PR マージ後**、`plan_issue.md` を更新
- 該当 Issue のステータスを「対応完了」に変更
- 完了日時とPR番号を記録

```markdown
## Issue一覧
docs/issues/plan_issue.md　を参照
| Issue番号 | タイトル | ステータス | 担当 | 完了日 | PR |
|----------|---------|----------|------|--------|-----|
| issue-001 | 機能追加 | ✅ 完了 | - | 2026-01-29 | #123 |
```
