-- ===========================
-- Smart Retail デモ用仮データ
-- 対応スキーマ: retail_v0.7.1_multi_tenant.sql
-- ===========================
-- 変更履歴:
--   v0.5 (2026-02-14): 初版
--   v0.7 (2026-05-28): マルチテナント対応（tenant_id追加）
--   v0.7.1 (2026-05-28): Codexレビュー対応
--     - DELETE条件にtenant_id追加
--     - retail_sales_detail INSERT追加
--     - デバイス生成クエリのtenant_id条件追加
-- ===========================
USE smart_dx_db;

-- デフォルトテナントID
SET @DEFAULT_TENANT_ID = 1;

-- ============================================================
-- 既存データ削除（tenant_id条件付き）
-- ============================================================

-- retail_sales_detail: 親テーブルJOINで対象テナントに限定
DELETE sd FROM `retail_sales_detail` sd
INNER JOIN `retail_sales` s ON sd.sales_id = s.id
WHERE s.tenant_id = @DEFAULT_TENANT_ID;

-- 他テーブル: tenant_id条件付きで削除
DELETE FROM `retail_sales` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_alert` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_inventory_transaction` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_inventory` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_device` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_product` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_store` WHERE tenant_id = @DEFAULT_TENANT_ID;
DELETE FROM `retail_category` WHERE tenant_id = @DEFAULT_TENANT_ID;

-- ============================================================
-- カテゴリマスタデータ
-- ============================================================
INSERT INTO `retail_category` (`id`, `tenant_id`, `category_code`, `category_name`, `parent_id`, `sort_order`, `description`, `status`) VALUES
(1, @DEFAULT_TENANT_ID, 'CAT-001', '飲料', NULL, 1, '飲料全般', 'active'),
(2, @DEFAULT_TENANT_ID, 'CAT-002', '菓子', NULL, 2, '菓子類全般', 'active'),
(3, @DEFAULT_TENANT_ID, 'CAT-003', '食品', NULL, 3, '食品全般', 'active'),
(4, @DEFAULT_TENANT_ID, 'CAT-004', '日用品', NULL, 4, '日用品全般', 'active'),
(5, @DEFAULT_TENANT_ID, 'CAT-005', '冷凍食品', NULL, 5, '冷凍食品全般', 'active'),
(6, @DEFAULT_TENANT_ID, 'CAT-006', '乳製品', NULL, 6, '乳製品全般', 'active'),
(7, @DEFAULT_TENANT_ID, 'CAT-007', '調味料', NULL, 7, '調味料全般', 'active'),
(8, @DEFAULT_TENANT_ID, 'CAT-008', 'アルコール', NULL, 8, 'アルコール飲料', 'active');

-- ============================================================
-- 店舗マスタデータ
-- ============================================================
INSERT INTO `retail_store` (`id`, `tenant_id`, `store_code`, `store_name`, `address`, `phone`, `manager`, `status`, `opening_hours`) VALUES
(1, @DEFAULT_TENANT_ID, 'ST001', '東京本店', '東京都千代田区丸の内1-1-1', '03-1234-5678', '山田太郎', 'ONLINE', '9:00-21:00'),
(2, @DEFAULT_TENANT_ID, 'ST002', '横浜駅前店', '神奈川県横浜市西区高島2-19-12', '045-1234-5678', '佐藤花子', 'ONLINE', '10:00-22:00'),
(3, @DEFAULT_TENANT_ID, 'ST003', '名古屋栄店', '愛知県名古屋市中区栄3-4-5', '052-1234-5678', '鈴木一郎', 'ONLINE', '10:00-21:00'),
(4, @DEFAULT_TENANT_ID, 'ST004', '大阪梅田店', '大阪府大阪市北区梅田1-1-3', '06-1234-5678', '田中美咲', 'ONLINE', '10:00-22:00'),
(5, @DEFAULT_TENANT_ID, 'ST005', '福岡天神店', '福岡県福岡市中央区天神2-1-1', '092-1234-5678', '高橋健太', 'ONLINE', '10:00-21:00');

-- ============================================================
-- 商品マスタデータ
-- ============================================================
INSERT INTO `retail_product` (`id`, `tenant_id`, `product_code`, `product_name`, `barcode`, `category_id`, `category_name`, `unit_price`, `cost_price`, `unit`, `reorder_point`, `max_stock`, `shelf_life_days`, `supplier_id`, `supplier_name`, `description`, `status`) VALUES
(1, @DEFAULT_TENANT_ID, 'PRD-001', 'プレミアムコーヒー', '4901234567890', 1, '飲料', 450.00, 200.00, '個', 20, 100, 365, 1, 'コーヒー商事', '厳選豆使用の高級コーヒー', 'active'),
(2, @DEFAULT_TENANT_ID, 'PRD-002', 'オーガニックティー', '4901234567891', 1, '飲料', 380.00, 180.00, '個', 15, 80, 365, 2, 'ティーワールド', '有機栽培茶葉100%', 'active'),
(3, @DEFAULT_TENANT_ID, 'PRD-003', 'ミネラルウォーター', '4901234567892', 1, '飲料', 120.00, 50.00, '本', 50, 300, 730, 3, '天然水業', '天然ミネラル豊富', 'active'),
(4, @DEFAULT_TENANT_ID, 'PRD-004', 'エナジードリンク', '4901234567893', 1, '飲料', 280.00, 120.00, '本', 20, 100, 365, 4, 'エナジー社', 'カフェイン配合', 'active'),
(5, @DEFAULT_TENANT_ID, 'PRD-005', 'フルーツジュース', '4901234567894', 1, '飲料', 250.00, 110.00, '本', 15, 80, 180, 5, 'フルーツ農園', '果汁100%', 'active'),
(6, @DEFAULT_TENANT_ID, 'PRD-006', 'チョコレートバー', '4901234567895', 2, '菓子', 180.00, 80.00, '個', 30, 120, 180, 6, 'スイーツ工房', 'カカオ70%', 'active'),
(7, @DEFAULT_TENANT_ID, 'PRD-007', 'ポテトチップス', '4901234567896', 2, '菓子', 150.00, 70.00, '袋', 25, 100, 90, 7, 'スナック製造', '国産じゃがいも使用', 'active'),
(8, @DEFAULT_TENANT_ID, 'PRD-008', 'クッキー詰め合わせ', '4901234567897', 2, '菓子', 320.00, 150.00, '箱', 15, 60, 120, 8, 'ベーカリー', '手作り風味', 'active'),
(9, @DEFAULT_TENANT_ID, 'PRD-009', 'グミキャンディ', '4901234567898', 2, '菓子', 130.00, 60.00, '袋', 20, 80, 180, 9, 'キャンディ社', 'ビタミンC配合', 'active'),
(10, @DEFAULT_TENANT_ID, 'PRD-010', 'ナッツミックス', '4901234567899', 2, '菓子', 420.00, 200.00, '袋', 15, 60, 180, 10, 'ナッツ商会', '無塩ロースト', 'active'),
(11, @DEFAULT_TENANT_ID, 'PRD-011', 'サンドイッチ', '4901234567900', 3, '食品', 350.00, 180.00, '個', 20, 50, 2, 11, 'デリカ工房', '新鮮野菜使用', 'active'),
(12, @DEFAULT_TENANT_ID, 'PRD-012', 'おにぎり', '4901234567901', 3, '食品', 180.00, 90.00, '個', 30, 80, 1, 12, 'ライス工場', '国産米100%', 'active'),
(13, @DEFAULT_TENANT_ID, 'PRD-013', 'サラダ', '4901234567902', 3, '食品', 280.00, 140.00, '個', 15, 40, 1, 13, 'フレッシュ農園', '有機野菜', 'active'),
(14, @DEFAULT_TENANT_ID, 'PRD-014', '弁当', '4901234567903', 3, '食品', 580.00, 300.00, '個', 10, 30, 1, 14, '弁当屋', '日替わりメニュー', 'active'),
(15, @DEFAULT_TENANT_ID, 'PRD-015', 'パン', '4901234567904', 3, '食品', 220.00, 100.00, '個', 20, 60, 3, 15, 'ベーカリー工房', '焼きたて', 'active');

-- ============================================================
-- 在庫データ
-- ============================================================
INSERT INTO `retail_inventory` (`id`, `tenant_id`, `store_id`, `product_id`, `lot_number`, `quantity`, `expiry_date`, `received_at`, `location`, `status`) VALUES
-- 東京本店
(1, @DEFAULT_TENANT_ID, 1, 1, 'LOT-2026-0101', 50, '2026-12-31', '2026-01-20 09:30:00', 'A-01', 'normal'),
(2, @DEFAULT_TENANT_ID, 1, 2, 'LOT-2026-0102', 8, '2026-12-31', '2026-01-18 10:00:00', 'A-02', 'low'),
(3, @DEFAULT_TENANT_ID, 1, 3, 'LOT-2026-0103', 200, '2027-12-31', '2026-01-15 08:00:00', 'B-01', 'normal'),
(4, @DEFAULT_TENANT_ID, 1, 4, 'LOT-2026-0104', 5, '2026-12-31', '2026-01-20 11:00:00', 'B-02', 'low'),
(5, @DEFAULT_TENANT_ID, 1, 5, 'LOT-2026-0105', 30, '2026-06-30', '2026-01-19 09:00:00', 'B-03', 'normal'),
(6, @DEFAULT_TENANT_ID, 1, 6, 'LOT-2026-0106', 45, '2026-06-30', '2026-01-18 14:00:00', 'D-01', 'normal'),
(7, @DEFAULT_TENANT_ID, 1, 7, 'LOT-2026-0107', 55, '2026-03-31', '2026-01-17 10:00:00', 'D-02', 'normal'),
(8, @DEFAULT_TENANT_ID, 1, 8, 'LOT-2026-0108', 30, '2026-04-30', '2026-01-16 09:00:00', 'D-03', 'normal'),
(9, @DEFAULT_TENANT_ID, 1, 9, 'LOT-2026-0109', 40, '2026-06-30', '2026-01-18 11:00:00', 'D-04', 'normal'),
(10, @DEFAULT_TENANT_ID, 1, 10, 'LOT-2026-0110', 25, '2026-06-30', '2026-01-19 10:15:00', 'D-05', 'normal'),
-- 横浜駅前店
(11, @DEFAULT_TENANT_ID, 2, 1, 'LOT-2026-0201', 45, '2026-12-31', '2026-01-20 13:40:00', 'A-01', 'normal'),
(12, @DEFAULT_TENANT_ID, 2, 2, 'LOT-2026-0202', 35, '2026-12-31', '2026-01-18 08:50:00', 'A-02', 'normal'),
(13, @DEFAULT_TENANT_ID, 2, 3, 'LOT-2026-0203', 180, '2027-12-31', '2026-01-15 09:00:00', 'B-01', 'normal'),
(14, @DEFAULT_TENANT_ID, 2, 7, 'LOT-2026-0207', 12, '2026-03-31', '2026-01-16 10:00:00', 'D-02', 'low'),
(15, @DEFAULT_TENANT_ID, 2, 11, 'LOT-2026-0211', 15, '2026-01-31', '2026-01-29 06:00:00', 'C-01', 'low');

-- ============================================================
-- 入出庫履歴データ
-- ============================================================
INSERT INTO `retail_inventory_transaction` (
  `tenant_id`, `inventory_id`, `store_id`, `product_id`, `lot_number`,
  `txn_type`, `quantity_delta`, `source_type`, `reference_no`, `occurred_at`, `note`
) VALUES
(@DEFAULT_TENANT_ID, 1, 1, 1, 'LOT-2026-0101', 'INBOUND', 120, 'MANUAL', 'IN-20260120-0001', '2026-01-20 09:30:00', '通常入庫（中央倉庫）'),
(@DEFAULT_TENANT_ID, 1, 1, 1, 'LOT-2026-0101', 'SALE', -30, 'POS', 'SALE-20260122-0003', '2026-01-22 14:10:00', ''),
(@DEFAULT_TENANT_ID, 1, 1, 1, 'LOT-2026-0101', 'SALE', -15, 'POS', 'SALE-20260123-0012', '2026-01-23 18:20:00', ''),
(@DEFAULT_TENANT_ID, 10, 1, 10, 'LOT-2026-0110', 'INBOUND', 80, 'MANUAL', 'IN-20260119-0004', '2026-01-19 10:15:00', '通常入庫（中央倉庫）'),
(@DEFAULT_TENANT_ID, 11, 2, 1, 'LOT-2026-0201', 'INBOUND', 110, 'MANUAL', 'IN-20260120-0005', '2026-01-20 13:40:00', '通常入庫（中央倉庫）');

-- ============================================================
-- デバイス初期データ（tenant_id条件付き）
-- ============================================================
INSERT INTO `retail_device` (`tenant_id`, `store_id`, `device_code`, `device_type`, `device_name`, `status`, `last_heartbeat`)
SELECT @DEFAULT_TENANT_ID, s.`id`, CONCAT('DEV-', s.`id`, '-', dt.`sfx`, '-01'), dt.`dtype`, CONCAT(s.`store_name`, ' ', dt.`dname`), 'ONLINE', NOW()
FROM `retail_store` s
CROSS JOIN (
  SELECT 'PAYMENT_TERMINAL' AS dtype, 'POS' AS sfx, '決済端末1号' AS dname
  UNION ALL SELECT 'PRINTER', 'PTR', 'レシートプリンタ'
  UNION ALL SELECT 'NETWORK_ROUTER', 'NET', 'ルーター'
  UNION ALL SELECT 'CAMERA', 'CAM', '監視カメラ1号'
  UNION ALL SELECT 'GATE', 'GAT', '入退店ゲート1号'
  UNION ALL SELECT 'REFRIGERATOR_SENSOR', 'RFS', '冷蔵センサー1号'
) dt
LEFT JOIN `retail_device` d ON d.`device_code` = CONCAT('DEV-', s.`id`, '-', dt.`sfx`, '-01')
  AND d.`tenant_id` = @DEFAULT_TENANT_ID
WHERE s.`is_deleted` = 0
  AND s.`tenant_id` = @DEFAULT_TENANT_ID
  AND d.`id` IS NULL;

-- ============================================================
-- アラートデータ
-- ============================================================
INSERT INTO `retail_alert` (`tenant_id`, `store_id`, `product_id`, `lot_number`, `alert_type`, `priority`, `status`, `message`, `threshold_value`, `current_value`, `detected_at`) VALUES
(@DEFAULT_TENANT_ID, 1, 2, 'LOT-2026-0102', 'LOW_STOCK', 'P2', 'NEW', '在庫切れ警告: オーガニックティー 現在在庫8個、発注点15個', '15', '8', '2026-01-29 10:30:00'),
(@DEFAULT_TENANT_ID, 1, 4, 'LOT-2026-0104', 'LOW_STOCK', 'P1', 'NEW', '在庫切れ警告: エナジードリンク 現在在庫5個、発注点20個', '20', '5', '2026-01-29 11:00:00'),
(@DEFAULT_TENANT_ID, 2, 7, 'LOT-2026-0207', 'LOW_STOCK', 'P2', 'NEW', '在庫切れ警告: ポテトチップス 現在在庫12個、発注点25個', '25', '12', '2026-01-29 12:00:00'),
(@DEFAULT_TENANT_ID, 2, 11, 'LOT-2026-0211', 'EXPIRY_SOON', 'P2', 'NEW', '賞味期限接近: サンドイッチ 賞味期限2026-01-31 残り2日', '7', '2', '2026-01-29 06:00:00');

-- ============================================================
-- 売上データ
-- ============================================================
INSERT INTO `retail_sales` (`id`, `tenant_id`, `store_id`, `order_number`, `total_amount`, `payment_method`, `sale_timestamp`) VALUES
(1, @DEFAULT_TENANT_ID, 1, 'ORD-20260129-001', 2850.00, 'CARD', '2026-01-29 10:15:00'),
(2, @DEFAULT_TENANT_ID, 1, 'ORD-20260129-002', 1580.00, 'CASH', '2026-01-29 11:30:00'),
(3, @DEFAULT_TENANT_ID, 1, 'ORD-20260129-003', 3200.00, 'QR', '2026-01-29 14:20:00'),
(4, @DEFAULT_TENANT_ID, 2, 'ORD-20260129-004', 3200.00, 'QR', '2026-01-29 12:45:00'),
(5, @DEFAULT_TENANT_ID, 2, 'ORD-20260129-005', 2750.00, 'CARD', '2026-01-29 15:10:00'),
(6, @DEFAULT_TENANT_ID, 3, 'ORD-20260129-006', 1950.00, 'CARD', '2026-01-29 13:20:00'),
(7, @DEFAULT_TENANT_ID, 3, 'ORD-20260129-007', 2650.00, 'QR', '2026-01-29 15:40:00'),
(8, @DEFAULT_TENANT_ID, 4, 'ORD-20260129-008', 4100.00, 'CARD', '2026-01-29 14:10:00'),
(9, @DEFAULT_TENANT_ID, 5, 'ORD-20260129-009', 2950.00, 'CARD', '2026-01-29 13:50:00'),
(10, @DEFAULT_TENANT_ID, 5, 'ORD-20260129-010', 3400.00, 'QR', '2026-01-29 16:20:00');

-- ============================================================
-- 売上明細データ（v0.7.1で追加）
-- ============================================================
INSERT INTO `retail_sales_detail` (`tenant_id`, `sales_id`, `product_id`, `lot_number`, `quantity`, `unit_price`, `subtotal`) VALUES
-- ORD-20260129-001: プレミアムコーヒー×3, ナッツミックス×2
(@DEFAULT_TENANT_ID, 1, 1, 'LOT-2026-0101', 3, 450.00, 1350.00),
(@DEFAULT_TENANT_ID, 1, 10, 'LOT-2026-0110', 2, 420.00, 840.00),
-- ORD-20260129-002: ポテトチップス×4, グミキャンディ×5
(@DEFAULT_TENANT_ID, 2, 7, 'LOT-2026-0107', 4, 150.00, 600.00),
(@DEFAULT_TENANT_ID, 2, 9, 'LOT-2026-0109', 5, 130.00, 650.00),
-- ORD-20260129-003: チョコレートバー×6, クッキー詰め合わせ×3
(@DEFAULT_TENANT_ID, 3, 6, 'LOT-2026-0106', 6, 180.00, 1080.00),
(@DEFAULT_TENANT_ID, 3, 8, 'LOT-2026-0108', 3, 320.00, 960.00),
-- ORD-20260129-004: プレミアムコーヒー×2, ミネラルウォーター×10
(@DEFAULT_TENANT_ID, 4, 1, 'LOT-2026-0201', 2, 450.00, 900.00),
(@DEFAULT_TENANT_ID, 4, 3, 'LOT-2026-0203', 10, 120.00, 1200.00),
-- ORD-20260129-005: オーガニックティー×3, フルーツジュース×4
(@DEFAULT_TENANT_ID, 5, 2, 'LOT-2026-0202', 3, 380.00, 1140.00),
(@DEFAULT_TENANT_ID, 5, 5, 'LOT-2026-0105', 4, 250.00, 1000.00),
-- ORD-20260129-006: プレミアムコーヒー×2, チョコレートバー×3
(@DEFAULT_TENANT_ID, 6, 1, 'LOT-2026-0101', 2, 450.00, 900.00),
(@DEFAULT_TENANT_ID, 6, 6, 'LOT-2026-0106', 3, 180.00, 540.00),
-- ORD-20260129-007: ナッツミックス×3, ポテトチップス×5
(@DEFAULT_TENANT_ID, 7, 10, 'LOT-2026-0110', 3, 420.00, 1260.00),
(@DEFAULT_TENANT_ID, 7, 7, 'LOT-2026-0107', 5, 150.00, 750.00),
-- ORD-20260129-008: エナジードリンク×5, ミネラルウォーター×15
(@DEFAULT_TENANT_ID, 8, 4, 'LOT-2026-0104', 5, 280.00, 1400.00),
(@DEFAULT_TENANT_ID, 8, 3, 'LOT-2026-0103', 15, 120.00, 1800.00),
-- ORD-20260129-009: フルーツジュース×5, クッキー詰め合わせ×2
(@DEFAULT_TENANT_ID, 9, 5, 'LOT-2026-0105', 5, 250.00, 1250.00),
(@DEFAULT_TENANT_ID, 9, 8, 'LOT-2026-0108', 2, 320.00, 640.00),
-- ORD-20260129-010: プレミアムコーヒー×4, チョコレートバー×5
(@DEFAULT_TENANT_ID, 10, 1, 'LOT-2026-0101', 4, 450.00, 1800.00),
(@DEFAULT_TENANT_ID, 10, 6, 'LOT-2026-0106', 5, 180.00, 900.00);

-- ============================================================
-- END OF FILE
-- ============================================================
