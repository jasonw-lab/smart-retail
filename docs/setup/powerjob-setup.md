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

#### ローカル Docker の場合

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

#### リモート Docker の場合（例: 192.168.1.199）

```bash
# リモートホストに SSH 接続
ssh user@192.168.1.199

# プロジェクトディレクトリに移動
cd /path/to/mall-retail/apps/backend/docker

# docker-compose-env.yml を編集してポート 10010 を追加
# powerjob-server セクションの ports に以下を追加:
#   - 10010:10010

# PowerJob Server を起動/再起動
docker compose -f docker-compose-env.yml up -d powerjob-server

# ポート確認
docker ps | grep powerjob
# 以下が表示されることを確認:
# 0.0.0.0:7700->7700/tcp, 0.0.0.0:10010->10010/tcp, 0.0.0.0:10086->10086/tcp

# ログ確認
docker logs -f youlai-powerjob-server
```

**重要:** リモート Docker を使用する場合、Simulator の `.env` ファイルで以下を設定：

```bash
# apps/simulator/.env
POWERJOB_SERVER_ADDRESS=192.168.1.199:7700
RETAIL_BACKEND_URL=http://192.168.1.199:8989
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

### Heartbeatシミュレーションジョブ

店舗デバイスのHeartbeatを定期的にBackend APIに送信するジョブです。

1. 管理UIで「任务管理」（タスク管理）をクリック
2. 「新建任务」（新規タスク）をクリック
3. 以下を入力:
   - 任务名称: `HeartbeatSimulatorJob`
   - 任务描述: `店舗デバイス状態をHeartbeatとして送信`
   - 执行类型: `单机执行` (STANDALONE)
   - 处理器类型: `内置处理器` (BUILT_IN)
   - 处理器信息: `com.smartretail.simulator.job.HeartbeatSimulatorJob`
   - 定时类型: `CRON`
   - CRON表达式: `0 */1 * * * ?` (1分毎)
   - 任务参数（オプション）: `1,2` （対象店舗ID、カンマ区切り）
4. 保存して有効化

**生成されるデバイス状態:**
- 決済端末: ONLINE/OFFLINE/ERROR（95%でONLINE）
- プリンター: ONLINE/OFFLINE/ERROR（90%でONLINE）
- 用紙レベル: OK/LOW/EMPTY
- ネットワーク: レイテンシ、信号強度

### 決済シミュレーションジョブ

ランダムな商品・数量・決済手段での売上データを生成しBackend APIに送信するジョブです。

1. 管理UIで「任务管理」（タスク管理）をクリック
2. 「新建任务」（新規タスク）をクリック
3. 以下を入力:
   - 任务名称: `PaymentSimulatorJob`
   - 任务描述: `ランダムな決済データを生成して送信`
   - 执行类型: `单机执行` (STANDALONE)
   - 处理器类型: `内置处理器` (BUILT_IN)
   - 处理器信息: `com.smartretail.simulator.job.PaymentSimulatorJob`
   - 定时类型: `CRON`
   - CRON表达式: `0 */5 * * * ?` (5分毎)
   - 任务参数（オプション）: `1,2` （対象店舗ID、カンマ区切り）
4. 保存して有効化

**生成される決済データ:**
- 決済手段: CASH(30%), CARD(40%), QR(30%)
- 決済プロバイダ: VISA, Mastercard, PayPay, LINE Pay, 楽天ペイ
- 商品数: 1-4商品、各1-3個
- 営業時間考慮: 昼ピーク/ディナーピークは多め、夜間は少なめ

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

## ポート一覧

PowerJob Server は以下のポートを使用します：

| ポート | 用途 | 説明 |
|--------|------|------|
| 7700 | HTTP API | Worker登録・ジョブスケジューリング |
| 10086 | Admin UI | 管理画面（Web UI） |
| 10010 | Worker通信 | Worker-Server間のステータスレポート・ハートビート |

**重要:** 外部ホストから Worker を実行する場合、ポート `10010` を必ず expose してください。

## トラブルシューティング

### Worker が Server に接続できない

1. PowerJob Server が起動しているか確認
   ```bash
   docker ps | grep powerjob
   ```
   
   ポート `7700`, `10086`, `10010` が expose されていることを確認してください。

2. ネットワーク接続を確認
   ```bash
   curl http://localhost:7700
   ```

3. Worker のログを確認
   ```bash
   # 開発環境
   tail -f apps/simulator/logs/simulator.log
   ```

### Connection Timeout エラー (`/172.18.0.9:10010`)

**症状:**
```
ConnectTimeoutException: connection timed out after 3000 ms: /172.18.0.9:10010
```

**原因:** 
- PowerJob Server のポート `10010` が expose されていない
- Docker 内部ネットワーク IP にアクセスできない

**解決方法:**
1. `docker-compose-env.yml` を確認し、以下のポートマッピングがあることを確認：
   ```yaml
   powerjob-server:
     ports:
       - 7700:7700
       - 10086:10086
       - 10010:10010  # この行が必要
   ```

2. PowerJob Server を再起動：
   ```bash
   cd apps/backend/docker
   docker compose -f docker-compose-env.yml restart powerjob-server
   ```

3. ポートが正しく expose されているか確認：
   ```bash
   docker ps | grep powerjob
   # 0.0.0.0:10010->10010/tcp が表示されるはず
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
