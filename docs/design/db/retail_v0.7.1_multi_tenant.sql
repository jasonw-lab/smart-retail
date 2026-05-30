-- ============================================================
-- Smart Retail Database Schema v0.7.1
-- ============================================================
-- 目的: スマートリテールシステムのマルチテナント対応スキーマ定義
-- 対象: Phase 2 マルチテナント対応
--
-- 主要変更点（v0.7 → v0.7.1）:
--   - 複合FK制約追加（テナント整合性保証）
--   - retail_sales_detail に tenant_id 追加
--   - retail_sales.order_number をテナント内一意に変更
--   - 親テーブルに複合UK (tenant_id, id) 追加
--
-- テナント分離方式:
--   - カラム分離（Shared Database, Shared Schema）
--   - MyBatis Plus TenantLineInnerInterceptor で自動分離
--   - 複合FK制約でDB層でもテナント整合性を保証
--
-- 準拠ドキュメント:
--   - smart-retail-multi-tenant.md v1.1
--   - smart-retail-requirements.md v1.1
--   - smart-retail-sql.md v1.0
--
-- 更新履歴:
--   v0.5 (2026-02-14): 設計書レビュー反映
--   v0.6 (2026-02-15): アラートタイプ拡張（沈黙監視対応）
--   v0.7 (2026-05-28): マルチテナント対応
--   v0.7.1 (2026-05-28): Codexレビュー対応
--     - 複合FK制約追加（テナント整合性保証）
--     - retail_sales_detail に tenant_id 追加
--     - retail_sales.order_number をテナント内一意に変更
-- ============================================================

USE smart_dx_db;

-- ============================================================
-- テーブル削除（外部キー制約を考慮した順序）
-- ============================================================
DROP TABLE IF EXISTS `retail_sales_detail`;
DROP TABLE IF EXISTS `retail_sales`;
DROP TABLE IF EXISTS `retail_alert`;
DROP TABLE IF EXISTS `retail_inventory_transaction`;
DROP TABLE IF EXISTS `retail_inventory`;
DROP TABLE IF EXISTS `retail_device`;
DROP TABLE IF EXISTS `retail_product`;
DROP TABLE IF EXISTS `retail_category`;
DROP TABLE IF EXISTS `retail_store`;
DROP TABLE IF EXISTS `retail_tenant`;

-- ============================================================
-- 0. テナントマスタ
-- ============================================================

-- ----------------------------
-- 0.1 テナントマスタ (retail_tenant)
-- ----------------------------
CREATE TABLE `retail_tenant` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'テナントID（主キー）',
  `tenant_code` varchar(50) NOT NULL COMMENT 'テナントコード（一意識別子、例: TENANT001）',
  `tenant_name` varchar(200) NOT NULL COMMENT 'テナント名（企業名・組織名）',
  `contact_email` varchar(255) DEFAULT NULL COMMENT '連絡先メールアドレス',
  `contact_phone` varchar(50) DEFAULT NULL COMMENT '連絡先電話番号',
  `plan_type` enum('FREE','BASIC','STANDARD','ENTERPRISE') NOT NULL DEFAULT 'BASIC' COMMENT 'プランタイプ',
  `max_stores` int NOT NULL DEFAULT 10 COMMENT '最大店舗数',
  `max_users` int NOT NULL DEFAULT 50 COMMENT '最大ユーザー数',
  `status` enum('ACTIVE','SUSPENDED','CANCELLED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'テナント状態',
  `activated_at` datetime DEFAULT NULL COMMENT 'アクティベート日時',
  `expires_at` datetime DEFAULT NULL COMMENT '有効期限',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_code` (`tenant_code`) COMMENT 'テナントコードはユニーク',
  KEY `idx_tenant_status` (`status`) COMMENT 'テナント状態検索用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='テナントマスタ';

-- デフォルトテナント挿入（既存データ互換用）
INSERT INTO `retail_tenant` (
  `id`, `tenant_code`, `tenant_name`, `plan_type`, `status`, `activated_at`
) VALUES (
  1, 'DEFAULT', 'デフォルトテナント', 'ENTERPRISE', 'ACTIVE', NOW()
);

-- ============================================================
-- 1. マスタテーブル
-- ============================================================

-- ----------------------------
-- 1.1 店舗マスタ (retail_store)
-- ----------------------------
-- 変更(v0.7.1): uk_store_tenant_id 追加（複合FK参照用）
-- ----------------------------
CREATE TABLE `retail_store` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '店舗ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_code` varchar(20) NOT NULL COMMENT '店舗コード（テナント内一意、例: ST001）',
  `store_name` varchar(100) NOT NULL COMMENT '店舗名（例: 東京本店）',
  `address` varchar(255) DEFAULT NULL COMMENT '住所',
  `phone` varchar(20) DEFAULT NULL COMMENT '電話番号',
  `manager` varchar(50) DEFAULT NULL COMMENT '店長名',
  `status` enum('ONLINE','MAINTENANCE','OFFLINE') DEFAULT 'ONLINE' COMMENT '状態',
  `opening_hours` varchar(100) DEFAULT NULL COMMENT '営業時間（例: 9:00-21:00）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_tenant_code` (`tenant_id`, `store_code`) COMMENT '店舗コードはテナント内ユニーク',
  UNIQUE KEY `uk_store_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_store_tenant` (`tenant_id`) COMMENT 'テナント別店舗検索用',
  CONSTRAINT `fk_store_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店舗マスタ';

-- ----------------------------
-- 1.2 カテゴリマスタ (retail_category)
-- ----------------------------
CREATE TABLE `retail_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'カテゴリID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `category_code` varchar(20) NOT NULL COMMENT 'カテゴリコード（テナント内一意、例: CAT-001）',
  `category_name` varchar(50) NOT NULL COMMENT 'カテゴリ名（例: 飲料）',
  `parent_id` bigint DEFAULT NULL COMMENT '親カテゴリID（NULLの場合はルートカテゴリ）',
  `sort_order` int DEFAULT '0' COMMENT '表示順序（昇順）',
  `description` varchar(255) DEFAULT NULL COMMENT 'カテゴリ説明',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active: 有効, inactive: 無効）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_tenant_code` (`tenant_id`, `category_code`) COMMENT 'カテゴリコードはテナント内ユニーク',
  UNIQUE KEY `uk_category_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_category_tenant` (`tenant_id`) COMMENT 'テナント別カテゴリ検索用',
  KEY `idx_parent_id` (`parent_id`) COMMENT '親カテゴリ検索用',
  CONSTRAINT `fk_category_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='カテゴリマスタ';

-- ----------------------------
-- 1.3 商品マスタ (retail_product)
-- ----------------------------
-- 変更(v0.7.1): uk_product_tenant_id 追加（複合FK参照用）
-- ----------------------------
CREATE TABLE `retail_product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `product_code` varchar(30) NOT NULL COMMENT '商品コード（テナント内一意、例: PRD-001）',
  `product_name` varchar(100) NOT NULL COMMENT '商品名',
  `barcode` varchar(50) DEFAULT NULL COMMENT 'JANコード等のバーコード',
  `category_id` bigint DEFAULT NULL COMMENT 'カテゴリID（retail_categoryへの外部キー）',
  `category_name` varchar(50) DEFAULT NULL COMMENT 'カテゴリ名（非正規化、検索高速化用）',
  `unit_price` decimal(10,2) NOT NULL COMMENT '販売価格（税込）',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '原価',
  `unit` varchar(20) DEFAULT NULL COMMENT '単位（個、本、kg等）',
  `reorder_point` int NOT NULL DEFAULT 0 COMMENT '発注点（SKU集約在庫がこの値以下でLOW_STOCKアラート）',
  `max_stock` int NOT NULL DEFAULT 0 COMMENT '適正在庫上限（SKU集約在庫がこの値×1.5以上でHIGH_STOCKアラート）',
  `shelf_life_days` int DEFAULT NULL COMMENT '標準賞味期限日数（入庫日からの日数、0またはNULL=賞味期限なし）',
  `supplier_id` bigint DEFAULT NULL COMMENT '仕入先ID',
  `supplier_name` varchar(100) DEFAULT NULL COMMENT '仕入先名（非正規化）',
  `description` varchar(500) DEFAULT NULL COMMENT '商品説明',
  `image_url` varchar(255) DEFAULT NULL COMMENT '商品画像URL',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active: 販売中, inactive: 販売停止）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_tenant_code` (`tenant_id`, `product_code`) COMMENT '商品コードはテナント内ユニーク',
  UNIQUE KEY `uk_product_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_product_tenant` (`tenant_id`) COMMENT 'テナント別商品検索用',
  KEY `idx_category_id` (`category_id`) COMMENT 'カテゴリ検索用',
  KEY `idx_supplier_id` (`supplier_id`) COMMENT '仕入先検索用',
  CONSTRAINT `fk_product_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品マスタ';

-- ============================================================
-- 2. 在庫管理テーブル
-- ============================================================

-- ----------------------------
-- 2.1 在庫テーブル (retail_inventory)
-- ----------------------------
-- 変更(v0.7.1):
--   - uk_inventory_tenant_id 追加（複合FK参照用）
--   - fk_inventory_store, fk_inventory_product を複合FK化
-- ----------------------------
CREATE TABLE `retail_inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '在庫ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号（例: LOT-2026-0101）',
  `quantity` int NOT NULL DEFAULT '0' COMMENT '現在在庫数量',
  `expiry_date` date DEFAULT NULL COMMENT '賞味期限（YYYY-MM-DD、NULLは賞味期限なし商品）',
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入庫日時（FEFO同率時のFIFOフォールバック用）',
  `location` varchar(50) DEFAULT NULL COMMENT '保管場所（例: A-01、冷蔵庫-1）',
  `status` enum('normal','low','high','expired','out_of_stock') DEFAULT 'normal' COMMENT '在庫状態',
  `last_count_date` datetime DEFAULT NULL COMMENT '最終棚卸日時',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_product_lot` (`store_id`,`product_id`,`lot_number`) COMMENT '店舗×商品×ロットの組み合わせはユニーク',
  UNIQUE KEY `uk_inventory_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_inventory_tenant` (`tenant_id`) COMMENT 'テナント別在庫検索用',
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別在庫検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別在庫検索用',
  KEY `idx_status` (`status`) COMMENT '在庫状態検索用',
  KEY `idx_expiry_date` (`expiry_date`) COMMENT '賞味期限検索用',
  KEY `idx_fefo` (`store_id`,`product_id`,`expiry_date`,`received_at`) COMMENT 'FEFO引当クエリ用',
  CONSTRAINT `fk_inventory_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_inventory_store` FOREIGN KEY (`tenant_id`, `store_id`) REFERENCES `retail_store` (`tenant_id`, `id`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `retail_product` (`tenant_id`, `id`),
  CONSTRAINT `chk_inventory_quantity` CHECK (`quantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在庫テーブル（ロット単位管理）';

-- ----------------------------
-- 2.2 入出庫履歴テーブル (retail_inventory_transaction)
-- ----------------------------
-- 変更(v0.7.1): 複合FK化（テナント整合性保証）
-- ----------------------------
CREATE TABLE `retail_inventory_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '入出庫ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `inventory_id` bigint NOT NULL COMMENT '在庫ID（retail_inventoryへの外部キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID（非正規化）',
  `product_id` bigint NOT NULL COMMENT '商品ID（非正規化）',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号（非正規化）',
  `txn_type` enum('INBOUND','SALE','ADJUSTMENT','DISPOSAL','TRANSFER_IN','TRANSFER_OUT') NOT NULL COMMENT '操作タイプ',
  `quantity_delta` int NOT NULL COMMENT '数量変動（正=増加, 負=減少）',
  `source_type` enum('MANUAL','POS','BATCH') NOT NULL DEFAULT 'MANUAL' COMMENT '操作元',
  `reference_no` varchar(100) DEFAULT NULL COMMENT '参照番号（売上ID、発注番号等）',
  `occurred_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作日時',
  `note` varchar(500) DEFAULT NULL COMMENT '備考（理由、移動先等）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_invtxn_tenant` (`tenant_id`) COMMENT 'テナント別履歴検索用',
  KEY `idx_inventory_id` (`inventory_id`,`occurred_at`) COMMENT '在庫別履歴検索用',
  KEY `idx_store_product_time` (`store_id`,`product_id`,`occurred_at`) COMMENT '店舗×商品別履歴検索用',
  KEY `idx_txn_type` (`txn_type`) COMMENT '操作タイプ検索用',
  CONSTRAINT `fk_invtxn_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_invtxn_inventory` FOREIGN KEY (`tenant_id`, `inventory_id`) REFERENCES `retail_inventory` (`tenant_id`, `id`),
  CONSTRAINT `fk_invtxn_store` FOREIGN KEY (`tenant_id`, `store_id`) REFERENCES `retail_store` (`tenant_id`, `id`),
  CONSTRAINT `fk_invtxn_product` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `retail_product` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入出庫履歴テーブル';

-- ============================================================
-- 3. デバイス管理テーブル
-- ============================================================

-- ----------------------------
-- 3.1 デバイスマスタ (retail_device)
-- ----------------------------
-- 変更(v0.7.1):
--   - uk_device_tenant_id 追加（複合FK参照用）
--   - fk_device_store を複合FK化
-- ----------------------------
CREATE TABLE `retail_device` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'デバイスID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `device_code` varchar(50) NOT NULL COMMENT 'デバイスコード（テナント内一意、例: DEV-1-POS-01）',
  `device_type` enum(
    'PAYMENT_TERMINAL', 'CAMERA', 'GATE',
    'REFRIGERATOR_SENSOR', 'PRINTER', 'NETWORK_ROUTER'
  ) NOT NULL COMMENT 'デバイスタイプ',
  `device_name` varchar(100) NOT NULL COMMENT 'デバイス名',
  `status` enum('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE') DEFAULT 'ONLINE' COMMENT 'ステータス',
  `last_heartbeat` datetime DEFAULT NULL COMMENT '最終Heartbeat受信日時',
  `error_code` varchar(50) DEFAULT NULL COMMENT 'エラーコード',
  `metadata` json DEFAULT NULL COMMENT 'デバイス固有情報（JSON）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_tenant_code` (`tenant_id`, `device_code`) COMMENT 'デバイスコードはテナント内ユニーク',
  UNIQUE KEY `uk_device_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_device_tenant` (`tenant_id`) COMMENT 'テナント別デバイス検索用',
  KEY `idx_device_store` (`store_id`) COMMENT '店舗別デバイス検索用',
  KEY `idx_device_status` (`status`) COMMENT 'ステータス検索用',
  KEY `idx_device_heartbeat` (`last_heartbeat`) COMMENT '最終Heartbeat検索用',
  CONSTRAINT `fk_device_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_device_store` FOREIGN KEY (`tenant_id`, `store_id`) REFERENCES `retail_store` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='デバイスマスタ';

-- ============================================================
-- 4. アラート管理テーブル
-- ============================================================

-- ----------------------------
-- 4.1 アラートテーブル (retail_alert)
-- ----------------------------
-- 変更(v0.7.1): 複合FK化（テナント整合性保証）
-- ----------------------------
CREATE TABLE `retail_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'アラートID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint DEFAULT NULL COMMENT '商品ID（在庫系アラート時に設定）',
  `device_id` bigint DEFAULT NULL COMMENT 'デバイスID（デバイス系アラート時に設定）',
  `lot_number` varchar(50) DEFAULT NULL COMMENT 'ロット番号（EXPIRY_SOONアラート時に設定）',
  `alert_type` enum('LOW_STOCK','EXPIRY_SOON','HIGH_STOCK','COMMUNICATION_DOWN','PAYMENT_TERMINAL_DOWN','CARD_READER_ERROR','PRINTER_PAPER_EMPTY') NOT NULL COMMENT 'アラートタイプ',
  `priority` enum('P1','P2','P3','P4') NOT NULL COMMENT '優先度（P1緊急/P2高/P3中/P4低）',
  `status` enum('NEW','ACK','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'NEW' COMMENT '状態',
  `message` varchar(500) DEFAULT NULL COMMENT 'アラートメッセージ（表示用テキスト）',
  `threshold_value` varchar(50) DEFAULT NULL COMMENT 'しきい値（発注点、適正上限等の基準値）',
  `current_value` varchar(50) DEFAULT NULL COMMENT '検出時の現在値（在庫数、残日数等）',
  `detected_at` datetime NOT NULL COMMENT '検知日時',
  `acknowledged_at` datetime DEFAULT NULL COMMENT '確認日時（NEW→ACK遷移時）',
  `resolved_at` datetime DEFAULT NULL COMMENT '対応完了日時（IN_PROGRESS→RESOLVED遷移時）',
  `closed_at` datetime DEFAULT NULL COMMENT 'クローズ日時（RESOLVED→CLOSED遷移時）',
  `resolution_note` text DEFAULT NULL COMMENT '対応完了メモ',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_alert_tenant` (`tenant_id`) COMMENT 'テナント別アラート検索用',
  KEY `idx_alert_store_status` (`store_id`,`status`,`detected_at`) COMMENT '店舗×状態別アラート検索',
  KEY `idx_alert_type_priority` (`alert_type`,`priority`) COMMENT 'アラートタイプ×優先度検索',
  KEY `idx_alert_detected_at` (`detected_at`) COMMENT '検知日時検索用',
  KEY `idx_alert_product` (`product_id`) COMMENT '商品別アラート検索用',
  KEY `idx_alert_device` (`device_id`) COMMENT 'デバイス別アラート検索用',
  CONSTRAINT `fk_alert_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_alert_store` FOREIGN KEY (`tenant_id`, `store_id`) REFERENCES `retail_store` (`tenant_id`, `id`),
  CONSTRAINT `fk_alert_product` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `retail_product` (`tenant_id`, `id`),
  CONSTRAINT `fk_alert_device` FOREIGN KEY (`tenant_id`, `device_id`) REFERENCES `retail_device` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='アラートテーブル';

-- ============================================================
-- 5. 売上管理テーブル
-- ============================================================

-- ----------------------------
-- 5.1 売上ヘッダテーブル (retail_sales)
-- ----------------------------
-- 変更(v0.7.1):
--   - uk_order_number をテナント内一意に変更
--   - uk_sales_tenant_id 追加（複合FK参照用）
--   - fk_sales_store を複合FK化
-- ----------------------------
CREATE TABLE `retail_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `order_number` varchar(50) NOT NULL COMMENT '注文番号（テナント内一意、例: ORD-20260129-001）',
  `total_amount` decimal(10,2) NOT NULL COMMENT '合計金額（税込）',
  `payment_method` enum('CASH','CARD','QR','OTHER') NOT NULL COMMENT '支払方法',
  `payment_provider` varchar(50) DEFAULT NULL COMMENT '決済プロバイダ（PayPay, LINE Pay等）',
  `payment_reference_id` varchar(100) DEFAULT NULL COMMENT '決済参照ID（決済システムの取引ID）',
  `sale_timestamp` datetime NOT NULL COMMENT '売上日時',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sales_tenant_order` (`tenant_id`, `order_number`) COMMENT '注文番号はテナント内ユニーク',
  UNIQUE KEY `uk_sales_tenant_id` (`tenant_id`, `id`) COMMENT '複合FK参照用',
  KEY `idx_sales_tenant` (`tenant_id`) COMMENT 'テナント別売上検索用',
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別売上検索用',
  KEY `idx_sale_timestamp` (`sale_timestamp`) COMMENT '売上日時検索用',
  KEY `idx_store_sale_time` (`store_id`, `sale_timestamp`) COMMENT '店舗×日時検索用',
  KEY `idx_payment_method` (`payment_method`) COMMENT '支払方法検索用',
  CONSTRAINT `fk_sales_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_sales_store` FOREIGN KEY (`tenant_id`, `store_id`) REFERENCES `retail_store` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上ヘッダテーブル';

-- ----------------------------
-- 5.2 売上明細テーブル (retail_sales_detail)
-- ----------------------------
-- 変更(v0.7.1): tenant_id追加、複合FK化
-- 注意: TenantLineInnerInterceptorの対象とする
-- ----------------------------
CREATE TABLE `retail_sales_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上明細ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `sales_id` bigint NOT NULL COMMENT '売上ID（retail_salesへの外部キー）',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号（在庫引当時のロット）',
  `quantity` int NOT NULL COMMENT '販売数量',
  `unit_price` decimal(10,2) NOT NULL COMMENT '単価（販売時の価格）',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小計（quantity × unit_price）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_sales_detail_tenant` (`tenant_id`) COMMENT 'テナント別明細検索用',
  KEY `idx_sales_id` (`sales_id`) COMMENT '売上ヘッダ検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別売上検索用',
  CONSTRAINT `fk_sales_detail_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_sales_detail_sales` FOREIGN KEY (`tenant_id`, `sales_id`) REFERENCES `retail_sales` (`tenant_id`, `id`),
  CONSTRAINT `fk_sales_detail_product` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `retail_product` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上明細テーブル';

-- ============================================================
-- END OF FILE
-- ============================================================
