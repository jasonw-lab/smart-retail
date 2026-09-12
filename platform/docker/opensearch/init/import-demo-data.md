# OpenSearch Demo Data

OpenSearch 類似検索用デモデータの投入手順。

## 前提条件

- OpenSearch 2.19+ が起動していること
- k-NN プラグインが有効であること

## ファイル構成

| ファイル | 説明 |
|---------|------|
| `init-opensearch.sh` | 初期化スクリプト（テンプレート作成・データ投入） |
| `realty-listings-template.json` | インデックステンプレート（k-NN マッピング含む） |
| `realty-listings-demo-bulk.ndjson` | デモデータ（34件、512次元ベクトル付き） |
| `realty-attachment-pipeline.json` | 添付ファイル用パイプライン |

## 使用方法

### 1. OpenSearch へのデモデータ投入

```bash
cd platform/docker/opensearch/init

# 環境変数設定（デフォルト: localhost:9200）
export OPENSEARCH_URL="http://192.168.1.199:9200"

# 初期化実行
./init-opensearch.sh
```

### 2. MySQL への DEMO エンベディング同期

Phase 1 の DEMO 画像検索機能を使用する場合、MySQL の `property_demo_embedding` テーブルにベクトルを同期する。

```bash
cd platform/docker/scripts

# 環境変数設定
export OPENSEARCH_URL="http://192.168.1.199:9200"
export MYSQL_HOST="192.168.1.199"
export MYSQL_PORT="3306"
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_password"
export MYSQL_DATABASE="youlai_boot"

# 同期実行
./seed-demo-embeddings.sh
```

### 3. ベクトル再生成（開発用）

デモデータのベクトルを再生成する場合：

```bash
cd platform/docker/scripts

python generate-demo-vectors.py \
  --input ../opensearch/init/realty-listings-demo-bulk.ndjson \
  --output ../opensearch/init/realty-listings-demo-bulk.ndjson
```

## デモデータ仕様

### 物件データ（34件）

| propertyType | 件数 | ベクトル特性 |
|-------------|------|-------------|
| mansion | 10 | 高層マンション向けクラスタ |
| house | 10 | 戸建住宅向けクラスタ |
| office | 5 | オフィス向けクラスタ |
| retail | 5 | 商業施設向けクラスタ |
| land | 4 | 土地向けクラスタ |

### ベクトル仕様

- 次元数: 512
- 正規化: L2ノルム = 1（コサイン類似度用）
- モデル: `mobilenetv3_small`
- バージョン: `v1`

### DEMO 参照画像（3件）

| demo_ref | propertyType | 説明 |
|----------|-------------|------|
| demo-highrise-001 | mansion | 高層マンション外観 |
| demo-house-001 | house | 戸建住宅外観 |
| demo-commercial-001 | retail | 商業施設外観 |

## k-NN 検索例

```bash
# mansion タイプの物件を基準に類似検索
curl -X POST "$OPENSEARCH_URL/realty-listings/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "size": 5,
    "query": {
      "knn": {
        "feature_vector": {
          "vector": [0.8, 0.2, ...],
          "k": 5
        }
      }
    }
  }'
```

## トラブルシューティング

### k-NN 検索が動作しない

1. k-NN プラグイン確認
   ```bash
   curl "$OPENSEARCH_URL/_cat/plugins?v"
   ```

2. インデックス設定確認
   ```bash
   curl "$OPENSEARCH_URL/realty-listings/_settings?pretty"
   ```

### ベクトルが NULL

`feature_vector` が空の場合、`generate-demo-vectors.py` を再実行してデータを更新する。

## 関連ドキュメント

- [ADR-006: 類似画像検索方式](../../../docs/adr/ADR-006-類似画像検索方式.md)
- [ADR-011: 類似物件検索ストレージ戦略](../../../docs/adr/ADR-011-類似物件検索ストレージ戦略.md)
