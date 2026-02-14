# Issue: PowerJob Worker Connection Timeout

## 問題

PowerJob Worker (Simulator) が Server に接続時にタイムアウトエラーが発生する。

```
2026-02-14T12:41:36.236+09:00  WARN 70819 --- [smart-retail-simulator] [ntloop-thread-2] t.p.remote.http.vertx.VertxTransporter   : [VertxTransporter] post to url[URL(serverType=SERVER, address=172.18.0.9:10010, location=HandlerLocation(rootPath=server, methodPath=workerHeartbeat))] failed,msg: ConnectTimeoutException: connection timed out after 3000 ms: /172.18.0.9:10010
```

## 原因分析

### 根本原因

1. PowerJob Server が Docker コンテナ内で実行されている
2. Server は内部 Docker IP アドレス `172.18.0.9` を持つ
3. Worker は Server のポート `10010` を使用してハートビートを送信する
4. しかし、`docker-compose-env.yml` でポート `10010` が **expose されていない**
5. ホストマシン (Mac) で動作する Worker は Docker 内部ネットワークにアクセスできない

### PowerJob のポート構成

| ポート | 用途 | 必須 |
|--------|------|------|
| 7700 | HTTP API (Worker登録・ジョブスケジューリング) | ✅ Yes |
| 10086 | 管理UI (Web Console) | ✅ Yes |
| 10010 | Worker-Server 通信 (ハートビート・ステータスレポート) | ✅ **Yes (外部Worker使用時)** |

## 解決方法

### 修正内容

`apps/backend/docker/docker-compose-env.yml` を更新：

```yaml
powerjob-server:
  image: powerjob/powerjob-server:latest
  container_name: youlai-powerjob-server
  restart: unless-stopped
  environment:
    # ... (省略)
  ports:
    - 7700:7700
    - 10086:10086
    - 10010:10010   # 👈 この行を追加
  networks:
    - youlai-boot
```

### 適用手順

1. Docker が起動していることを確認
   ```bash
   docker ps
   ```

2. PowerJob Server を再起動
   ```bash
   cd apps/backend/docker
   docker compose -f docker-compose-env.yml restart powerjob-server
   ```

3. ポートが正しく expose されているか確認
   ```bash
   docker ps | grep powerjob
   ```
   
   出力例：
   ```
   CONTAINER ID   IMAGE                            PORTS
   abc123def456   powerjob/powerjob-server:latest  0.0.0.0:7700->7700/tcp, 
                                                     0.0.0.0:10010->10010/tcp, 
                                                     0.0.0.0:10086->10086/tcp
   ```

4. PowerJob Server のログを確認
   ```bash
   docker logs -f youlai-powerjob-server
   ```

5. Simulator を再起動
   - IntelliJ IDEA で `SimulatorApplication` を再実行

## 検証方法

### 成功時のログ

Worker が正常に接続できると、以下のログが表示される：

```
INFO  tech.powerjob.worker.background.WorkerHealthReporter : [WorkerHealthReporter] report health status,appId:1,appName:smart-retail-simulator,isOverload:false
```

### エラーがなくなることを確認

以下のエラーログが **表示されない** ことを確認：

```
❌ WARN ... ConnectTimeoutException: connection timed out after 3000 ms
```

## 代替案

### Option 1: Host Network Mode (非推奨)

Docker で `network_mode: "host"` を使用：

```yaml
powerjob-server:
  network_mode: "host"
  # ports セクションは削除
```

**欠点:**
- Linux でのみ動作 (Mac/Windows では不可)
- ポートの柔軟性が失われる
- 本番環境には推奨されない

### Option 2: Worker も Docker で実行

Simulator も Docker コンテナ化し、同じ Docker ネットワークで実行：

```yaml
simulator:
  build: ./apps/simulator
  container_name: smart-retail-simulator
  networks:
    - youlai-boot
  environment:
    POWERJOB_SERVER_ADDRESS: youlai-powerjob-server:7700
```

## 参考資料

- [PowerJob セットアップガイド](../setup/powerjob-setup.md)
- [ADR-004: PowerJob External World Simulator](../adr/ADR-004-PowerJob-External-World-Simulator-FULL.md)
- [PowerJob 公式ドキュメント](https://www.yuque.com/powerjob/guidence)

## 関連修正

### ファイル

1. `/apps/backend/docker/docker-compose-env.yml` - ポート 10010 を追加
2. `/docs/setup/powerjob-setup.md` - トラブルシューティングセクションを追加

### 日付

2026-02-14

### 担当者

GitHub Copilot

