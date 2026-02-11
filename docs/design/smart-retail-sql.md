
# Smart Retail DB設計（SQL）v1.0

> **対象範囲**: Phase 1（コア機能）
> **目的**: 在庫（ロット/賞味期限）・アラート（在庫切れ/賞味期限接近/在庫過多）を成立させる最小DB設計

---

## 1. 設計方針

### 1.1 ロット（賞味期限）管理

- 同一SKUでも賞味期限が異なるため、在庫は **ロット単位**で保持する。
- 1在庫レコード = **店舗 × 商品 × ロット**（`store_id`, `product_id`, `lot_number`）
- `expiry_date` はロット単位で保持する。

### 1.2 在庫の引当（減算）

- ロット指定のない出庫（例: POS売上連携）は **FEFO（First-Expire-First-Out）** を基本とする。
- **期限切れロット（`expiry_date < CURRENT_DATE`）はFEFO対象外**とし、引当しない。
- FEFOの同率（同一賞味期限）の場合は `received_at` によるFIFO（先入れ先出し）にフォールバックする。

### 1.3 期限切れ在庫の扱い（Phase 1）

- **定義**: `expiry_date < CURRENT_DATE` のロット（`quantity > 0`）は「期限切れ」とする。
- **FEFO引当**: 期限切れロットは出庫対象外（廃棄または調整で在庫ゼロ化を推奨）。
- **画面表示（I-01）**: 期限切れロットを含むSKUは「🔴期限切れ」状態で表示。
- **アラート**: 期限切れロット検知時にP1優先度で「EXPIRED」アラート生成（Phase 2で検討）。

### 1.4 画面（I-01）向け集約

- 在庫一覧は **SKU単位の集約表示**をデフォルトとし、最古期限は「在庫が残っているロット（`quantity > 0`）の `MIN(expiry_date)`」とする。

---

## 2. DDL（MySQL 8.x想定）

> 文字コード: `utf8mb4` / エンジン: `InnoDB`

### 2.1 店舗（store）

```sql
CREATE TABLE store (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	store_code VARCHAR(50) NOT NULL UNIQUE,
	store_name VARCHAR(200) NOT NULL,
	address VARCHAR(500),
	status ENUM('ONLINE', 'MAINTENANCE', 'OFFLINE') DEFAULT 'ONLINE',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.2 商品（product）

```sql
CREATE TABLE product (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	product_code VARCHAR(50) NOT NULL UNIQUE,
	product_name VARCHAR(200) NOT NULL,
	category VARCHAR(100),
	unit_price INT NOT NULL,
	reorder_point INT NOT NULL DEFAULT 0,
	max_stock INT NOT NULL DEFAULT 0,
	shelf_life INT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.3 在庫（inventory）※ロット管理

```sql
CREATE TABLE inventory (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	store_id BIGINT NOT NULL,
	product_id BIGINT NOT NULL,
	lot_number VARCHAR(50) NOT NULL COMMENT 'ロット番号（推奨: LOT-YYYYMMDD-SEQ形式）',
	expiry_date DATE NOT NULL,
	quantity INT NOT NULL DEFAULT 0,
	received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_inventory_store_product_lot (store_id, product_id, lot_number),
	KEY idx_inventory_store_product (store_id, product_id),
	KEY idx_inventory_fefo (store_id, product_id, expiry_date, received_at),
	CONSTRAINT fk_inventory_store FOREIGN KEY (store_id) REFERENCES store(id),
	CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES product(id),
	CONSTRAINT chk_inventory_quantity CHECK (quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在庫（ロット単位管理）';
```

### 2.4 入出庫履歴（inventory_transaction）

> 画面「履歴」表示・監査・アラート原因追跡のために導入する。

```sql
CREATE TABLE inventory_transaction (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	inventory_id BIGINT NOT NULL,
	store_id BIGINT NOT NULL,
	product_id BIGINT NOT NULL,
	lot_number VARCHAR(50) NOT NULL,
	quantity_delta INT NOT NULL,
	txn_type ENUM('INBOUND', 'SALE', 'ADJUSTMENT', 'DISPOSAL', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
	source_type ENUM('MANUAL', 'POS', 'BATCH') NOT NULL DEFAULT 'MANUAL',
	note VARCHAR(500),
	occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	KEY idx_invtxn_store_product_time (store_id, product_id, occurred_at),
	KEY idx_invtxn_inventory_time (inventory_id, occurred_at),
	CONSTRAINT fk_invtxn_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id),
	CONSTRAINT fk_invtxn_store FOREIGN KEY (store_id) REFERENCES store(id),
	CONSTRAINT fk_invtxn_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.5 デバイス（device）

```sql
CREATE TABLE device (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	store_id BIGINT NOT NULL,
	device_code VARCHAR(50) NOT NULL UNIQUE,
	device_type ENUM('PAYMENT_TERMINAL', 'CAMERA', 'GATE', 'REFRIGERATOR_SENSOR', 'PRINTER', 'NETWORK_ROUTER') NOT NULL,
	device_name VARCHAR(100) NOT NULL,
	status ENUM('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE') DEFAULT 'ONLINE',
	last_heartbeat DATETIME,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_device_store (store_id),
	CONSTRAINT fk_device_store FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.6 アラート（alert）

```sql
CREATE TABLE alert (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
	store_id BIGINT NOT NULL,
	product_id BIGINT,
	device_id BIGINT,
	lot_number VARCHAR(50),
	alert_type ENUM('LOW_STOCK', 'EXPIRY_SOON', 'HIGH_STOCK', 'COMMUNICATION_DOWN', 'PAYMENT_TERMINAL_DOWN') NOT NULL,
	priority ENUM('P1', 'P2', 'P3', 'P4') NOT NULL,
	status ENUM('NEW', 'ACK', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'NEW',
	message VARCHAR(500),
	threshold_value VARCHAR(50),
	current_value VARCHAR(50),
	detected_at DATETIME NOT NULL,
	acknowledged_at DATETIME,
	resolved_at DATETIME,
	closed_at DATETIME,
	resolution_note TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_alert_store_status (store_id, status, detected_at),
	KEY idx_alert_type_priority (alert_type, priority),
	CONSTRAINT fk_alert_store FOREIGN KEY (store_id) REFERENCES store(id),
	CONSTRAINT fk_alert_product FOREIGN KEY (product_id) REFERENCES product(id),
	CONSTRAINT fk_alert_device FOREIGN KEY (device_id) REFERENCES device(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. 主要クエリ（ロット/集約/FEFO）

### 3.1 在庫一覧（I-01）集約（SKU単位）

```sql
SELECT
	i.store_id,
	i.product_id,
	SUM(i.quantity) AS total_quantity,
	MIN(CASE WHEN i.quantity > 0 THEN i.expiry_date ELSE NULL END) AS oldest_expiry_date
FROM inventory i
GROUP BY i.store_id, i.product_id;
```

### 3.2 ロット別明細（展開表示）

```sql
SELECT
	i.lot_number,
	i.expiry_date,
	i.quantity,
	i.received_at
FROM inventory i
WHERE i.store_id = ? AND i.product_id = ?
ORDER BY i.expiry_date ASC, i.received_at ASC;
```

### 3.3 FEFO引当（売上連携などロット未指定の出庫）

```sql
SELECT i.id, i.lot_number, i.quantity
FROM inventory i
WHERE i.store_id = ?
	AND i.product_id = ?
	AND i.quantity > 0
	AND i.expiry_date >= CURRENT_DATE  -- 期限切れを除外
ORDER BY i.expiry_date ASC, i.received_at ASC
LIMIT 1
FOR UPDATE;  -- 排他ロック（並行トランザクション対策）
```

### 3.4 期限切れロット検知（Phase 1）

```sql
SELECT 
	i.store_id,
	i.product_id,
	i.lot_number,
	i.expiry_date,
	i.quantity
FROM inventory i
WHERE i.quantity > 0
	AND i.expiry_date < CURRENT_DATE
ORDER BY i.expiry_date ASC;
```

---

## 4. トランザクション設計（Phase 1）

### 4.1 入庫（INBOUND）トランザクション

```sql
START TRANSACTION;

-- 1. inventory レコードをINSERT/UPDATE
INSERT INTO inventory (store_id, product_id, lot_number, expiry_date, quantity, received_at)
VALUES (?, ?, ?, ?, ?, NOW())
ON DUPLICATE KEY UPDATE 
	quantity = quantity + VALUES(quantity),
	updated_at = NOW();

-- 2. 確定したinventory_idを取得
SET @inventory_id = (SELECT id FROM inventory 
	WHERE store_id = ? AND product_id = ? AND lot_number = ?);

-- 3. 履歴レコード挿入
INSERT INTO inventory_transaction 
	(inventory_id, store_id, product_id, lot_number, quantity_delta, txn_type, source_type, note, occurred_at)
VALUES (@inventory_id, ?, ?, ?, ?, 'INBOUND', 'MANUAL', ?, NOW());

COMMIT;
```

### 4.2 出庫（SALE/DISPOSAL）トランザクション

```sql
START TRANSACTION;

-- 1. FEFO引当（または指定ロット）
SELECT id, lot_number, quantity INTO @inv_id, @lot_num, @current_qty
FROM inventory
WHERE store_id = ? AND product_id = ?
	AND quantity > 0
	AND expiry_date >= CURRENT_DATE
ORDER BY expiry_date ASC, received_at ASC
LIMIT 1
FOR UPDATE;

-- 2. 在庫減算（マイナスチェックはCHECK制約で保証）
UPDATE inventory
SET quantity = quantity - ?, updated_at = NOW()
WHERE id = @inv_id;

-- 3. 履歴レコード挿入
INSERT INTO inventory_transaction
	(inventory_id, store_id, product_id, lot_number, quantity_delta, txn_type, source_type, note, occurred_at)
VALUES (@inv_id, ?, ?, @lot_num, -?, 'SALE', 'POS', ?, NOW());

COMMIT;
```

---

## 5. Phase 2 検討事項

### 5.1 ロット番号の一意性強化

**現状**: 同一 `lot_number` が異なる `expiry_date` で登録可能（人為ミス防止が運用ベース）

**検討案**:
- **Option A**: ロット番号に期限を含める命名規則を強制（例: `LOT-YYYYMMDD-SEQ`）
- **Option B**: アプリケーション層でロット番号重複時に警告表示
- **Option C**: DB層で `UNIQUE KEY (store_id, product_id, lot_number, expiry_date)` に変更

### 5.2 期限切れアラート（EXPIRED）の自動生成

**対象**: `quantity > 0 AND expiry_date < CURRENT_DATE`

**優先度**: P1（緊急対応が必要）

**アラートタイプ**: `EXPIRED`（alert_typeのENUMに追加）

### 5.3 入出庫トランザクションの高度化

- **冪等性**: 同一トランザクションIDでの重複実行防止
- **リトライ**: デッドロック発生時の自動リトライ
- **ロールバック**: 部分失敗時の補償トランザクション

---

## 6. 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v1.0 | 2026-01-31 | ロット（賞味期限）管理、FEFO引当、在庫集約表示向けクエリを追加（Phase 1） |
| v1.1 | 2026-01-31 | Phase 1必須項目追加（期限切れ扱い、CHECK制約、FOR UPDATE、トランザクション設計）、Phase 2検討事項を明記 |

