# Claude CLI 開発ガイドライン

## Rate Limit 対策

### 基本原則
- **不要な API 呼び出しを減らす**
  - 同じ情報を何度も取得しない
  - コンテキストを活用して重複した検索を避ける
  - ファイル読み込みは必要な範囲を一度に取得する

- **複数コマンドは並列実行でまとめる**
  - 独立した操作は並列で実行する
  - 複数ファイルの読み込みは一度に行う
  - 依存関係のない検索は同時に実行する

### 実装時の注意点

#### ファイル操作
```bash
# ❌ 避けるべき: 複数回の小さな読み込み
read_file(file1, lines 1-10)
read_file(file1, lines 20-30)
read_file(file1, lines 40-50)

# ✅ 推奨: 一度に必要な範囲を読み込む
read_file(file1, lines 1-50)
```

#### 並列実行
```bash
# ❌ 避けるべき: 順次実行
read_file(file1)
read_file(file2)
read_file(file3)

# ✅ 推奨: 並列実行
read_file(file1) + read_file(file2) + read_file(file3)
```

#### 編集操作
```bash
# ❌ 避けるべき: 単一ファイルの複数回編集
replace_string_in_file(file1, change1)
replace_string_in_file(file1, change2)

# ✅ 推奨: multi_replace_string_in_file で一括編集
multi_replace_string_in_file([change1, change2])
```

## ワークフロー原則

### 不要な確認をなくす
- 実装中は確認を求めない
- 自律的に判断して作業を進める
- ユーザーの意図を推測して最適な実装を行う

### 最終確認のみ
- **実装完了後に最後の確認を行う**
- 完了した内容を簡潔に報告
- 必要に応じて次のステップを提案

## コーディング規約

### ファイル作成・編集
- 必要なファイルのみ作成する
- 大規模な変更は計画的に実行する
- コンテキストを十分に理解してから編集する

### エラー処理
- エラーが発生した場合は自律的に解決を試みる
- 解決できない場合のみユーザーに報告
- 代替案を提示する

### コミュニケーション
- 簡潔で明確な報告
- 技術的な詳細は必要な場合のみ
- 絵文字は使用しない（ユーザー要求がない限り）

## チェックリスト

### 開発開始前
- [ ] 要件を正確に理解する
- [ ] ワークスペース構造を確認する
- [ ] 関連ファイルを特定する

### 実装中
- [ ] 並列実行可能な操作をまとめる
- [ ] 不要な API 呼び出しを避ける
- [ ] 一度に十分なコンテキストを取得する

### 実装完了後
- [ ] 変更内容を確認する
- [ ] テストの必要性を判断する
- [ ] 簡潔な完了報告を行う

## ベストプラクティス

### 効率的な検索
1. `semantic_search`: 概念的な検索に使用
2. `grep_search`: 正確な文字列パターンの検索
3. `file_search`: ファイル名による検索

### 効率的な読み込み
- 大きめの範囲を一度に読む（小刻みな読み込みを避ける）
- 並列で複数ファイルを読む
- grep_search でファイルの概要を把握してから詳細を読む

### 効率的な編集
- `multi_replace_string_in_file` を活用
- 関連する変更を一括で実行
- 十分なコンテキスト（前後3-5行）を含める

## Rate Limit 管理

### API 呼び出し最適化
1. **計画フェーズ**: 最小限の検索で全体像を把握
2. **実装フェーズ**: 並列実行で効率化
3. **検証フェーズ**: 必要な確認のみ実施

### モニタリング
- 不要な重複呼び出しがないか常に意識
- 複数の小さな操作を統合できないか検討
- 効率的なツール選択を心がける

## プロジェクト固有のルール(Smart Retail)

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
- **データ構造の簡潔化**: `res.data.list` → `res.list` に変更
- **ネストの回避**: `res.data.total` → `res.total` に変更
- APIレスポンスの `data` 構造は使用しない

### テスト駆動開発
- テスト配置場所: `backend/src/test/java/com/youlai/boot/modules/retail`
- 参考テスト: `ProductControllerRestAssuredTest.java`
- REST Assured を使用した統合テスト

### 変更影響範囲チェックリスト
- [ ] ビジネスロジック（controller, service, mapper等）
- [ ] MyBatis XML マッパーファイル
- [ ] テストソース
- [ ] フロントエンドAPI呼び出し箇所（影響がある場合）

## Issue対応フロー

### 1. ブランチ作成
```bash
git checkout develop
git checkout -b feature/issue-<番号>-<概要>
```

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

### 6. PR作成（Claude CLI で実行）
```bash
gh pr create --title "feat(scope): description (issue-XXX)" \
  --body "## Summary\n- ...\n\n## Test plan\n- [ ] ..." \
  --base develop
```

### 7. PR承認・マージ（GitHub Web UI で実施）
- **Claude CLI では PR 作成まで**
- 承認・マージは GitHub Web UI で手動実施

### 8. Issue対応完了の記録
- **PR マージ後**、`plan_issue.md` を更新
- 該当 Issue のステータスを「対応完了」に変更
- 完了日時とPR番号を記録

```markdown
## Issue一覧

| Issue番号 | タイトル | ステータス | 担当 | 完了日 | PR |
|----------|---------|----------|------|--------|-----|
| issue-001 | 機能追加 | ✅ 完了 | - | 2026-01-29 | #123 |
```

---

**最終更新**: 2026年1月29日
