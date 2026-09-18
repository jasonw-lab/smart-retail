# AGENTS.md

> 本ファイルの共通ルールは [`rule.md`](./rule.md) に集約しています。併せて参照してください。

本ファイルは SmartRetail Pro プロジェクトの AI コーディングエージェント向けガイドです。
プロジェクト固有の詳細は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## ディレクトリ制限・対応範囲ルール

> [!CAUTION]
> 以下のディレクトリには厳格なアクセス制限があります。
>
> - `apps/backend-go` : **対応対象外（read・修正ともに厳禁）**
> - `apps/frontend` : **既存 Vue 版（修正・書き込みはNG / 必要な場合の仕様・実装参照（read）のみOK）**

## AI駆動開発（AI-Driven Development）運用ルール

> [!IMPORTANT]
> 本プロジェクトでは、API契約乖離によるランタイムクラッシュ防止とトークン消費最適化のため、以下の開発ルールを必須とします。
> 詳細な背景・ノウハウは **Knowledge Base 側の正本** `{kb}/workflow/ai-dev.md`（HTML版: `{kb}/workflow/ai-dev.html`、実体: `/Volumes/Dev/Git/learning/kb/workflow/`）を参照してください。本リポジトリにはコピーを置きません。

### 1. ランタイムクラッシュ防止の必須ルール

1. **`noUncheckedIndexedAccess: true` の遵守と `as any` の禁止**:
   - `tsconfig.json` で `noUncheckedIndexedAccess: true` を有効化済み。
   - オブジェクトや配列のインデックスアクセス（`obj[key]`, `arr[0]`）は必ず `undefined` の可能性を考慮してオプショナルチェーンやフォールバック（`??`）を設けること。
   - `as any` による型チェック無効化は禁止。
2. **UIマッピングの防御的プログラミング（デフォルトフォールバック）**:
   - Enumやステータスコードをスタイルや文言に変換するマッピング表（`Record`）には、未知のキーが来ても絶対にクラッシュしないよう、必ず `?? DEFAULT_CONFIG` のフォールバックを用意すること。
3. **実バックエンド結合スモークテストの実行（`pnpm test:smoke`）**:
   - 機能追加・修正完了時、モックE2Eテストだけでなく、必ず起動中の実バックエンド（:8080）相手に `pnpm test:smoke` を実行し、**spec に列挙した対象画面**でクラッシュ（`ErrorBoundary` 発火）がないことを確認すること。実行前に `BACKEND_URL` が実APIを指し、ローカルモック認証が無効であることを確認する（接続不可は「環境準備エラー」、未実行は「未検証」と報告し、成功に数えない）。

### 2. トークン消費モニタリングと人間介入基準（Human-in-the-Loop）

次のいずれかに当てはまる場合、**AIは勝手に試行錯誤を続けず、即座に作業を中断して人間に報告・介入を要請してください**（削減効果の数値は未計測のため、目標値としては扱いません）:

- **予算超過**: タスク開始時に決めたトークン予算（既定: 同種タスクの中央値 +10%）を超過した場合。計測できない場合は「不明」と報告し、所要時間と修正回数で判断する。
- **型修正の連鎖ループ**: `noUncheckedIndexedAccess` の型エラーが連鎖し、**同一原因の修正を2回試みても解決しない**場合。
- **環境・インフラ起因のエラー**: 実機スモークテストの失敗原因がDBシードやコンテナ側にあるにもかかわらず、AIがフロントコードを誤修正し始めている場合。
- **仕様の大きな乖離**: APIレスポンス形式が根本から異なり、フロント側で無理なマッピング変換コードを生成し始めている場合。

---

## Git リモート運用方針

GitHub アカウント復旧に伴い、**GitHub (`origin`) を主リモートとして運用** します。
GitLab (`gitlab`) はバックアップおよび GitLab 経由の運用（MR/CI 等）用として維持します。

### リモートリポジトリ構成

- **GitHub (`origin` / 主リモート)**: `git@github.com:jasonw-lab/smart-retail.git`
- **GitLab (`gitlab` / 副リモート)**: `git@gitlab.com:demolist/smart-retail-dx.git`

### 日常の Push & PR / MR ルール

1. **Push 先**: デフォルトは `origin`（GitHub）。
   ```bash
   git push origin <ブランチ名>
   ```
2. **PR 作成（GitHub）**:
   フィーチャーブランチから `develop` への PR を作成する。
   GitHub CLI (`gh`) または Web UI を使用:
   ```bash
   gh pr create --base develop --title "<PRタイトル>" --body "<PR詳細説明>"
   ```
3. **GitLab への同期 / MR 発行（必要な場合）**:
   フィーチャーブランチから `develop` への MR は Git Push Options を使って CLI から直接作成可能:
   ```bash
   git push gitlab <ブランチ名> \
     -o merge_request.create \
     -o merge_request.target=develop \
     -o merge_request.title="<MRタイトル>" \
     -o merge_request.description="<MR詳細説明>"
   ```
4. **承認・マージ**: 人間がレビュー・マージを実施する。

## リモートデプロイ運用（Mac -> Ubuntu）

> [!NOTE]
> **前提条件**: ローカルマシンの搭載メモリが **48GB 未満**（`< 48GB`）の場合、開発リソース確保のため本リモートデプロイ運用（Ubuntu サーバー `192.168.1.199` へのデプロイ）を実施します。  
> 搭載メモリが **48GB 以上** の開発機（本 PC: M5 Mac 64GB）では、後述の [M5 Mac ローカル開発運用（OrbStack Docker 利用）](#m5-mac-ローカル開発運用orbstack-docker-利用) を標準として開発を行います。

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

| 用途                    | パス                                                            |
| ----------------------- | --------------------------------------------------------------- |
| プロジェクトコード      | `~/smart-retail-dx/`                                            |
| frontend build 成果物   | `/mydata2/nginx/html/retail/`                                   |
| nginx 設定              | `/mydata2/nginx/conf/conf.d/default.conf`                       |
| frontend 用 `.env.prod` | `/mydata2/nginx/apps-env/mall-retail/platform/docker/.env.prod` |
| BASEPATH                | `/mydata2`                                                      |

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

## M5 Mac ローカル開発運用（OrbStack Docker 利用）

> [!NOTE]
> **適用基準**: ローカル搭載メモリが **48GB 以上** の開発機（本 PC: M5 Mac 64GB）では、リモート VPS ではなく本セクションの OrbStack ローカルインフラを利用して開発を行います。

M5 Mac (Apple Silicon 64GB) 上の日常開発では、Docker インフラ（MySQL, Redis, PowerJob, OpenSearch）を OrbStack 上で起動し、バックエンド（Spring Boot）やフロントエンド（Vite）は Mac ホスト上で直接起動して接続します。

### 前提と接続先

- **Docker エンジン**: OrbStack
- **BASEPATH**: `/mydata`（`/etc/synthetic.conf` により `{local-path}` へのシンボリックリンクとして設定。VPS と同一パス）
- **接続先（ホストから接続）**:
  | サービス                  | ポート | 接続先 / パラメータ                                                | 備考                                         |
  | ------------------------- | ------ | ------------------------------------------------------------------ | -------------------------------------------- |
  | **MySQL 8.0**             | `3306` | `localhost:3306` (user: `root`, pass: `123456`, db: `smart_dx_db`) | `smart_dx_db`, `powerjob` を自動作成         |
  | **Redis 7.2**             | `6379` | `localhost:6379` (pass: `123456`)                                  | コンテナ名: `smart-dx-redis`                 |
  | **OpenSearch**            | `9200` | `http://localhost:9200`                                            | コンテナ名: `smart-dx-opensearch`            |
  | **OpenSearch Dashboards** | `5601` | `http://localhost:5601`                                            | コンテナ名: `smart-dx-opensearch-dashboards` |
  | **PowerJob Server**       | `7700` | `http://localhost:7700`                                            | シミュレータ用                               |

### ローカル運用コマンド（`platform/docker/Makefile`）

```bash
cd platform/docker

make local-setup     # /mydata 配下のディレクトリ構造・設定初期化 & jason-lab-net ネットワーク作成
make local-env-up    # ローカルインフラ (MySQL, Redis, PowerJob, OpenSearch) を一括起動
make local-env-ps    # コンテナ稼働状態確認
make local-env-logs  # インフラコンテナのログ確認
make local-env-down  # インフラコンテナ停止
```

### ローカルアプリケーション起動

1. **バックエンド (Spring Boot)**

   ```bash
   cd apps/backend  # (または ../smart-dx-backend/apps/backend)
   mvn spring-boot:run -pl app -Dspring-boot.run.profiles=dev
   ```
   - `application.yml` のデフォルトで `localhost:3306` (MySQL) および `localhost:6379` (Redis) に自動接続されます。
   - Flyway により `smart_dx_db` に `retail_*` テーブルが自動作成されます。

2. **フロントエンド (Vite)**  
   ※ `apps/frontend` は既存 Vue 版です（参考・参照用。修正・書き込みはNG）。
   ```bash
   cd apps/frontend
   pnpm dev
   ```
   - `localhost:8080` のバックエンド API にプロキシ接続されます。
