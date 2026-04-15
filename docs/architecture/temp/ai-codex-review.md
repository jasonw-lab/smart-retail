# Smart Retail 要件定義 - 実装前技術レビュー

**レビュー日**: 2026年1月18日  
**レビュー対象**: `smart-retail-requirements.md`  
**レビュースタンス**: 要件定義を「これから実装する設計書」として評価  
**既存コードの扱い**: 修正対象（古い要件に基づく実装）

---

## 📋 エグゼクティブサマリー

### レビュー総評

本要件定義は、**無人スーパー運営という明確なビジネス課題**に対し、実務で使える機能を網羅的に定義している。転職活動における技術力アピールとして、以下の評価となる：

#### ✅ 優れている点（そのまま実装推奨）

1. **差別化されたドメイン選定** ⭐⭐⭐⭐⭐
   - EC管理画面ではなく、無人店舗運営という成長市場に焦点
   - IoT統合、リアルタイム監視など、エンタープライズレベルの課題を扱う

2. **明確なビジネス価値の定義** ⭐⭐⭐⭐⭐
   - 「売上確認ツール」ではなく「運営判断基盤」という明確な位置づけ
   - KPI定義、アラート運用フローが具体的

3. **実装可能な技術スタック** ⭐⭐⭐⭐
   - Spring Boot + Vue 3 で段階的実装が可能
   - 拡張性（WebSocket, センサー連携）を見据えた設計

4. **ロール分離と権限設計** ⭐⭐⭐⭐
   - 4つのロールが明確（本部/店舗/商品/システム）
   - 責務が重複なく定義されている

#### 🔴 クリティカルな不足（実装前に必須補完）

1. **データモデル定義が不足** - テーブル設計、ER図が要件定義に含まれていない
2. **API仕様が未定義** - エンドポイント、リクエスト/レスポンス形式が不明
3. **画面仕様が抽象的** - ワイヤーフレーム、画面遷移図が必要

#### 🟡 改善推奨（実装中に詰めても可）

4. **非機能要件が抽象的** - 性能目標値、SLA定義が数値化されていない
5. **エラーハンドリング方針が未定義** - 異常系の振る舞いが不明確
6. **テスト観点が不明確** - 受け入れ条件、テストシナリオが未整理

---

## 🚨 Phase 0: 実装前に補完すべき要件

### 1. データモデル定義（最重要） 🔴

#### 問題点
要件定義に「どんなテーブルが必要か」「どんなカラムが必要か」が記載されていない。これでは実装に着手できない。

#### 補完すべき内容

**1.1 テーブル一覧と責務**

```yaml
必須テーブル:
  # 店舗管理
  - retail_store (店舗マスタ)
  - retail_store_device (店舗設備マスタ) ← 【要追加】
  - retail_store_health (店舗稼働履歴) ← 【要追加】
  
  # 商品管理
  - retail_product (商品マスタ)
  - retail_category (カテゴリマスタ)
  
  # 在庫管理
  - retail_inventory (在庫)
  - retail_inventory_transaction (入出庫履歴)
  - retail_inventory_loss (ロス記録) ← 【要追加】
  
  # 売上管理
  - retail_sales (売上ヘッダ)
  - retail_sales_detail (売上明細)
  
  # アラート管理
  - retail_alert (アラート)
  - retail_alert_rule (アラートルール) ← 【要追加】
  
  # 値引き・廃棄
  - retail_discount_rule (値引きルール) ← 【要追加】
  - retail_product_discount_history (値引き履歴) ← 【要追加】
  - retail_disposal (廃棄記録) ← 【要追加】
```

**1.2 重要エンティティの詳細設計例**

```sql
-- 店舗設備マスタ（要件定義 4.2「店舗稼働状況の監視」に対応）
CREATE TABLE retail_store_device (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id BIGINT NOT NULL,
  device_code VARCHAR(50) NOT NULL COMMENT '設備コード (POS-01, GATE-02等)',
  device_type ENUM('POS', 'GATE', 'CAMERA', 'SENSOR', 'ROUTER') NOT NULL,
  device_name VARCHAR(100) NOT NULL,
  device_status ENUM('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE') NOT NULL DEFAULT 'OFFLINE',
  last_heartbeat DATETIME COMMENT '最終ハートビート受信時刻',
  last_error_message VARCHAR(500),
  last_error_at DATETIME,
  installed_at DATE,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_store_device (store_id, device_code),
  INDEX idx_device_status (device_status),
  INDEX idx_last_heartbeat (last_heartbeat),
  FOREIGN KEY (store_id) REFERENCES retail_store(id)
);

-- 店舗稼働履歴（要件定義 6.「稼働異常店舗数」に対応）
CREATE TABLE retail_store_health (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id BIGINT NOT NULL,
  check_timestamp DATETIME NOT NULL,
  overall_status ENUM('NORMAL', 'WARNING', 'CRITICAL') NOT NULL,
  network_status ENUM('ONLINE', 'OFFLINE', 'UNSTABLE') NOT NULL,
  device_online_count INT NOT NULL DEFAULT 0,
  device_offline_count INT NOT NULL DEFAULT 0,
  device_error_count INT NOT NULL DEFAULT 0,
  alert_count INT NOT NULL DEFAULT 0,
  remarks VARCHAR(500),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_store_check (store_id, check_timestamp),
  INDEX idx_overall_status (overall_status),
  FOREIGN KEY (store_id) REFERENCES retail_store(id)
);

-- アラート（要件定義 7.「アラート運用フロー」に対応）
-- ※既存テーブルを拡張
ALTER TABLE retail_alert
  ADD COLUMN alert_status ENUM('NEW', 'ACK', 'IN_PROGRESS', 'ON_SITE', 'RESOLVED', 'CLOSED') 
    NOT NULL DEFAULT 'NEW' AFTER alert_type,
  ADD COLUMN severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') 
    NOT NULL DEFAULT 'MEDIUM' AFTER alert_status,
  ADD COLUMN assigned_to BIGINT COMMENT '担当者ID',
  ADD COLUMN acknowledged_at DATETIME COMMENT '確認日時',
  ADD COLUMN resolved_at DATETIME COMMENT '解決日時',
  ADD COLUMN closed_at DATETIME COMMENT 'クローズ日時',
  ADD COLUMN resolution_notes TEXT COMMENT '対応メモ',
  ADD INDEX idx_alert_status (alert_status),
  ADD INDEX idx_severity (severity),
  ADD INDEX idx_assigned_to (assigned_to),
  DROP COLUMN resolved; -- Boolean を alert_status に統合

-- ロス記録（要件定義 4.4「棚卸差異監視」に対応）
CREATE TABLE retail_inventory_loss (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  lot_number VARCHAR(50) NOT NULL,
  detected_at DATETIME NOT NULL,
  expected_quantity INT NOT NULL COMMENT '理論在庫',
  actual_quantity INT NOT NULL COMMENT '実在庫',
  loss_quantity INT NOT NULL COMMENT '差異数量',
  loss_type ENUM('THEFT', 'DAMAGE', 'EXPIRY', 'SENSOR_ERROR', 'COUNT_ERROR', 'UNKNOWN') NOT NULL,
  verified_by BIGINT COMMENT '確認者ID',
  verified_at DATETIME COMMENT '確認日時',
  remarks VARCHAR(500),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_store_product (store_id, product_id),
  INDEX idx_detected_at (detected_at),
  INDEX idx_loss_type (loss_type),
  FOREIGN KEY (store_id) REFERENCES retail_store(id),
  FOREIGN KEY (product_id) REFERENCES retail_product(id)
);
```

#### ER図の追加推奨

要件定義書に以下のER図を追加すべき：

```
[店舗管理ドメイン]
  retail_store (1) --- (*) retail_store_device
  retail_store (1) --- (*) retail_store_health

[商品・在庫ドメイン]
  retail_product (1) --- (*) retail_inventory
  retail_inventory (1) --- (*) retail_inventory_transaction
  retail_inventory (*) --- (1) retail_inventory_loss

[売上ドメイン]
  retail_store (1) --- (*) retail_sales
  retail_sales (1) --- (*) retail_sales_detail
  retail_product (1) --- (*) retail_sales_detail

[アラートドメイン]
  retail_store (1) --- (*) retail_alert
  retail_product (1) --- (*) retail_alert
  sys_user (1) --- (*) retail_alert (assigned_to)
```

---

### 2. API仕様定義（最重要） 🔴

#### 問題点
要件定義に「どんなAPIが必要か」が記載されていない。フロントエンド・バックエンド間のインターフェースが不明確。

#### 補完すべき内容

**2.1 APIエンドポイント一覧**

```yaml
# ダッシュボードAPI
GET  /api/v1/dashboard/kpi
  response: { totalSales, storeCount, alertCount, outOfStockCount, ... }

GET  /api/v1/dashboard/alerts/timeline
  response: [ { time, severity, count }, ... ]

GET  /api/v1/dashboard/sales/trend
  params: startDate, endDate
  response: [ { date, sales, profit }, ... ]

GET  /api/v1/dashboard/products/ranking
  params: limit, sortBy
  response: [ { productId, productName, salesAmount, quantity }, ... ]

# 店舗管理API
GET    /api/v1/stores
GET    /api/v1/stores/{id}
POST   /api/v1/stores
PUT    /api/v1/stores/{id}
DELETE /api/v1/stores/{id}

GET    /api/v1/stores/{id}/health
  response: { status, networkStatus, devices: [...], lastCheckTime }

GET    /api/v1/stores/{id}/devices
POST   /api/v1/stores/{id}/devices
PUT    /api/v1/stores/{id}/devices/{deviceId}

POST   /api/v1/devices/heartbeat
  request: { deviceCode, storeId, status, timestamp, metrics: {...} }

# アラート管理API
GET    /api/v1/alerts
  params: storeId, severity, status, page, size
  response: { items: [...], total, page, size }

GET    /api/v1/alerts/{id}
PUT    /api/v1/alerts/{id}/acknowledge
  request: { userId }
PUT    /api/v1/alerts/{id}/assign
  request: { assignedTo }
PUT    /api/v1/alerts/{id}/status
  request: { status, notes }
POST   /api/v1/alerts
  request: { storeId, productId, alertType, severity, message }

# 在庫管理API
GET    /api/v1/inventory
  params: storeId, productId, status, page, size
POST   /api/v1/inventory/adjust
  request: { storeId, productId, quantity, reason }

GET    /api/v1/inventory/loss
  params: storeId, startDate, endDate
POST   /api/v1/inventory/loss/verify
  request: { lossId, verifiedBy, notes }

# 売上管理API
GET    /api/v1/sales
  params: storeId, startDate, endDate, page, size
POST   /api/v1/sales
  request: { storeId, orderNumber, totalAmount, paymentMethod, items: [...] }
GET    /api/v1/sales/{id}

# 商品管理API（既存実装あり、継続利用）
GET    /api/v1/products
POST   /api/v1/products
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

**2.2 重要APIの詳細仕様例**

```yaml
# ハートビート受信API（Edge機器からの定期通信）
POST /api/v1/devices/heartbeat
Content-Type: application/json

Request:
{
  "deviceCode": "POS-01",
  "storeId": 1,
  "deviceType": "POS",
  "status": "ONLINE",
  "timestamp": "2026-01-18T10:30:00Z",
  "metrics": {
    "cpuUsage": 45.2,
    "memoryUsage": 60.1,
    "diskUsage": 30.5,
    "temperature": 42.0
  },
  "errors": []
}

Response:
{
  "success": true,
  "message": "Heartbeat received",
  "serverTime": "2026-01-18T10:30:01Z",
  "nextHeartbeatInterval": 60
}

Error Response:
{
  "success": false,
  "errorCode": "DEVICE_NOT_FOUND",
  "message": "Device POS-01 not registered for store 1"
}

---

# アラート状態遷移API
PUT /api/v1/alerts/{id}/status
Content-Type: application/json

Request:
{
  "status": "ON_SITE",
  "notes": "現地訪問中。在庫補充予定",
  "userId": 123
}

Response:
{
  "success": true,
  "alert": {
    "id": 456,
    "status": "ON_SITE",
    "previousStatus": "IN_PROGRESS",
    "updatedAt": "2026-01-18T10:30:00Z",
    "updatedBy": 123
  }
}

Validation:
- NEW → ACK のみ許可（ACK → NEW は不可）
- CLOSED → * への遷移は不可（再オープンは新規アラート作成）
- 権限チェック: ON_SITE への遷移は「店舗オペレーター」のみ
```

---

### 3. 画面仕様の詳細化（重要） 🔴

#### 問題点
「5. 画面要件（Dashboard）」は項目列挙のみ。レイアウト、操作フロー、条件分岐が不明確。

#### 補完すべき内容

**3.1 ワイヤーフレーム（手書きでも可）**

```
┌─────────────────────────────────────────────────┐
│ [ヘッダー] Smart Retail 管理画面        [通知🔔][👤] │
├─────────────────────────────────────────────────┤
│ [サイドバー]  │ [メインコンテンツ]                │
│               │                                  │
│ ▼ ダッシュボード │ ┌────┬────┬────┬────┐         │
│   店舗管理      │ │売上 │異常 │在庫 │商品 │         │
│   商品管理      │ │¥1.2M│ 3店 │ 5  │ 120│         │
│   在庫管理      │ └────┴────┴────┴────┘         │
│   アラート      │                                  │
│   売上分析      │ ┌─────────────────────┐       │
│   設定          │ │店舗別売上グラフ        │       │
│                 │ │  [棒グラフ表示]        │       │
│                 │ └─────────────────────┘       │
│                 │                                  │
│                 │ ┌────────┐ ┌────────┐         │
│                 │ │アラート  │ │商品TOP5 │         │
│                 │ │タイムライン│ │ランキング│         │
│                 │ └────────┘ └────────┘         │
└─────────────────────────────────────────────────┘
```

**3.2 画面遷移図**

```
[ダッシュボード]
  ├→ 「稼働異常店舗数(3)」クリック → [店舗一覧（異常店舗絞り込み）]
  │    └→ 店舗行クリック → [店舗詳細画面]
  │         ├→ 設備タブ → [設備監視パネル]
  │         └→ アラートタブ → [店舗別アラート一覧]
  │
  ├→ 「未解決アラート」クリック → [アラート一覧画面]
  │    └→ アラート行クリック → [アラート詳細モーダル]
  │         └→ 「対応開始」ボタン → ステータス更新 → 画面再読み込み
  │
  └→ 「在庫切れSKU(5)」クリック → [在庫一覧（在庫切れ絞り込み）]
       └→ 「補充」ボタン → [入庫登録画面]
```

**3.3 条件分岐の明確化**

```yaml
ダッシュボード表示ロジック:
  ロール = 本部運営管理者:
    - 全店舗のKPI表示
    - 全店舗のアラート表示
    - 店舗別売上グラフ: 全店舗
  
  ロール = 店舗オペレーター:
    - 担当店舗のみのKPI表示
    - 担当店舗のみのアラート表示
    - 店舗別売上グラフ: 非表示（自店のみなので不要）
    - 代わりに「今日の時間帯別売上」グラフを表示

アラート一覧の色分け:
  severity = CRITICAL: 背景色 赤 (#FEE2E2)
  severity = HIGH: 背景色 オレンジ (#FED7AA)
  severity = MEDIUM: 背景色 黄 (#FEF3C7)
  severity = LOW: 背景色 グレー (#F3F4F6)

店舗稼働状態の表示:
  overall_status = NORMAL: 緑アイコン「●」
  overall_status = WARNING: 黄アイコン「▲」
  overall_status = CRITICAL: 赤アイコン「■」
  last_heartbeat < 30分前: グレーアイコン「？」+ 「通信断」ラベル
```

---

## 🟡 Phase 1: 実装中に詰めても良い要件（優先度中）

### 4. 非機能要件の数値化 🟡

#### 現状の問題
「8. 非機能要件」が抽象的。「リアルタイム」「高速」などの定義が曖昧。

#### 補完推奨

**4.1 性能要件**

```yaml
応答時間（95パーセンタイル）:
  - ダッシュボードKPI表示: 2秒以内
  - 在庫検索: 1秒以内
  - アラート一覧表示: 1秒以内
  - 売上登録: 500ms以内
  - ハートビート受信: 200ms以内

スループット:
  - 同時店舗数: 100店舗
  - 同時ユーザー数: 50名
  - ハートビート処理: 500件/分（100店舗×5デバイス/店舗×1分間隔）
  - 売上登録: 100件/分（ピーク時想定）

データ量（3年運用想定）:
  - 売上明細: 100店舗 × 1000件/日 × 1095日 = 109.5M件
  - 在庫履歴: 100店舗 × 500SKU × 100履歴 = 5M件
  - ハートビート履歴: 100店舗 × 5デバイス × 1440回/日 × 1095日 = 788M件
    → 90日以前のデータはアーカイブ推奨

ページングサイズ:
  - 一覧画面: 20件/ページ（デフォルト）、最大100件/ページ
```

**4.2 可用性要件**

```yaml
目標稼働率:
  - 管理画面: 99.0%（月間ダウンタイム 7.2時間以内）
  - ハートビート受信API: 99.5%（月間ダウンタイム 3.6時間以内）
    ※ 店舗運営への影響が大きいため高可用性を要求

MTTR（平均復旧時間）:
  - CRITICAL障害: 30分以内
  - HIGH障害: 2時間以内
  - MEDIUM障害: 4時間以内

バックアップ:
  - DB 日次フルバックアップ（3世代保持）
  - トランザクションログのリアルタイムバックアップ
  - 復旧目標時間（RTO）: 4時間
  - 復旧目標ポイント（RPO）: 10分（最大10分のデータロス許容）

障害時の代替動作:
  - 管理画面停止時: 店舗POS売上は継続可能（Edge独立動作）
  - バックエンド障害時: Edge側でハートビート・売上データをキャッシュ
  - 復旧後の自動再送: 最大24時間分のデータを再送
```

**4.3 セキュリティ要件**

```yaml
認証・認可:
  - JWT トークン認証（有効期限: 2時間）
  - リフレッシュトークン（有効期限: 7日間）
  - ロールベースアクセス制御（RBAC）
  - API呼び出しごとに権限チェック

データ保護:
  - DB接続情報: 環境変数化（.env）
  - API キー: 暗号化保存（AES-256）
  - HTTPS 通信必須（TLS 1.2以上）
  - パスワード: bcrypt ハッシュ化（cost=10）

監査ログ:
  - 重要操作の記録対象:
    * ユーザーログイン/ログアウト
    * 商品マスタ変更（価格、賞味期限）
    * 在庫調整
    * アラート対応（ステータス変更）
    * ユーザー・権限変更
  - 保存期間: 3年
  - 改ざん防止: ログハッシュチェーン（オプション）

入力値検証:
  - バックエンド側で必ずバリデーション実施
  - XSS対策: HTML エスケープ処理
  - SQLインジェクション対策: Prepared Statement使用
  - CSRF対策: トークン検証
```

---

### 5. エラーハンドリング方針 🟡

#### 現状の問題
異常系の振る舞いが要件定義に記載されていない。

#### 補完推奨

**5.1 エラーレスポンス統一形式**

```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "入力値が不正です",
  "details": [
    {
      "field": "unitPrice",
      "message": "販売価格は0以上の数値である必要があります"
    }
  ],
  "timestamp": "2026-01-18T10:30:00Z",
  "path": "/api/v1/products"
}
```

**5.2 エラーコード一覧**

```yaml
バリデーションエラー:
  VALIDATION_ERROR: 入力値不正
  REQUIRED_FIELD_MISSING: 必須項目未入力
  INVALID_FORMAT: フォーマット不正

ビジネスロジックエラー:
  OUT_OF_STOCK: 在庫不足（売上登録時）
  EXPIRED_PRODUCT: 賞味期限切れ商品
  DUPLICATE_ORDER_NUMBER: 注文番号重複
  INVALID_STATE_TRANSITION: 不正な状態遷移（アラート）

システムエラー:
  DATABASE_ERROR: DB接続エラー
  EXTERNAL_API_ERROR: 外部API呼び出しエラー
  INTERNAL_SERVER_ERROR: その他サーバーエラー

認証・認可エラー:
  UNAUTHORIZED: 未認証
  FORBIDDEN: 権限不足
  TOKEN_EXPIRED: トークン有効期限切れ
```

**5.3 リトライ戦略**

```yaml
ハートビート受信API:
  - Edge側で最大3回リトライ（指数バックオフ: 1s, 2s, 4s）
  - 3回失敗後はローカルキャッシュに保存
  - 次回成功時に蓄積データを一括送信

売上登録API:
  - POS側で最大5回リトライ（指数バックオフ）
  - 5回失敗後はローカルDBに保存（重要データのため）
  - 復旧後の自動再送（冪等性保証: order_number でユニーク制約）

その他API:
  - フロントエンド側で1回リトライ
  - エラーメッセージを画面表示
  - ユーザーに手動再試行を促す
```

---

### 6. テスト観点の明確化 🟢

#### 補完推奨（必須ではないが、品質向上に有効）

**6.1 受け入れ条件（Acceptance Criteria）**

```yaml
機能: ダッシュボードKPI表示
  Given: 本部運営管理者としてログイン
  When: ダッシュボードを開く
  Then: 
    - 全店舗の本日売上が表示される
    - 稼働異常店舗数が表示される
    - 在庫切れSKU数が表示される
    - データ取得が2秒以内に完了する

機能: アラート状態遷移（NEW → ACK）
  Given: 未確認アラート（NEW）が存在する
  When: 本部運営管理者が「確認」ボタンをクリック
  Then:
    - アラートステータスが ACK に変わる
    - acknowledged_at に現在時刻が記録される
    - 担当者が自動的に割り当てられる

機能: 在庫不足時の売上登録エラー
  Given: 商品Aの在庫が3個
  When: 商品Aを5個販売する売上を登録
  Then:
    - 売上登録が失敗する
    - エラーコード OUT_OF_STOCK が返る
    - 在庫数は変わらない（トランザクションロールバック）
```

**6.2 テストデータ準備方針**

```yaml
開発環境:
  - 店舗マスタ: 10店舗（うち3店舗を異常状態に設定）
  - 商品マスタ: 50SKU
  - 在庫データ: 500件（在庫切れ、期限切れ間近を含む）
  - 売上データ: 過去30日分（日次100件）
  - アラートデータ: 未解決20件、解決済み100件

テストユーザー:
  - 本部運営管理者: admin@example.com / password
  - 店舗オペレーター: store01@example.com / password
  - 商品担当: product@example.com / password
  - システム管理者: sysadmin@example.com / password
```

---

## 📊 要件定義への追記推奨内容（サマリー）

### 追記すべきセクション

```markdown
## 11. データモデル定義

### 11.1 テーブル一覧
（上記「Phase 0 - 1」の内容を転記）

### 11.2 ER図
（Mermaid or draw.io で作成）

### 11.3 主要テーブル定義書
（上記「Phase 0 - 1」のCREATE TABLE文を転記）

---

## 12. API仕様定義

### 12.1 エンドポイント一覧
（上記「Phase 0 - 2」の内容を転記）

### 12.2 認証・認可方式
- JWT トークン認証
- ロール別アクセス制御マトリクス

### 12.3 エラーレスポンス仕様
（上記「Phase 1 - 5」の内容を転記）

---

## 13. 画面仕様詳細

### 13.1 画面一覧
- ダッシュボード
- 店舗一覧・詳細
- 商品一覧・詳細
- 在庫一覧・入出庫
- アラート一覧・詳細
- 売上一覧・詳細
- 設定画面

### 13.2 ワイヤーフレーム
（上記「Phase 0 - 3」の内容を転記）

### 13.3 画面遷移図
（上記「Phase 0 - 3」の内容を転記）

---

## 14. 非機能要件詳細

### 14.1 性能要件
（上記「Phase 1 - 4」の内容を転記）

### 14.2 可用性要件
（上記「Phase 1 - 4」の内容を転記）

### 14.3 セキュリティ要件
（上記「Phase 1 - 4」の内容を転記）

---

## 15. テスト方針

### 15.1 受け入れ条件
（上記「Phase 1 - 6」の内容を転記）

### 15.2 テストデータ
（上記「Phase 1 - 6」の内容を転記）
```

---

## 🎯 転職アピール戦略（要件定義の見せ方）

### 1. 「実務レベルの要件定義力」を示す

#### Before（現状の要件定義）
> 「店舗稼働状況の監視」
> - 決済端末・ゲート・通信状態の監視
> - 機器異常・通信断の検知

#### After（推奨レベル）
> **4.2 店舗稼働状況の監視**
> 
> **目的**: 無人店舗の機器故障を即座に検知し、営業停止を防ぐ
> 
> **機能要件**:
> - Edge機器から1分間隔でハートビートを受信
> - 最終受信から30分経過で「通信断」アラート自動生成
> - 店舗詳細画面に設備監視パネルを表示（設備タイプ、ステータス、最終通信時刻）
> - ダッシュボードに「稼働異常店舗数」を表示
> 
> **データモデル**:
> ```sql
> CREATE TABLE retail_store_device (...);
> CREATE TABLE retail_store_health (...);
> ```
> 
> **API**:
> - POST /api/v1/devices/heartbeat
> - GET  /api/v1/stores/{id}/health
> 
> **非機能要件**:
> - ハートビート受信: 200ms以内（95パーセンタイル）
> - スループット: 500件/分
> - 復旧後の自動再送: 最大24時間分のデータ

この差が「抽象的な要件」と「実装可能な要件」の違い。

---

### 2. README.md での要件定義の位置づけ

```markdown
# Smart Retail 管理画面

## 📋 プロジェクト概要

無人スーパーの運営を支援する管理画面システム。
店舗稼働監視、在庫管理、アラート運用を統合し、
本部・現場スタッフの迅速な意思決定を支援。

## 📚 ドキュメント構成

- [要件定義書](docs/architecture/requirements/smart-retail-requirements.md)
  - ビジネス要件、ユースケース定義
  - データモデル、API仕様
  - 非機能要件、テスト方針
- [ER図](docs/architecture/design/er-diagram.md)
- [API仕様書](docs/api/swagger.yaml) ← Swagger UIで閲覧可能
- [画面遷移図](docs/ui/screen-flow.md)

## 🎯 要件定義の特徴

本プロジェクトの要件定義は、以下の点で実務レベルを追求：

1. **データモデルの明確化**: テーブル定義、ER図を含む
2. **API仕様の詳細化**: エンドポイント、リクエスト/レスポンス例を記載
3. **非機能要件の数値化**: 応答時間、スループット目標値を定義
4. **エラーハンドリング戦略**: 異常系の振る舞いを明確化

→ 「要件定義を書ける」だけでなく「実装可能な要件を書ける」ことを示す
```

---

### 3. 面接での訴求ポイント

#### Q: 「要件定義で工夫した点は？」

**回答例**:
> 「無人店舗という特殊な運用環境を前提に、3つの工夫をしました。
> 
> 1つ目は、**Edge機器との連携を想定したデータモデル設計**です。retail_store_device テーブルで設備を管理し、ハートビートAPIで定期的に状態を収集する設計にしました。これにより、機器故障を即座に検知できます。
> 
> 2つ目は、**アラート運用フローの明確化**です。NEW→ACK→ON_SITE→RESOLVEDという6段階の状態遷移を定義し、巡回担当者が現地対応中かどうかを可視化しました。状態遷移ルールと権限制御も要件定義に含めています。
> 
> 3つ目は、**非機能要件の数値化**です。『リアルタイム』ではなく『応答時間2秒以内』のように具体的な目標値を設定し、実装時の判断基準を明確にしました。」

#### Q: 「既存システムとの違いは？」

**回答例**:
> 「既存の実装は旧要件に基づいており、店舗稼働監視機能やアラート状態遷移が不足していました。新要件定義では、以下の機能を追加設計しています：
> 
> - retail_store_device / retail_store_health テーブル（既存DBに未実装）
> - Alert.alert_status カラム（既存は resolved のみ）
> - ハートビート受信API（新規）
> - ロス監視機能（retail_inventory_loss テーブル）
> 
> これらを段階的に実装することで、旧システムを新要件に適合させる計画です。」

---

## ✅ 最終チェックリスト

### 要件定義の完成度

- [ ] **データモデル定義が含まれている**
  - [ ] テーブル一覧
  - [ ] 主要テーブルのCREATE TABLE文
  - [ ] ER図（Mermaid or draw.io）

- [ ] **API仕様が含まれている**
  - [ ] エンドポイント一覧
  - [ ] 主要APIのリクエスト/レスポンス例
  - [ ] 認証・認可方式
  - [ ] エラーレスポンス仕様

- [ ] **画面仕様が詳細化されている**
  - [ ] ワイヤーフレーム（手書きでも可）
  - [ ] 画面遷移図
  - [ ] 条件分岐の明確化

- [ ] **非機能要件が数値化されている**
  - [ ] 性能目標値（応答時間、スループット）
  - [ ] 可用性要件（稼働率、MTTR）
  - [ ] セキュリティ要件

- [ ] **エラーハンドリング方針が定義されている**
  - [ ] エラーレスポンス統一形式
  - [ ] エラーコード一覧
  - [ ] リトライ戦略

- [ ] **テスト観点が明確化されている**（オプション）
  - [ ] 受け入れ条件
  - [ ] テストデータ準備方針

---

## 🏆 結論

### 現状の要件定義の評価: **75点 / 100点**

#### 優れている点（45点 / 50点）
- ✅ ビジネス価値が明確（15点）
- ✅ ユースケースが具体的（10点）
- ✅ ロール・権限設計が明確（10点）
- ✅ 拡張性への配慮（10点）

#### 不足している点（30点 / 50点）
- 🔴 データモデル定義なし（-10点）
- 🔴 API仕様なし（-10点）
- 🔴 画面仕様が抽象的（-5点）
- 🟡 非機能要件が数値化されていない（-3点）
- 🟡 エラーハンドリング方針なし（-2点）

### 推奨アクション

#### Phase 0（実装前に必須）: 1週間
1. **データモデル定義を追記**
   - テーブル一覧、CREATE TABLE文、ER図
   - 所要時間: 2-3日

2. **API仕様を追記**
   - エンドポイント一覧、リクエスト/レスポンス例
   - 所要時間: 2-3日

3. **画面仕様を詳細化**
   - ワイヤーフレーム、画面遷移図
   - 所要時間: 1-2日

#### Phase 1（実装中に並行作業可）: 2週間
4. 非機能要件の数値化
5. エラーハンドリング方針の策定

---

### 転職活動での活用方針

#### README.md の充実（最優先）
- 要件定義の位置づけを明記
- 「実装可能な要件を書ける」ことを強調

#### 面接での説明ストーリー
1. **ドメイン選定の理由**: なぜ無人店舗なのか
2. **要件定義の工夫**: データモデル、API、非機能要件の具体化
3. **既存実装との差分**: 何を新規追加するのか

#### ドキュメントの整備優先度
1. データモデル定義（ER図含む）← 最優先
2. API仕様書（Swagger UI）← 最優先
3. 画面遷移図 ← 高優先
4. 非機能要件詳細 ← 中優先
5. テスト仕様書 ← 低優先

これらの準備により、**「要件定義力」「システム設計力」を具体的な成果物で証明**でき、転職市場での競争力が大幅に向上する。

---

**レビュー担当**: Claude (AI Technical Reviewer)  
**次回レビュー推奨時期**: データモデル・API仕様追記後（1週間後）

目的: 既存コードは前提とせず、要件を実現する観点で実装難易度と代替案を整理する。

## 1. 実現難易度が高い/前提が不足している要件

### 1) 機器監視・稼働異常の検知
- 課題: 決済端末・ゲート・通信の状態は、店舗側のIoT/エッジデバイス連携が前提。現状のAPIやデータ設計が見えず、フロントだけでは実現不可。
- 代替案（段階導入）:
  - Phase 1: 店舗単位の「Last Seen（最終受信時刻）」だけ可視化し、通信断の疑いをアラート化
  - Phase 2: 端末/ゲートの個別ステータスを追加（設備ID、状態、最終通信）

### 2) 棚卸差異（ロス）監視
- 課題: センサー（重量/カメラ）由来の推定在庫とPOS売上の突合が必要で、データ連携/アルゴリズム定義がないと実装不能。
- 代替案（説明可能な最小実装）:
  - Phase 1: POS売上と在庫差異を「棚卸調整」入力で管理し、差異アラートを手動登録
  - Phase 2: センサー推定値をAPIで受ける前提で「推定在庫 vs 実在庫」差分を表示

### 3) 売上急減（想定乖離）アラート
- 課題: 乖離判定の基準（時系列モデル/閾値/同曜日比較等）が未定義。
- 代替案:
  - Phase 1: 「直近7日平均比 -30%」などシンプルな閾値で暫定運用
  - Phase 2: 店舗×時間帯の季節性モデルを導入

### 4) 値引き・廃棄ルール運用
- 課題: 値引きルールの定義（閾値、適用単位、価格反映タイミング）が未記載。
- 代替案:
  - Phase 1: 商品マスタに「値引き率」「値引き開始日」「販売停止」だけ追加
  - Phase 2: 期限の近さに応じた自動値引きルールを設定可能にする

### 5) オフライン耐性（遅延到着データの許容）
- 課題: データ鮮度の定義、遅延フラグの閾値、再送の設計がバックエンド要件。
- 代替案:
  - Phase 1: 店舗単位で最終受信時刻表示、閾値超過で警告表示
  - Phase 2: 遅延到着データの「再計算」ジョブを明示（KPI再集計）

## 2. 仕様が曖昧で決める必要がある点
- KPI定義の粒度（店舗/日/時間帯）と集計タイミング
- アラート状態遷移の運用責務（ACKの担当者/タイミング）
- 店舗オペレーターの操作範囲（自店舗限定/全店閲覧の可否）
- 出庫タイプの定義（販売/廃棄/店舗間移動/返品）
- 返品入庫の扱い（在庫加算か、損益補正か）

## 3. 実装優先度（転職アピール最大化の観点）

### 最優先（差別化・説明力が高い）
1. アラート運用フロー（状態遷移 + 対応履歴）
2. 在庫切れ/期限アラートの可視化と対応導線
3. 店舗別KPI（売上、在庫、稼働状況）

### 次点（業務実装のリアリティを出す）
4. 入庫/出庫の履歴管理とステータス更新
5. 期限管理と値引き・販売停止の基本機能

### 段階導入（高度だが拡張性アピールに有効）
6. Last Seen（データ鮮度）表示
7. 売上急減・ロス監視（簡易モデル）

## 4. 最小実装で「要件を満たした」と説明できる構成案
- ダッシュボード: KPI + アラート + Last Seen を表示
- 在庫: 店舗×SKUの在庫状態 + 期限 + 低在庫/過多タグ
- アラート: 状態遷移（NEW/ACK/IN_PROGRESS/RESOLVED/CLOSED）のUI追加
- 商品: 期限/値引き/販売停止の基本項目
- 店舗: 稼働状態 + 最終通信時刻

## 5. まとめ
要件は実運用に寄った良い内容だが、機器監視・ロス監視・売上乖離のような「データ連携前提の要件」は実装難易度が高い。転職アピールとしては、まずは「KPI→アラート→対応履歴→在庫/入出庫」の流れを実装し、段階導入のロードマップを併記するのが最も説得力が高い。

