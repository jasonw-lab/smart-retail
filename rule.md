# プロジェクト共通ルール

本ファイルは `CLAUDE.md` / `AGENTS.md` で共通して適用されるルールを集約したものです。
各ガイドから参照・include してください。

## 無視するフォルダ

`ign_*` にマッチするフォルダはエージェント操作の対象外です。明示的な指示がない限り、内部のファイルを読み取り・変更・参照しないでください。

## Git ワークフロー

- 新しい issue に対応するとき、現在のブランチから対応用ブランチを新規作成する
- Branch: `feature/issue-<number>-<description>`
- PR / MR target: `develop` branch（GitHub PR / GitLab MR。詳細は `AGENTS.md` 参照）
- Commit format: `feat(scope): description (issue-XXX)`

## AIレビュー

- AIレビューを実施した場合、レビュー結果は必ず Markdown ファイル（`*.md`）へ出力する
- 既存のレビュー依頼ファイルがある場合は、そのファイルへ `Codexレビュー結果` などの見出しで追記する
- 新規作成する場合は `review/` 配下に `review_YYYYMMDD_<対象>.codex.md` の形式で保存する

## ドキュメントと HTML の同期ルール

- `docs/deploy/local-ai-dev-auto-reload.md` を修正した際は、必ず対応する HTML（`kb/react/10-cicd-deploy/local-ai-dev-auto-reload.html`、実体: `/Volumes/Dev/Git/learning/kb/react/10-cicd-deploy/`）も同期・更新すること
- AI駆動開発ガイド `ai-dev` の正本は **`kb/workflow/ai-dev.md` と `kb/workflow/ai-dev.html` の2ファイルのみ**（実体: `/Volumes/Dev/Git/learning/kb/workflow/`）。本リポジトリ内にコピーを作らず、参照はこのパスを使うこと。md を更新した際は必ず HTML も同期する
- `ai-common.md` 規約に従い、Knowledge Base は `kb` 配下を参照し、旧称 `ai-asset` は使用しない



## Docker 接続先

本プロジェクトの Docker コンテナから DB、Elasticsearch、Redis、MongoDB へ接続する際は、デプロイ先サーバー `${SERVER_IP}` を参照してください。

- `.env` および `platform/docker/.env` で `SERVER_IP` を設定してください
- SSH 接続情報: `SSH_USER=noah` / `SSH_PASSWORD=pass`
- ローカル開発時は `${SERVER_IP:-localhost}` のデフォルト値により `localhost` が使用されます

## デプロイ先

特に指示がない場合、デフォルトのデプロイは `${SERVER_IP}` のサーバーで実施してください。

- SSH: `ssh ${SSH_USER}@${SERVER_IP}`
- パスワード: `${SSH_PASSWORD}`
- Docker / ミドルウェア接続も `${SERVER_IP}` を参照

---

# backend

## API新規作成
API新規作成時、ビジネスロジックソース及びテストソースを作成してください。
ビジネスロジックソースは下記にある。
(ビジネスロジック以外のソースはアプリ基盤のため、基本変更しないように、変更必要な場合は指示確認)

### 例：代表的なビジネスロジックのソース
- backend/src/main/java/com/youlai/boot/modules/retail
  - controller
  - converter(entity,form,voの変換)
  - mapper
  - model
    - entity
    - form　（更新、追加APIのリクエストパラメータ）
    - query (検索APIのリクエストパラメータ)
    - vo　（検索時のレスポンスパラメータ）
  - service 
  - service/impl

- backend/src/main/resources/mapper/retail (mapperファイル)
- backend/src/test/java/com/youlai/boot/modules/retail
  (テストソース)
　参考：[ProductControllerRestAssuredTest.java](backend/src/test/java/com/youlai/boot/modules/retail/controller/ProductControllerRestAssuredTest.java)

### 参考ソース
ユーザー管理機能のビジネスロジックソース
- [UserPageQuery.java](backend/src/main/java/com/youlai/boot/system/model/query/UserPageQuery.java)
- [User.java](backend/src/main/java/com/youlai/boot/system/model/entity/User.java)
- [UserForm.java](backend/src/main/java/com/youlai/boot/system/model/form/UserForm.java)
- [User.java](backend/src/main/java/com/youlai/boot/system/model/entity/User.java)
- [UserServiceImpl.java](backend/src/main/java/com/youlai/boot/system/service/impl/UserServiceImpl.java)
- [UserService.java](backend/src/main/java/com/youlai/boot/system/service/UserService.java)
- [UserMapper.java](backend/src/main/java/com/youlai/boot/system/mapper/UserMapper.java)
- [UserController.java](backend/src/main/java/com/youlai/boot/system/controller/UserController.java)
- [UserConverter.java](backend/src/main/java/com/youlai/boot/system/converter/UserConverter.java)


## API変更時
API変更時、関連のビジネスロジックソース及びテストソースを変更してください。


## その他
- ソースファイル修正時は上書きでお願いします。
- controllerファイルを作成したら、テストコードも作成してください。

# front
## APIの受信 
- You can @ files here
- APIの受信  
フロント側画面でAPIレスポンスを受信して、画面上にデータ設定するとき、
dataという構造はなしように
 例：
res.data.list → res.list に変更
res.data.total → res.total に変更
