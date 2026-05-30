-- ============================================================
-- Smart Retail Database Schema v0.7
-- ============================================================
-- 目的: スマートリテールシステムのマルチテナント対応スキーマ定義
-- 対象: Phase 2 マルチテナント対応
--
-- 主要変更点（v0.6 → v0.7）:
--   - retail_tenant テーブル追加（テナントマスタ）
--   - 全retail_*テーブルに tenant_id カラム追加
--   - ユニークキーをテナント内一意に変更
--   - tenant_id による外部キー制約追加
--
-- テナント分離方式:
--   - カラム分離（Shared Database, Shared Schema）
--   - MyBatis Plus TenantLineInnerInterceptor で自動分離
--
-- 準拠ドキュメント:
--   - smart-retail-multi-tenant.md v1.0
--   - smart-retail-requirements.md v1.1
--   - smart-retail-sql.md v1.0
--
-- 更新履歴:
--   v0.5 (2026-02-14): 設計書レビュー反映
--   v0.6 (2026-02-15): アラートタイプ拡張（沈黙監視対応）
--   v0.7 (2026-05-28): マルチテナント対応
--     - retail_tenant テーブル追加
--     - 全テーブルに tenant_id 追加
--     - ユニークキー変更（テナント内一意）
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
-- 説明: テナント（企業・組織）の基本情報を管理
-- 用途: マルチテナント分離、プラン管理、利用制限
-- 準拠: multi-tenant設計書§2.1
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
-- 説明: 店舗の基本情報を管理
-- 用途: 店舗一覧表示、店舗別在庫管理、店舗別売上集計
-- 準拠: 要件定義§6（KPI: 稼働中店舗数）、SQL設計書§2.1
-- 変更(v0.7): tenant_id追加、uk_store_codeをテナント内一意に変更
-- ----------------------------
CREATE TABLE `retail_store` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '店舗ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_code` varchar(20) NOT NULL COMMENT '店舗コード（テナント内一意、例: ST001）',
  `store_name` varchar(100) NOT NULL COMMENT '店舗名（例: 東京本店）',
  `address` varchar(255) DEFAULT NULL COMMENT '住所',
  `phone` varchar(20) DEFAULT NULL COMMENT '電話番号',
  `manager` varchar(50) DEFAULT NULL COMMENT '店長名',
  `status` enum('ONLINE','MAINTENANCE','OFFLINE') DEFAULT 'ONLINE' COMMENT '状態（ONLINE: 稼働中, MAINTENANCE: メンテナンス中, OFFLINE: 停止中）',
  `opening_hours` varchar(100) DEFAULT NULL COMMENT '営業時間（例: 9:00-21:00）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_tenant_code` (`tenant_id`, `store_code`) COMMENT '店舗コードはテナント内ユニーク',
  KEY `idx_store_tenant` (`tenant_id`) COMMENT 'テナント別店舗検索用',
  CONSTRAINT `fk_store_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店舗マスタ';

-- ----------------------------
-- 1.2 カテゴリマスタ (retail_category)
-- ----------------------------
-- 説明: 商品カテゴリの階層構造を管理
-- 用途: 商品分類、カテゴリ別売上分析
-- 特記: parent_idで親子関係を表現（階層構造）
-- 変更(v0.7): tenant_id追加、uk_category_codeをテナント内一意に変更
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
  KEY `idx_category_tenant` (`tenant_id`) COMMENT 'テナント別カテゴリ検索用',
  KEY `idx_parent_id` (`parent_id`) COMMENT '親カテゴリ検索用',
  CONSTRAINT `fk_category_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='カテゴリマスタ';

-- ----------------------------
-- 1.3 商品マスタ (retail_product)
-- ----------------------------
-- 説明: 商品の基本情報を管理
-- 用途: 商品一覧表示、価格管理、在庫管理の基準
-- 準拠: 要件定義§5.2, §8.1 / SQL設計書§2.2 / UI設計書§5.3.2
-- 変更(v0.7): tenant_id追加、uk_product_codeをテナント内一意に変更
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
-- 説明: ロット単位の在庫情報を管理
-- 用途: 在庫照会、在庫アラート生成、FEFO（先入先出）制御
-- 準拠: 要件定義§8.1.1 / SQL設計書§2.3 / UI設計書§6.2
-- 変更(v0.7): tenant_id追加
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
  `status` enum('normal','low','high','expired','out_of_stock') DEFAULT 'normal' COMMENT '在庫状態（キャッシュ値、UI設計書§6.3.2に準拠）',
  `last_count_date` datetime DEFAULT NULL COMMENT '最終棚卸日時',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_product_lot` (`store_id`,`product_id`,`lot_number`) COMMENT '店舗×商品×ロットの組み合わせはユニーク',
  KEY `idx_inventory_tenant` (`tenant_id`) COMMENT 'テナント別在庫検索用',
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別在庫検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別在庫検索用',
  KEY `idx_status` (`status`) COMMENT '在庫状態検索用',
  KEY `idx_expiry_date` (`expiry_date`) COMMENT '賞味期限検索用（期限接近アラート生成）',
  KEY `idx_fefo` (`store_id`,`product_id`,`expiry_date`,`received_at`) COMMENT 'FEFO引当クエリ用複合インデックス',
  CONSTRAINT `fk_inventory_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_inventory_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`),
  CONSTRAINT `chk_inventory_quantity` CHECK (`quantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在庫テーブル（ロット単位管理）';

-- ----------------------------
-- 2.2 入出庫履歴テーブル (retail_inventory_transaction)
-- ----------------------------
-- 説明: 在庫の入出庫履歴を記録
-- 用途: 在庫変動の追跡、監査証跡、在庫分析
-- 準拠: 要件定義§8.4 / SQL設計書§2.4
-- 変更(v0.7): tenant_id追加
-- ----------------------------
CREATE TABLE `retail_inventory_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '入出庫ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `inventory_id` bigint NOT NULL COMMENT '在庫ID（retail_inventoryへの外部キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID（非正規化）',
  `product_id` bigint NOT NULL COMMENT '商品ID（非正規化）',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号（非正規化）',
  `txn_type` enum('INBOUND','SALE','ADJUSTMENT','DISPOSAL','TRANSFER_IN','TRANSFER_OUT') NOT NULL COMMENT '操作タイプ（INBOUND:入庫, SALE:販売, ADJUSTMENT:調整, DISPOSAL:廃棄, TRANSFER_IN:移動入, TRANSFER_OUT:移動出）',
  `quantity_delta` int NOT NULL COMMENT '数量変動（正=増加, 負=減少。例: 入庫+50, 販売-3, 廃棄-12）',
  `source_type` enum('MANUAL','POS','BATCH') NOT NULL DEFAULT 'MANUAL' COMMENT '操作元（MANUAL:手動, POS:POS連携, BATCH:バッチ処理）',
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
  CONSTRAINT `fk_invtxn_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `retail_inventory` (`id`),
  CONSTRAINT `fk_invtxn_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`),
  CONSTRAINT `fk_invtxn_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入出庫履歴テーブル';

-- ============================================================
-- 3. デバイス管理テーブル
-- ============================================================

-- ----------------------------
-- 3.1 デバイスマスタ (retail_device)
-- ----------------------------
-- 説明: 店舗に設置されたデバイスの状態を管理
-- 用途: Heartbeat監視、障害検知、デバイス状態表示
-- 準拠: 要件定義§8.3 / ADR-004
-- 変更(v0.7): tenant_id追加、uk_device_codeをテナント内一意に変更
-- ----------------------------
CREATE TABLE `retail_device` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'デバイスID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `device_code` varchar(50) NOT NULL COMMENT 'デバイスコード（テナント内一意、例: DEV-1-POS-01）',
  `device_type` enum(
    'PAYMENT_TERMINAL', 'CAMERA', 'GATE',
    'REFRIGERATOR_SENSOR', 'PRINTER', 'NETWORK_ROUTER'
  ) NOT NULL COMMENT 'デバイスタイプ（要件定義§8.3.1）',
  `device_name` varchar(100) NOT NULL COMMENT 'デバイス名',
  `status` enum('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE') DEFAULT 'ONLINE' COMMENT 'ステータス',
  `last_heartbeat` datetime DEFAULT NULL COMMENT '最終Heartbeat受信日時',
  `error_code` varchar(50) DEFAULT NULL COMMENT 'エラーコード',
  `metadata` json DEFAULT NULL COMMENT 'デバイス固有情報（JSON、ADR-004 deviceStats格納用）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_tenant_code` (`tenant_id`, `device_code`) COMMENT 'デバイスコードはテナント内ユニーク',
  KEY `idx_device_tenant` (`tenant_id`) COMMENT 'テナント別デバイス検索用',
  KEY `idx_device_store` (`store_id`) COMMENT '店舗別デバイス検索用',
  KEY `idx_device_status` (`status`) COMMENT 'ステータス検索用',
  KEY `idx_device_heartbeat` (`last_heartbeat`) COMMENT '最終Heartbeat検索用（沈黙監視）',
  CONSTRAINT `fk_device_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_device_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='デバイスマスタ';

-- ============================================================
-- 4. アラート管理テーブル
-- ============================================================

-- ----------------------------
-- 4.1 アラートテーブル (retail_alert)
-- ----------------------------
-- 説明: システムが検知したアラート情報を管理
-- 用途: 在庫切れ警告、賞味期限接近警告、在庫過多警告、デバイス障害通知
-- 準拠: 要件定義§5.1〜§5.5, §8.2 / SQL設計書§2.6 / UI設計書§7
-- 変更(v0.7): tenant_id追加
-- ----------------------------
CREATE TABLE `retail_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'アラートID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint DEFAULT NULL COMMENT '商品ID（在庫系アラート時に設定）',
  `device_id` bigint DEFAULT NULL COMMENT 'デバイスID（デバイス系アラート時に設定）',
  `lot_number` varchar(50) DEFAULT NULL COMMENT 'ロット番号（EXPIRY_SOONアラート時に設定）',
  `alert_type` enum('LOW_STOCK','EXPIRY_SOON','HIGH_STOCK','COMMUNICATION_DOWN','PAYMENT_TERMINAL_DOWN','CARD_READER_ERROR','PRINTER_PAPER_EMPTY') NOT NULL COMMENT 'アラートタイプ（要件定義§5.2 + PJ-6沈黙監視拡張）',
  `priority` enum('P1','P2','P3','P4') NOT NULL COMMENT '優先度（要件定義§5.1: P1緊急/P2高/P3中/P4低）',
  `status` enum('NEW','ACK','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'NEW' COMMENT '状態（要件定義§5.3: NEW→ACK→IN_PROGRESS→RESOLVED→CLOSED）',
  `message` varchar(500) DEFAULT NULL COMMENT 'アラートメッセージ（表示用テキスト）',
  `threshold_value` varchar(50) DEFAULT NULL COMMENT 'しきい値（発注点、適正上限等の基準値）',
  `current_value` varchar(50) DEFAULT NULL COMMENT '検出時の現在値（在庫数、残日数等）',
  `detected_at` datetime NOT NULL COMMENT '検知日時',
  `acknowledged_at` datetime DEFAULT NULL COMMENT '確認日時（NEW→ACK遷移時）',
  `resolved_at` datetime DEFAULT NULL COMMENT '対応完了日時（IN_PROGRESS→RESOLVED遷移時）',
  `closed_at` datetime DEFAULT NULL COMMENT 'クローズ日時（RESOLVED→CLOSED遷移時）',
  `resolution_note` text DEFAULT NULL COMMENT '対応完了メモ（UI設計書§7.3.9）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_alert_tenant` (`tenant_id`) COMMENT 'テナント別アラート検索用',
  KEY `idx_alert_store_status` (`store_id`,`status`,`detected_at`) COMMENT '店舗×状態別アラート検索（A-01デフォルト表示用）',
  KEY `idx_alert_type_priority` (`alert_type`,`priority`) COMMENT 'アラートタイプ×優先度検索（サマリバー集計用）',
  KEY `idx_alert_detected_at` (`detected_at`) COMMENT '検知日時検索用',
  KEY `idx_alert_product` (`product_id`) COMMENT '商品別アラート検索用',
  KEY `idx_alert_device` (`device_id`) COMMENT 'デバイス別アラート検索用',
  CONSTRAINT `fk_alert_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_alert_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`),
  CONSTRAINT `fk_alert_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_alert_device` FOREIGN KEY (`device_id`) REFERENCES `retail_device` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='アラートテーブル（要件定義§8.2準拠）';

-- ============================================================
-- 5. 売上管理テーブル
-- ============================================================

-- ----------------------------
-- 5.1 売上ヘッダテーブル (retail_sales)
-- ----------------------------
-- 説明: 売上取引の基本情報を管理
-- 用途: 売上集計、決済管理、売上分析
-- 変更(v0.7): tenant_id追加
-- ----------------------------
CREATE TABLE `retail_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上ID（主キー）',
  `tenant_id` bigint NOT NULL DEFAULT 1 COMMENT 'テナントID',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `order_number` varchar(50) NOT NULL COMMENT '注文番号（一意、例: ORD-20260129-001）',
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
  UNIQUE KEY `uk_order_number` (`order_number`) COMMENT '注文番号はユニーク',
  KEY `idx_sales_tenant` (`tenant_id`) COMMENT 'テナント別売上検索用',
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別売上検索用',
  KEY `idx_sale_timestamp` (`sale_timestamp`) COMMENT '売上日時検索用（日次・月次集計）',
  KEY `idx_store_sale_time` (`store_id`, `sale_timestamp`) COMMENT '店舗×日時検索用',
  KEY `idx_payment_method` (`payment_method`) COMMENT '支払方法検索用',
  CONSTRAINT `fk_sales_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant` (`id`),
  CONSTRAINT `fk_sales_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上ヘッダテーブル';

-- ----------------------------
-- 5.2 売上明細テーブル (retail_sales_detail)
-- ----------------------------
-- 説明: 売上取引の商品明細を管理
-- 用途: 商品別売上分析、在庫連動
-- 特記: tenant_idは不要（sales_id経由で分離）
-- ----------------------------
CREATE TABLE `retail_sales_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上明細ID（主キー）',
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
  KEY `idx_sales_id` (`sales_id`) COMMENT '売上ヘッダ検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別売上検索用',
  CONSTRAINT `fk_sales_detail_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_sales_detail_sales` FOREIGN KEY (`sales_id`) REFERENCES `retail_sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上明細テーブル';

-- ============================================================
-- 6. クエリサンプル（マルチテナント対応）
-- ============================================================

-- ----------------------------
-- 6.1 在庫一覧（I-01）SKU集約表示
-- MyBatis Plus Interceptorにより tenant_id 条件が自動付与される
-- ----------------------------
-- SELECT
--   i.store_id,
--   s.store_name,
--   i.product_id,
--   p.product_name,
--   p.reorder_point,
--   p.max_stock,
--   SUM(i.quantity) AS total_quantity,
--   MIN(CASE WHEN i.quantity > 0 THEN i.expiry_date ELSE NULL END) AS oldest_expiry_date
-- FROM retail_inventory i
-- JOIN retail_store s ON i.store_id = s.id
-- JOIN retail_product p ON i.product_id = p.id
-- WHERE i.is_deleted = 0
--   AND i.tenant_id = ?  -- 自動付与
-- GROUP BY i.store_id, i.product_id;

-- ----------------------------
-- 6.2 テナント別店舗数チェック（プラン制限用）
-- ----------------------------
-- SELECT COUNT(*) AS store_count
-- FROM retail_store
-- WHERE tenant_id = ? AND is_deleted = 0;

-- ----------------------------
-- 6.3 テナント横断集計（管理者用）
-- SUPER_ADMINのみ実行可能
-- ----------------------------
-- SELECT
--   t.tenant_name,
--   COUNT(DISTINCT s.id) AS store_count,
--   COUNT(DISTINCT p.id) AS product_count,
--   COALESCE(SUM(sa.total_amount), 0) AS total_sales
-- FROM retail_tenant t
-- LEFT JOIN retail_store s ON t.id = s.tenant_id AND s.is_deleted = 0
-- LEFT JOIN retail_product p ON t.id = p.tenant_id AND p.is_deleted = 0
-- LEFT JOIN retail_sales sa ON t.id = sa.tenant_id AND sa.is_deleted = 0
-- WHERE t.status = 'ACTIVE'
-- GROUP BY t.id;

-- ============================================================
-- END OF FILE
-- ============================================================
