# AGENTS.md

> 本ファイルの共通ルールは [`rule.md`](./rule.md) に集約しています。併せて参照してください。

本ファイルは SmartRetail Pro プロジェクトの AI コーディングエージェント向けガイドです。
プロジェクト固有の詳細は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## リモートデプロイ運用（Mac -> Ubuntu）

本プロジェクトは Docker Context + SSH を使い、Mac から Ubuntu サーバー（`192.168.1.199`）へリモートデプロイする運用を前提としています。

### 必須 `.env` 変数（`platform/docker/.env`）

```bash
# SSH / Docker Context 用
SERVER_IP=192.168.1.199
SSH_USER=noah
SSH_PASSWORD=<SSH パスワード>

# アプリ接続用
MYSQL_DATABASE=smart_dx_db
DATASOURCE_PASSWORD=<DB パスワード>
REDIS_PASSWORD=<Redis パスワード>
```

`.env` は `.gitignore` に登録済み。テンプレートは `platform/docker/.env.example` を参照。

### ワンタイムセットアップ

初回のみ `platform/docker/setup-remote.sh` を実行。

```bash
cd platform/docker
./setup-remote.sh
```

これにより以下が完了する。

- `~/.ssh/id_ed25519` の生成（未作成時）
- パスワードレス SSH の確立（初回のみ `SSH_PASSWORD` を使用）
- Docker context `ubuntu-stag` の作成
- リモート Docker デーモン動作確認

### 日常運用コマンド（`platform/docker/Makefile`）

```bash
make deploy      # backend をリモートへビルド＆デプロイ
make fe          # frontend をサーバー上でビルド＆配置
make deploy fe   # backend + frontend の両方をデプロイ
make logs        # リモートコンテナログ
make ps          # リモートコンテナ状態
make down        # リモートコンテナ停止
make local       # Docker context を default に戻す
```

### 重要な運用ルール

1. **frontend は rsync 禁止、サーバー上でビルドする**
   - `apps/frontend/dist/` をローカルから rsync しない
   - 必ず `make fe` またはサーバー上の `~/smart-retail-dx/front.sh` を実行してサーバー側でビルド
   - 成果物は `/mydata2/nginx/html/retail/` に配置される

2. **backend は Docker Context 経由ではなくサーバー上で直接ビルド**
   - `mvn dependency:go-offline` が長時間かかり、SSH 経由の Docker Context では接続が切断されるため
   - 実際のビルド・デプロイはリモートの `~/smart-retail-dx/platform/docker/` 上で実行

3. **`apps/backend` はローカルではシンボリックリンク**
   - 実体は `smart-dx-backend/apps/backend/`
   - サーバーへ同期する際はリンク先の実ファイルを展開すること

4. **nginx upstream は `smart-dx-backend:8080` を参照**
   - `/mydata2/nginx/conf/conf.d/default.conf` の `proxy_pass` を確認
   - 旧名 `smart-retail-backend:8989` への参照はエラーの原因となる

### サーバー側の重要パス

| 用途 | パス |
|------|------|
| プロジェクトコード | `~/smart-retail-dx/` |
| frontend build 成果物 | `/mydata2/nginx/html/retail/` |
| nginx 設定 | `/mydata2/nginx/conf/conf.d/default.conf` |
| frontend 用 `.env.prod` | `/mydata2/nginx/apps-env/mall-retail/platform/docker/.env.prod` |
| BASEPATH | `/mydata2` |

### トラブルシューティング

- **`/retail/#/dashboard` で 500**
  - `/mydata2/nginx/html/retail/` に `index.html` があるか確認
  - nginx upstream が `smart-dx-backend:8080` になっているか確認
  - `ec-demo-nginx` が `Restarting` になっていないか確認

- **`smart-dx-backend` が `unhealthy`**
  - `docker logs smart-dx-backend` で SQL エラーを確認
  - `MYSQL_DATABASE` が `smart_dx_db` になっているか確認
  - `youlai_boot` ではなく `smart_dx_db` を使用すること

- **SSH 接続が不安定**
  - `~/.ssh/config` に `ServerAliveInterval` / `ServerAliveCountMax` を設定
  - 長時間のビルドは `nohup` + ログ監視で実行

### 備考

- backend コンテナ名・サービス名は `smart-dx-backend`（旧 `smart-retail-backend` から変更済み）
- backend ポートは `8080`
- frontend 用 API パスは `/prod-api/`
- DB は `smart_dx_db`（マルチテナント対応済み）


## バックエンド E2E テスト（ローカル）

実体リポジトリ `smart-dx-backend` 上で実行する。Testcontainers（MySQL 8.0 / Redis 7）を使用するため、ローカル Docker daemon が動作している必要がある。

### 前提

- Mac では OrbStack を起動しておく
  ```bash
  orb start
  ```
- Linux 等で `/var/run/docker.sock` が存在する環境では `DOCKER_HOST` の指定は不要

### 実行コマンド

```bash
cd smart-dx-backend/apps/backend
export DOCKER_HOST=unix:///Users/wangjw/.orbstack/run/docker.sock
mvn test -pl services/retail-be -Dtest='com.smartdx.retail.e2e.*E2ETest'
```

### 実装上の注意

- `services/retail-be/pom.xml` で Testcontainers のバージョンを Spring Boot BOM の 1.19.8 から 1.20.4 に上書きしている
- Docker 29+ / OrbStack の最小 API バージョン（1.40）対策として、`src/test/resources/docker-java.properties` で `api.version=1.44` を指定している
- E2E 用に Flyway を有効化し、`db/migration/retail` のスキーマを適用している
- `RetailE2EBase` の MySQL/Redis コンテナはシングルトン管理。これによりテストクラス間で Spring のアプリケーションコンテキストキャッシュが正しく機能する
