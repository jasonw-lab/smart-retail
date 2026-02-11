# AGENT.md

## 参照ドキュメント

### 要件定義
- `docs/architecture/design/smart-retail-requirements.md` - Smart Retail要件定義

### 設計書
- `docs/architecture/design/smart-retail-ui-design.md` - UI設計書
- `docs/architecture/design/smart-retail-ai.md` - AI機能設計
- `docs/architecture/design/smart-retail-sql.md` - データベース設計

### ADR (Architecture Decision Records)
- `docs/adr/` - 技術選定の意思決定記録

### Issue管理
- `docs/issues/plan_issue.md` - Issue一覧とステータス管理
- `docs/issues/` - 個別のIssueファイル

### その他
- `docs/source/code.md` - ソースコード関連ドキュメント


## プロジェクト固有のルール

### 自動実行ルール
- **確認を求めない** - 作業中に確認を求めず自律的に判断して進める
- **常に自動で進める** - 明示的に停止を指示されない限り作業を継続する
- **ユーザー同意を前提とする** - 明示的な拒否がない限りユーザーの同意があるものとして扱う

#### 確認が必要なコマンド

```bash
# ブランチ削除（確認必須）
git branch -d <branch>
git branch -D <branch>
git push origin --delete <branch>
```

### アプリケーション基盤の保護
- **既存ソース構造を理解した上で実装を行う**
- **特に理由なければ、アプリ基盤関連のCodeは変更しない**
- **tempフォルダ配下のドキュメントは無視してよい**（一次保存後で削除予定）

### 変更可能な範囲
下記のディレクトリは変更可能:
- `backend/src/main/java/com/youlai/boot/modules/retail`
- `backend/src/main/resources/mapper/retail`

**上記以外を変更する場合は、変更理由を確認してから実施すること**

### ソースフォルダ構成
**重要**: 各UIベースのソースフォルダ構成は、各UIベース独自の構成に従います。
統一されたpath規約は定めません。各UIベースのベストプラクティスを尊重します。

| プロジェクト | パス | 説明 |
|-------------|------|------|
| Backend API | `backend/` | Java + Spring Boot + MyBatis |
| Frontend UI | `frontend/` | React + TypeScript + Ant Design |

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

## plan作成時
### github issue 作成依頼時
(front,backendのわけ labelつけ、また　phase 1-A, phase1-B など優先度もつけ）


## Issue対応フロー

### 1. ブランチ作成
- 未コミットCodeあれば、一旦待避する　（ユーザーに確認）
- 最新コードは origin/develop を checkout 
```bash
git fetch origin
```
作業ブランチ: feature/issue-<番号>-<概要>
- 未コミットCodeを復帰する


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

**PR本文の形式:**
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

