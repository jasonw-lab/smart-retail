# SmartRetail Pro - リモート Docker Context デプロイ手順

Mac（Apple Silicon）から Ubuntu サーバーへ Docker Context + SSH を使ってリモートデプロイするための手順です。

## 前提

- ローカル: macOS（Apple Silicon 対応）
- リモート: Ubuntu（x86_64 想定）
- ツール: Docker, SSH, expect

## 1. `.env` の準備

`platform/docker/.env` に以下のデプロイ用変数を追加してください。

```bash
# Remote Deployment
SERVER_IP=<Ubuntu の IP>
SSH_USER=<SSH ユーザー名>
SSH_PASSWORD=<SSH パスワード>
```

`.env` は `.gitignore` に登録済みのため、リポジトリにコミットされることはありません。
テンプレートは `.env.example` を参照してください。

## 2. ワンタイムセットアップ

初回のみ以下を実行してください。冪等なので再実行しても問題ありません。

```bash
cd platform/docker
./setup-remote.sh
```

このスクリプトは以下を行います。

1. `~/.ssh/id_ed25519` が無ければ生成
2. パスワードレス SSH 未設定なら `ssh-copy-id` を `.env` のパスワードで実行（初回のみ）
3. SSH 接続テスト
4. Docker context `ubuntu-stag` を作成
5. リモート Docker 動作確認

パスワードはスクリプト実行中のみメモリ上に保持され、Makefile やスクリプトには残りません。

## 3. 日常運用（Makefile）

```bash
make deploy   # リモートへビルド＆デプロイ
make logs     # リモートコンテナログ
make ps       # リモートコンテナ状態
make down     # リモートコンテナ停止
make local    # Docker context を default に戻す
```

### `make deploy` の挙動

1. Docker context を `ubuntu-stag` に切り替え
2. `DOCKER_DEFAULT_PLATFORM=linux/amd64` を指定して `docker compose up -d --build`
3. 成否に関わらず context を `default` に戻す

Apple Silicon Mac から x86_64 Ubuntu へイメージをビルドするため、`linux/amd64` プラットフォームを強制しています。

## 4. トラブルシューティング

### SSH 接続が通らない

```bash
ssh -o BatchMode=yes ${SSH_USER}@${SERVER_IP}
```

で確認してください。失敗する場合は `setup-remote.sh` を再実行するか、手動で公開鍵を `~/.ssh/authorized_keys` に登録してください。

### Docker context が壊れた

```bash
docker context rm ubuntu-stag
./setup-remote.sh
```

で作り直せます。

### リモート Docker コマンドが動かない

```bash
docker --context ubuntu-stag ps
```

が通るか確認してください。通らない場合、リモートの Docker daemon が起動しているか、ユーザーが docker グループに入っているか確認してください。
