-- ===========================
-- Smart Retail v0.3
-- テーブル定義のみ（デモデータなし）
-- ===========================
use youlai_boot;

-- ----------------------------
-- Table structure for retail_store
-- ----------------------------
DROP TABLE IF EXISTS `retail_store`;
CREATE TABLE `retail_store` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '店舗ID',
  `store_code` varchar(20) NOT NULL COMMENT '店舗コード',
  `store_name` varchar(100) NOT NULL COMMENT '店舗名',
  `address` varchar(255) DEFAULT NULL COMMENT '住所',
  `phone` varchar(20) DEFAULT NULL COMMENT '電話番号',
  `manager` varchar(50) DEFAULT NULL COMMENT '店長名',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active, inactive）',
  `opening_hours` varchar(100) DEFAULT NULL COMMENT '営業時間',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_code` (`store_code`) COMMENT '店舗コードはユニーク'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店舗マスタ';

-- ----------------------------
-- Table structure for retail_product
-- ----------------------------
DROP TABLE IF EXISTS `retail_product`;
CREATE TABLE `retail_product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `product_code` varchar(30) NOT NULL COMMENT '商品コード',
  `product_name` varchar(100) NOT NULL COMMENT '商品名',
  `barcode` varchar(50) DEFAULT NULL COMMENT 'バーコード',
  `category_id` bigint DEFAULT NULL COMMENT 'カテゴリID',
  `category_name` varchar(50) DEFAULT NULL COMMENT 'カテゴリ名',
  `unit_price` decimal(10,2) NOT NULL COMMENT '販売価格',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '原価',
  `unit` varchar(20) DEFAULT NULL COMMENT '単位（個、kg等）',
  `shelf_life_days` int DEFAULT NULL COMMENT '賞味期限（日数）',
  `supplier_id` bigint DEFAULT NULL COMMENT '仕入先ID',
  `supplier_name` varchar(100) DEFAULT NULL COMMENT '仕入先名',
  `description` varchar(500) DEFAULT NULL COMMENT '商品説明',
  `image_url` varchar(255) DEFAULT NULL COMMENT '商品画像URL',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active, inactive）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_code` (`product_code`) COMMENT '商品コードはユニーク',
  KEY `idx_category_id` (`category_id`),
  KEY `idx_supplier_id` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品マスタ';

-- ----------------------------
-- Table structure for retail_inventory
-- ----------------------------
DROP TABLE IF EXISTS `retail_inventory`;
CREATE TABLE `retail_inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '在庫ID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `quantity` int NOT NULL DEFAULT '0' COMMENT '在庫数量',
  `min_stock` int DEFAULT '0' COMMENT '最小在庫数（発注点）',
  `max_stock` int DEFAULT '0' COMMENT '最大在庫数',
  `expiry_date` date DEFAULT NULL COMMENT '賞味期限',
  `location` varchar(50) DEFAULT NULL COMMENT '保管場所',
  `status` varchar(20) DEFAULT 'normal' COMMENT '在庫状態（low, normal, high, expired）',
  `last_count_date` datetime DEFAULT NULL COMMENT '最終棚卸日',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_product_lot` (`store_id`,`product_id`,`lot_number`) COMMENT '店舗と商品とロット番号の組み合わせはユニーク',
  KEY `idx_store_id` (`store_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expiry_date` (`expiry_date`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_inventory_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在庫テーブル';

-- ----------------------------
-- Table structure for retail_inventory_transaction
-- ----------------------------
DROP TABLE IF EXISTS `retail_inventory_transaction`;
CREATE TABLE `retail_inventory_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '入出庫ID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `transaction_type` enum('IN','OUT','SALE','ADJUST') NOT NULL COMMENT '操作タイプ',
  `quantity` int NOT NULL COMMENT '数量',
  `transaction_date` datetime NOT NULL COMMENT '操作日時',
  `expiry_date` date DEFAULT NULL COMMENT '賞味期限',
  `status` varchar(20) NOT NULL COMMENT '状態（処理中, 完了）',
  `reason` varchar(50) DEFAULT NULL COMMENT '理由（仕入れ, 返品, 廃棄, 販売, 移動等）',
  `reference_no` varchar(50) DEFAULT NULL COMMENT '参照番号（発注番号, 販売番号等）',
  `source_dest` varchar(100) DEFAULT NULL COMMENT '移動元/移動先',
  `operator` varchar(50) DEFAULT NULL COMMENT '担当者',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_lot_number` (`lot_number`),
  CONSTRAINT `fk_transaction_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_transaction_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`),
  CONSTRAINT `chk_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入出庫履歴テーブル';

-- ----------------------------
-- Table structure for retail_alert
-- ----------------------------
DROP TABLE IF EXISTS `retail_alert`;
CREATE TABLE `retail_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'アラートID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `alert_type` enum('LOW_STOCK','EXPIRED') NOT NULL COMMENT 'アラートタイプ',
  `alert_message` varchar(255) DEFAULT NULL COMMENT 'アラートメッセージ',
  `alert_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'アラート日時',
  `resolved` tinyint(1) DEFAULT '0' COMMENT '解決フラグ',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_resolved` (`resolved`),
  KEY `idx_alert_date` (`alert_date`),
  CONSTRAINT `fk_alert_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_alert_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='アラートテーブル';

-- ----------------------------
-- Table structure for retail_sales
-- ----------------------------
DROP TABLE IF EXISTS `retail_sales`;
CREATE TABLE `retail_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上ID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `order_number` varchar(50) NOT NULL COMMENT '注文番号',
  `total_amount` decimal(10,2) NOT NULL COMMENT '合計金額',
  `payment_method` enum('CASH','CARD','QR','OTHER') NOT NULL COMMENT '支払方法',
  `payment_provider` varchar(50) DEFAULT NULL COMMENT '決済プロバイダ',
  `payment_reference_id` varchar(100) DEFAULT NULL COMMENT '決済参照ID',
  `sale_timestamp` datetime NOT NULL COMMENT '売上日時',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`) COMMENT '注文番号はユニーク',
  KEY `idx_store_id` (`store_id`),
  KEY `idx_sale_timestamp` (`sale_timestamp`),
  CONSTRAINT `fk_sales_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上ヘッダテーブル';

-- ----------------------------
-- Table structure for retail_sales_detail
-- ----------------------------
DROP TABLE IF EXISTS `retail_sales_detail`;
CREATE TABLE `retail_sales_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上明細ID',
  `sales_id` bigint NOT NULL COMMENT '売上ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `quantity` int NOT NULL COMMENT '数量',
  `unit_price` decimal(10,2) NOT NULL COMMENT '単価',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小計',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_sales_detail_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_sales_detail_sales` FOREIGN KEY (`sales_id`) REFERENCES `retail_sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上明細テーブル';

-- ----------------------------
-- Table structure for retail_category
-- ----------------------------
DROP TABLE IF EXISTS `retail_category`;
CREATE TABLE `retail_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'カテゴリID',
  `category_code` varchar(20) NOT NULL COMMENT 'カテゴリコード',
  `category_name` varchar(50) NOT NULL COMMENT 'カテゴリ名',
  `parent_id` bigint DEFAULT NULL COMMENT '親カテゴリID',
  `sort_order` int DEFAULT '0' COMMENT '表示順序',
  `description` varchar(255) DEFAULT NULL COMMENT '説明',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active, inactive）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`category_code`) COMMENT 'カテゴリコードはユニーク',
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='カテゴリマスタ';
