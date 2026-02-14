# リモート Docker ホストでの PowerJob 修正手順

## 状況

- Docker ホスト: `192.168.1.199`
- Simulator (Worker): ローカル Mac (`192.168.1.193`)
- 問題: PowerJob Server のポート `10010` が expose されていないため、Worker が接続できない

## 修正手順

### 1. リモート Docker ホストに SSH 接続

```bash
ssh user@192.168.1.199
```

### 2. プロジェクトディレクトリに移動

```bash
cd /path/to/mall-retail/apps/backend/docker
```

### 3. docker-compose-env.yml を編集

```bash
vi docker-compose-env.yml
# または
nano docker-compose-env.yml
```

以下のように `powerjob-server` セクションの `ports` を修正：

```yaml
powerjob-server:
  image: powerjob/powerjob-server:latest
  container_name: youlai-powerjob-server
  restart: unless-stopped
  environment:
    TZ: Asia/Tokyo
    JVMOPTIONS: -Xmx512m
    PARAMS: >
      --spring.datasource.core.jdbc-url=jdbc:mysql://mysql:3306/powerjob?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Tokyo
      --spring.datasource.core.username=root
      --spring.datasource.core.password=${MYSQL_ROOT_PASSWORD}
      --oms.storage.dfs.mysql_series.url=jdbc:mysql://mysql:3306/powerjob?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Tokyo
      --oms.storage.dfs.mysql_series.username=root
      --oms.storage.dfs.mysql_series.password=${MYSQL_ROOT_PASSWORD}
  ports:
    - 7700:7700
    - 10086:10086
    - 10010:10010   # 👈 この行を追加
  networks:
    - youlai-boot
  depends_on:
    mysql:
      condition: service_healthy
```

### 4. PowerJob Server を再起動

```bash
docker compose -f docker-compose-env.yml restart powerjob-server
```

### 5. ポートが expose されているか確認

```bash
docker ps | grep powerjob
```

以下のような出力が表示されるはず：

```
CONTAINER ID   IMAGE                            PORTS                                              NAMES
abc123def456   powerjob/powerjob-server:latest  0.0.0.0:7700->7700/tcp,                           youlai-powerjob-server
                                                 0.0.0.0:10010->10010/tcp,
                                                 0.0.0.0:10086->10086/tcp
```

### 6. ポート接続テスト（ローカル Mac から）

```bash
# ローカル Mac のターミナルで実行
nc -zv 192.168.1.199 10010
```

成功時の出力：
```
Connection to 192.168.1.199 port 10010 [tcp/*] succeeded!
```

### 7. PowerJob Server のログ確認

```bash
docker logs -f youlai-powerjob-server
```

エラーがないことを確認。

### 8. ローカル Mac で Simulator を再起動

IntelliJ IDEA で `SimulatorApplication` を再起動。

## ファイアウォール確認（必要に応じて）

リモートホストでファイアウォールが有効な場合、ポート `10010` を開放：

### Ubuntu/Debian (ufw)

```bash
sudo ufw allow 10010/tcp
sudo ufw status
```

### CentOS/RHEL (firewalld)

```bash
sudo firewall-cmd --permanent --add-port=10010/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

## 検証

### 成功時のログ (Simulator)

```
INFO  tech.powerjob.worker.background.WorkerHealthReporter : [WorkerHealthReporter] report health status,appId:1,appName:smart-retail-simulator
```

### エラーが消えることを確認

以下のエラーが **表示されなくなる**：

```
❌ WARN ... ConnectTimeoutException: connection timed out after 3000 ms: /172.18.0.9:10010
```

## トラブルシューティング

### まだ接続できない場合

1. **ネットワーク疎通確認**
   ```bash
   # ローカル Mac から
   ping 192.168.1.199
   telnet 192.168.1.199 7700
   telnet 192.168.1.199 10010
   ```

2. **Docker ネットワーク確認**
   ```bash
   # リモートホストで
   docker network ls
   docker network inspect youlai-boot
   ```

3. **PowerJob Server の設定確認**
   ```bash
   # リモートホストで
   docker exec -it youlai-powerjob-server env | grep PARAMS
   ```

## 代替案: SSH トンネル（一時的な対処）

リモートホストの設定変更が難しい場合、SSH トンネルで一時的に対処可能：

```bash
# ローカル Mac で実行
ssh -L 7700:localhost:7700 -L 10010:localhost:10010 user@192.168.1.199 -N
```

その後、`.env` を以下に変更：
```
POWERJOB_SERVER_ADDRESS=127.0.0.1:7700
```

ただし、この方法は SSH 接続が必要で、本番環境には不向きです。

