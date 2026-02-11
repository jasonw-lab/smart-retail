-- ============================================================
-- Smart Retail Database Schema v0.3
-- ============================================================
-- 目的: スマートリテールシステムのデータベーススキーマ定義
-- 対象: Phase 1 コア機能（在庫管理、アラート、売上管理）
-- 
-- 主要機能:
--   - 店舗・商品マスタ管理
--   - ロット単位の在庫管理（賞味期限対応）
--   - 入出庫履歴トラッキング
--   - 在庫アラート（在庫切れ、賞味期限接近）
--   - 売上データ管理
--   - カテゴリ階層管理
--
-- 更新履歴:
--   v0.1 (2026-01-20): 初版作成
--   v0.2 (2026-01-25): 在庫トランザクション追加
--   v0.3 (2026-02-11): TOP画面対応、コメント追加
-- ============================================================

use youlai_boot;

-- ============================================================
-- 1. マスタテーブル
-- ============================================================

-- ============================================================
-- テーブル削除（外部キー制約を考慮した順序）
-- ============================================================
DROP TABLE IF EXISTS `retail_sales_detail`;
DROP TABLE IF EXISTS `retail_sales`;
DROP TABLE IF EXISTS `retail_alert`;
DROP TABLE IF EXISTS `retail_inventory_transaction`;
DROP TABLE IF EXISTS `retail_inventory`;
DROP TABLE IF EXISTS `retail_product`;
DROP TABLE IF EXISTS `retail_category`;
DROP TABLE IF EXISTS `retail_store`;

-- ----------------------------
-- 1.1 店舗マスタ (retail_store)
-- ----------------------------
-- 説明: 店舗の基本情報を管理
-- 用途: 店舗一覧表示、店舗別在庫管理、店舗別売上集計
-- ----------------------------
CREATE TABLE `retail_store` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '店舗ID（主キー）',
  `store_code` varchar(20) NOT NULL COMMENT '店舗コード（一意、例: ST001）',
  `store_name` varchar(100) NOT NULL COMMENT '店舗名（例: 東京本店）',
  `address` varchar(255) DEFAULT NULL COMMENT '住所',
  `phone` varchar(20) DEFAULT NULL COMMENT '電話番号',
  `manager` varchar(50) DEFAULT NULL COMMENT '店長名',
  `status` varchar(20) DEFAULT 'active' COMMENT '状態（active: 営業中, inactive: 休業中）',
  `opening_hours` varchar(100) DEFAULT NULL COMMENT '営業時間（例: 9:00-21:00）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_code` (`store_code`) COMMENT '店舗コードはユニーク'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店舗マスタ';

-- ----------------------------
-- 1.2 商品マスタ (retail_product)
-- ----------------------------
-- 説明: 商品の基本情報を管理
-- 用途: 商品一覧表示、価格管理、在庫管理の基準
-- 特記: shelf_life_daysは賞味期限の標準日数（入庫時の期限計算に使用）
-- ----------------------------
CREATE TABLE `retail_product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID（主キー）',
  `product_code` varchar(30) NOT NULL COMMENT '商品コード（一意、例: PRD-001）',
  `product_name` varchar(100) NOT NULL COMMENT '商品名',
  `barcode` varchar(50) DEFAULT NULL COMMENT 'JANコード等のバーコード',
  `category_id` bigint DEFAULT NULL COMMENT 'カテゴリID（retail_categoryへの外部キー）',
  `category_name` varchar(50) DEFAULT NULL COMMENT 'カテゴリ名（非正規化、検索高速化用）',
  `unit_price` decimal(10,2) NOT NULL COMMENT '販売価格（税込）',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '原価',
  `unit` varchar(20) DEFAULT NULL COMMENT '単位（個、本、kg等）',
  `shelf_life_days` int DEFAULT NULL COMMENT '標準賞味期限日数（入庫日からの日数）',
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
  UNIQUE KEY `uk_product_code` (`product_code`) COMMENT '商品コードはユニーク',
  KEY `idx_category_id` (`category_id`) COMMENT 'カテゴリ検索用',
  KEY `idx_supplier_id` (`supplier_id`) COMMENT '仕入先検索用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品マスタ';

-- ----------------------------
-- 1.3 カテゴリマスタ (retail_category)
-- ----------------------------
-- 説明: 商品カテゴリの階層構造を管理
-- 用途: 商品分類、カテゴリ別売上分析
-- 特記: parent_idで親子関係を表現（階層構造）
-- ----------------------------
CREATE TABLE `retail_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'カテゴリID（主キー）',
  `category_code` varchar(20) NOT NULL COMMENT 'カテゴリコード（一意、例: CAT-001）',
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
  UNIQUE KEY `uk_category_code` (`category_code`) COMMENT 'カテゴリコードはユニーク',
  KEY `idx_parent_id` (`parent_id`) COMMENT '親カテゴリ検索用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='カテゴリマスタ';

-- ============================================================
-- 2. 在庫管理テーブル
-- ============================================================

-- ----------------------------
-- 2.1 在庫テーブル (retail_inventory)
-- ----------------------------
-- 説明: ロット単位の在庫情報を管理
-- 用途: 在庫照会、在庫アラート生成、FEFO（先入先出）制御
-- 特記: 
--   - 同一商品でもロット（賞味期限）が異なれば別レコード
--   - uk_store_product_lotで店舗×商品×ロットの一意性を保証
--   - statusは在庫状態（low: 在庫少, normal: 正常, high: 過剰, expired: 期限切れ）
-- ----------------------------
CREATE TABLE `retail_inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '在庫ID（主キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号（例: LOT-2026-0101）',
  `quantity` int NOT NULL DEFAULT '0' COMMENT '現在在庫数量',
  `min_stock` int DEFAULT '0' COMMENT '最小在庫数（発注点、この値を下回るとアラート）',
  `max_stock` int DEFAULT '0' COMMENT '最大在庫数（この値を超えると過剰在庫アラート）',
  `expiry_date` date DEFAULT NULL COMMENT '賞味期限（YYYY-MM-DD）',
  `location` varchar(50) DEFAULT NULL COMMENT '保管場所（例: A-01、冷蔵庫-1）',
  `status` varchar(20) DEFAULT 'normal' COMMENT '在庫状態（low: 在庫少, normal: 正常, high: 過剰, expired: 期限切れ, out_of_stock: 在庫切れ）',
  `last_count_date` datetime DEFAULT NULL COMMENT '最終棚卸日時',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_product_lot` (`store_id`,`product_id`,`lot_number`) COMMENT '店舗×商品×ロットの組み合わせはユニーク',
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別在庫検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別在庫検索用',
  KEY `idx_status` (`status`) COMMENT '在庫状態検索用',
  KEY `idx_expiry_date` (`expiry_date`) COMMENT '賞味期限検索用（期限接近アラート生成）',
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_inventory_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在庫テーブル（ロット単位管理）';

-- ----------------------------
-- 2.2 入出庫履歴テーブル (retail_inventory_transaction)
-- ----------------------------
-- 説明: 在庫の入出庫履歴を記録
-- 用途: 在庫変動の追跡、監査証跡、在庫分析
-- 特記:
--   - transaction_type: IN（入庫）, OUT（出庫）, SALE（販売）, ADJUST（調整）
--   - quantityは常に正の値（CHECK制約）、増減はtransaction_typeで判断
--   - reference_noで発注書や売上伝票と紐付け
-- ----------------------------
CREATE TABLE `retail_inventory_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '入出庫ID（主キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `transaction_type` enum('IN','OUT','SALE','ADJUST') NOT NULL COMMENT '操作タイプ（IN: 入庫, OUT: 出庫, SALE: 販売, ADJUST: 調整）',
  `quantity` int NOT NULL COMMENT '数量（常に正の値）',
  `transaction_date` datetime NOT NULL COMMENT '操作日時',
  `expiry_date` date DEFAULT NULL COMMENT '賞味期限（入庫時に記録）',
  `status` varchar(20) NOT NULL COMMENT '状態（処理中, 完了, キャンセル）',
  `reason` varchar(50) DEFAULT NULL COMMENT '理由（仕入れ, 返品, 廃棄, 販売, 移動, 棚卸調整等）',
  `reference_no` varchar(50) DEFAULT NULL COMMENT '参照番号（発注番号, 販売番号, 調整番号等）',
  `source_dest` varchar(100) DEFAULT NULL COMMENT '移動元/移動先（倉庫名、店舗名等）',
  `operator` varchar(50) DEFAULT NULL COMMENT '担当者名',
  `remarks` varchar(500) DEFAULT NULL COMMENT '備考',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別履歴検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別履歴検索用',
  KEY `idx_status` (`status`) COMMENT '状態検索用',
  KEY `idx_transaction_type` (`transaction_type`) COMMENT '操作タイプ検索用',
  KEY `idx_transaction_date` (`transaction_date`) COMMENT '日時検索用',
  KEY `idx_lot_number` (`lot_number`) COMMENT 'ロット番号検索用',
  CONSTRAINT `fk_transaction_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_transaction_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`),
  CONSTRAINT `chk_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入出庫履歴テーブル';

-- ============================================================
-- 3. アラート管理テーブル
-- ============================================================

-- ----------------------------
-- 3.1 アラートテーブル (retail_alert)
-- ----------------------------
-- 説明: 在庫に関するアラート情報を管理
-- 用途: 在庫切れ警告、賞味期限接近警告の通知
-- 特記:
--   - alert_type: LOW_STOCK（在庫切れ・在庫少）, EXPIRED（賞味期限接近・期限切れ）
--   - resolvedフラグで解決済みかどうかを管理
--   - 同一条件で複数回アラートが生成される可能性あり（履歴として保持）
-- ----------------------------
CREATE TABLE `retail_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'アラートID（主キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `lot_number` varchar(50) NOT NULL COMMENT 'ロット番号',
  `alert_type` enum('LOW_STOCK','EXPIRED') NOT NULL COMMENT 'アラートタイプ（LOW_STOCK: 在庫切れ/在庫少, EXPIRED: 賞味期限接近/期限切れ）',
  `alert_message` varchar(255) DEFAULT NULL COMMENT 'アラートメッセージ（表示用テキスト）',
  `alert_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'アラート発生日時',
  `resolved` tinyint(1) DEFAULT '0' COMMENT '解決フラグ（0: 未解決, 1: 解決済み）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '作成時間',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `create_by` bigint DEFAULT NULL COMMENT '作成者ID',
  `update_by` bigint DEFAULT NULL COMMENT '更新者ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '削除フラグ（0: 未削除, 1: 削除済み）',
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別アラート検索用',
  KEY `idx_product_id` (`product_id`) COMMENT '商品別アラート検索用',
  KEY `idx_alert_type` (`alert_type`) COMMENT 'アラートタイプ検索用',
  KEY `idx_resolved` (`resolved`) COMMENT '未解決アラート検索用',
  KEY `idx_alert_date` (`alert_date`) COMMENT 'アラート日時検索用',
  CONSTRAINT `fk_alert_product` FOREIGN KEY (`product_id`) REFERENCES `retail_product` (`id`),
  CONSTRAINT `fk_alert_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='アラートテーブル';

-- ============================================================
-- 4. 売上管理テーブル
-- ============================================================

-- ----------------------------
-- 4.1 売上ヘッダテーブル (retail_sales)
-- ----------------------------
-- 説明: 売上取引の基本情報を管理
-- 用途: 売上集計、決済管理、売上分析
-- 特記:
--   - order_numberは注文番号（一意）
--   - payment_method: CASH（現金）, CARD（カード）, QR（QRコード決済）, OTHER（その他）
--   - 明細はretail_sales_detailテーブルで管理
-- ----------------------------
CREATE TABLE `retail_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '売上ID（主キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `order_number` varchar(50) NOT NULL COMMENT '注文番号（一意、例: ORD-20260129-001）',
  `total_amount` decimal(10,2) NOT NULL COMMENT '合計金額（税込）',
  `payment_method` enum('CASH','CARD','QR','OTHER') NOT NULL COMMENT '支払方法（CASH: 現金, CARD: カード, QR: QRコード決済, OTHER: その他）',
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
  KEY `idx_store_id` (`store_id`) COMMENT '店舗別売上検索用',
  KEY `idx_sale_timestamp` (`sale_timestamp`) COMMENT '売上日時検索用（日次・月次集計）',
  CONSTRAINT `fk_sales_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='売上ヘッダテーブル';

-- ----------------------------
-- 4.2 売上明細テーブル (retail_sales_detail)
-- ----------------------------
-- 説明: 売上取引の商品明細を管理
-- 用途: 商品別売上分析、在庫連動
-- 特記:
--   - sales_idでretail_salesと紐付け
--   - lot_numberで在庫引当のトレーサビリティを確保
--   - subtotal = quantity × unit_price
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
-- 5. 使用例・クエリサンプル
-- ============================================================

-- ----------------------------
-- 5.1 在庫一覧取得（店舗別、商品別）
-- ----------------------------
-- SELECT 
--   s.store_name,
--   p.product_name,
--   i.lot_number,
--   i.quantity,
--   i.expiry_date,
--   i.status
-- FROM retail_inventory i
-- JOIN retail_store s ON i.store_id = s.id
-- JOIN retail_product p ON i.product_id = p.id
-- WHERE i.store_id = 1
-- ORDER BY i.expiry_date ASC;

-- ----------------------------
-- 5.2 在庫切れアラート取得（未解決のみ）
-- ----------------------------
-- SELECT 
--   a.alert_date,
--   s.store_name,
--   p.product_name,
--   a.alert_message,
--   a.alert_type
-- FROM retail_alert a
-- JOIN retail_store s ON a.store_id = s.id
-- JOIN retail_product p ON a.product_id = p.id
-- WHERE a.resolved = 0
-- ORDER BY a.alert_date DESC;

-- ----------------------------
-- 5.3 日次売上集計
-- ----------------------------
-- SELECT 
--   DATE(sale_timestamp) AS sale_date,
--   s.store_name,
--   COUNT(*) AS transaction_count,
--   SUM(total_amount) AS daily_sales
-- FROM retail_sales rs
-- JOIN retail_store s ON rs.store_id = s.id
-- WHERE DATE(sale_timestamp) = CURDATE()
-- GROUP BY DATE(sale_timestamp), s.store_name;

-- ----------------------------
-- 5.4 賞味期限接近商品検索（7日以内）
-- ----------------------------
-- SELECT 
--   s.store_name,
--   p.product_name,
--   i.lot_number,
--   i.quantity,
--   i.expiry_date,
--   DATEDIFF(i.expiry_date, CURDATE()) AS days_until_expiry
-- FROM retail_inventory i
-- JOIN retail_store s ON i.store_id = s.id
-- JOIN retail_product p ON i.product_id = p.id
-- WHERE i.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
--   AND i.quantity > 0
-- ORDER BY i.expiry_date ASC;

-- ============================================================
-- END OF FILE
-- ============================================================
