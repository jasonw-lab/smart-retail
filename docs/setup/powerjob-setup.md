# PowerJob セットアップガイド

## 概要

Smart Retail システムでは、PowerJob を外部世界シミュレーターとして使用します。
このガイドでは、PowerJob Server と Worker のセットアップ手順を説明します。

## アーキテクチャ

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   PowerJob Server           │     │   Smart Retail Backend      │
│   (管理UI: localhost:7700)  │     │   (localhost:8989)          │
└─────────────┬───────────────┘     └─────────────────────────────┘
              │                                    ▲
              │ ジョブ配信                          │ HTTP API
              ▼                                    │
┌─────────────────────────────┐                   │
│   PowerJob Worker           │───────────────────┘
│   (Simulator App)           │
│   - HeartbeatJob            │
│   - PaymentJob              │
│   - DeviceFailureJob        │
└─────────────────────────────┘
```

## 前提条件

- Docker / Docker Compose
- Java 17+
- Maven 3.8+
- MySQL 8.0+ (既存の youlai-mysql を使用)

## セットアップ手順

### 1. PowerJob データベース作成

```bash
# MySQLに接続
mysql -h localhost -P 3306 -u root -p

# データベース作成
CREATE DATABASE IF NOT EXISTS powerjob
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;
```

### 2. PowerJob Server 起動

```bash
cd apps/backend/docker

# 環境変数ファイルの確認
cp .env.example .env
# .env ファイルの MYSQL_ROOT_PASSWORD を設定

# PowerJob Server を含む全サービス起動
docker compose -f docker-compose-env.yml up -d powerjob-server

# ログ確認
docker logs -f youlai-powerjob-server
```

### 3. PowerJob 管理UI アクセス

ブラウザで http://localhost:7700 にアクセス

**初回ログイン情報:**
- ユーザー名: `admin`
- パスワード: `admin`

### 4. アプリケーション登録

1. 管理UIにログイン
2. 「应用管理」（アプリ管理）をクリック
3. 「新建应用」（新規アプリ）をクリック
4. 以下を入力:
   - 应用名称: `smart-retail-simulator`
   - 应用密码: (123456)
5. 保存

### 5. Simulator Worker 起動

```bash
cd apps/simulator

# ビルド
mvn clean package -DskipTests

# 起動（開発環境）
mvn spring-boot:run

# または JAR で起動
java -jar target/simulator-1.0.0-SNAPSHOT.jar
```

### 6. Worker 接続確認

1. 管理UIの「首页」（ホーム）を確認
2. 「机器列表」（マシン一覧）に Worker が表示されていることを確認

## ジョブ登録

### サンプルジョブ（動作確認用）

1. 管理UIで「任务管理」（タスク管理）をクリック
2. 「新建任务」（新規タスク）をクリック
3. 以下を入力:
   - 任务名称: `SampleJob`
   - 任务描述: `動作確認用サンプルジョブ`
   - 执行类型: `单机执行` (STANDALONE)
   - 处理器类型: `内置处理器` (BUILT_IN)
   - 处理器信息: `com.smartretail.simulator.job.SampleJob`
   - 定时类型: `CRON`
   - CRON表达式: `0 */5 * * * ?` (5分毎)
4. 保存して有効化

## 環境変数

### Simulator Worker

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `POWERJOB_SERVER_ADDRESS` | `127.0.0.1:7700` | PowerJob Server アドレス |
| `RETAIL_BACKEND_URL` | `http://localhost:8989` | Backend API URL |
| `RETAIL_API_TOKEN` | (空) | Backend API 認証トークン |

### Docker環境での接続

Docker ネットワーク内では、コンテナ名で接続できます：

```yaml
# application.yml (Docker環境用)
powerjob:
  worker:
    server-address: youlai-powerjob-server:7700

retail:
  backend:
    base-url: http://youlai-retail-app:8989
```

## トラブルシューティング

### Worker が Server に接続できない

1. PowerJob Server が起動しているか確認
   ```bash
   docker ps | grep powerjob
   ```

2. ネットワーク接続を確認
   ```bash
   curl http://localhost:7700
   ```

3. Worker のログを確認
   ```bash
   # 開発環境
   tail -f apps/simulator/logs/simulator.log
   ```

### ジョブが実行されない

1. アプリ名が一致しているか確認
   - 管理UIのアプリ名: `smart-retail-simulator`
   - application.yml の `powerjob.worker.app-name`: `smart-retail-simulator`

2. ジョブが有効化されているか確認

3. CRON式が正しいか確認

## 参照

- [PowerJob 公式ドキュメント](https://www.yuque.com/powerjob/guidence)
- [ADR-004: PowerJob External World Simulator](../adr/ADR-004-PowerJob-External-World-Simulator-FULL.md)
- [Issue #39: PowerJob Server / Worker 環境構築](https://github.com/jasonw-lab/smart-retail/issues/39)
