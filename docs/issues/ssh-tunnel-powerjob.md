# SSH トンネル経由での PowerJob 接続（一時的な解決策）

## 概要

リモート Docker ホスト (`192.168.1.199`) の設定を変更せずに、SSH トンネルを使って PowerJob に接続する方法です。

## 前提条件

- リモートホスト (`192.168.1.199`) への SSH アクセス権限
- リモートホストで PowerJob Server が起動中
- ローカル Mac から SSH 接続可能

## セットアップ手順

### 1. SSH トンネルを確立

ローカル Mac のターミナルで以下を実行：

```bash
# PowerJob の 3つのポートをトンネリング
ssh -L 7700:localhost:7700 \
    -L 10010:localhost:10010 \
    -L 10086:localhost:10086 \
    user@192.168.1.199 -N
```

**パラメータ説明:**
- `-L 7700:localhost:7700`: ポート 7700 をトンネル（HTTP API）
- `-L 10010:localhost:10010`: ポート 10010 をトンネル（Worker通信）
- `-L 10086:localhost:10086`: ポート 10086 をトンネル（Admin UI）
- `-N`: コマンド実行なし（トンネルのみ）
- `user@192.168.1.199`: リモートホストのユーザー名とアドレス

**注意:** このコマンドは実行中のまま維持してください（Ctrl+C で終了）

### 2. Simulator の設定を変更

`apps/simulator/.env` を編集：

```bash
# PowerJob Worker 設定
POWERJOB_WORKER_ENABLED=true
POWERJOB_SERVER_ADDRESS=127.0.0.1:7700  # localhost に変更
POWERJOB_ALLOW_LAZY_CONNECT=true

# Smart Retail Backend API 設定（必要に応じて）
RETAIL_BACKEND_URL=http://127.0.0.1:8989  # または 192.168.1.199 のまま
RETAIL_API_TOKEN=
```

### 3. 接続テスト

```bash
# ポート疎通確認
nc -zv 127.0.0.1 7700
nc -zv 127.0.0.1 10010
nc -zv 127.0.0.1 10086
```

すべて成功するはず：
```
Connection to 127.0.0.1 port 7700 [tcp/*] succeeded!
Connection to 127.0.0.1 port 10010 [tcp/*] succeeded!
Connection to 127.0.0.1 port 10086 [tcp/*] succeeded!
```

### 4. PowerJob 管理UI アクセス

ブラウザで http://localhost:7700 にアクセス

### 5. Simulator を起動

IntelliJ IDEA で `SimulatorApplication` を実行。

## 自動化（バックグラウンド実行）

SSH トンネルをバックグラウンドで起動：

```bash
# バックグラウンドで実行
ssh -f -N \
    -L 7700:localhost:7700 \
    -L 10010:localhost:10010 \
    -L 10086:localhost:10086 \
    user@192.168.1.199
```

**パラメータ説明:**
- `-f`: バックグラウンド実行
- `-N`: コマンド実行なし

### トンネルの確認

```bash
# SSH プロセス確認
ps aux | grep "ssh.*192.168.1.199"
```

### トンネルの停止

```bash
# プロセスIDを確認
ps aux | grep "ssh.*192.168.1.199" | grep -v grep

# プロセスを終了
kill <PID>
```

## スクリプト化

便利なスクリプトを作成：

```bash
# apps/simulator/tunnel.sh
#!/bin/bash

REMOTE_HOST="192.168.1.199"
REMOTE_USER="user"  # 実際のユーザー名に変更

echo "Starting SSH tunnel to $REMOTE_HOST..."

ssh -f -N \
    -L 7700:localhost:7700 \
    -L 10010:localhost:10010 \
    -L 10086:localhost:10086 \
    $REMOTE_USER@$REMOTE_HOST

if [ $? -eq 0 ]; then
    echo "✅ SSH tunnel established successfully"
    echo "PowerJob UI: http://localhost:7700"
else
    echo "❌ Failed to establish SSH tunnel"
    exit 1
fi
```

実行権限を付与：

```bash
chmod +x apps/simulator/tunnel.sh
```

使用方法：

```bash
# トンネル開始
./apps/simulator/tunnel.sh

# Simulator 起動
cd apps/simulator
mvn spring-boot:run
```

## 注意事項

### メリット
- リモートホストの Docker 設定を変更不要
- すぐに動作確認可能
- 開発環境に適している

### デメリット
- SSH 接続が必須（切断されるとトンネルも切断）
- 本番環境には不向き
- パフォーマンスが若干低下する可能性

### 本番環境への移行

開発が進んだら、**必ずリモートホストで正式にポートを expose** してください：

```yaml
# docker-compose-env.yml (リモートホスト)
powerjob-server:
  ports:
    - 7700:7700
    - 10086:10086
    - 10010:10010  # 追加
```

その後、Simulator の `.env` を元に戻す：

```bash
POWERJOB_SERVER_ADDRESS=192.168.1.199:7700
```

## トラブルシューティング

### "bind: Address already in use" エラー

既にトンネルが起動している可能性があります：

```bash
# 既存のトンネルを確認
lsof -i :7700
lsof -i :10010

# プロセスを終了
kill <PID>
```

### SSH 接続が切れる

自動再接続を設定：

```bash
# ~/.ssh/config に追加
Host powerjob-tunnel
    HostName 192.168.1.199
    User your-username
    LocalForward 7700 localhost:7700
    LocalForward 10010 localhost:10010
    LocalForward 10086 localhost:10086
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

接続方法：

```bash
ssh -N powerjob-tunnel
```

