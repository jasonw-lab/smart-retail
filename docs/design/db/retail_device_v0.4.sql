-- ============================================================
-- Smart Retail Database Schema v0.4 - Device Table Addition
-- ============================================================
-- 目的: デバイス管理テーブルの追加（PowerJob External World Simulator対応）
-- 参照: ADR-004, Issue #38, #40
--
-- 更新履歴:
--   v0.4 (2026-02-11): デバイステーブル追加
-- ============================================================

use youlai_boot;

-- ============================================================
-- 5. デバイス管理テーブル
-- ============================================================

-- ----------------------------
-- 5.1 デバイスマスタ (retail_device)
-- ----------------------------
-- 説明: 店舗に設置されたデバイスの状態を管理
-- 用途: Heartbeat監視、障害検知、デバイス状態表示
-- 特記:
--   - device_typeでデバイス種別を管理
--   - last_heartbeatで最終通信時刻を記録（沈黙監視用）
--   - metadataにデバイス固有情報をJSON形式で格納
-- ----------------------------
CREATE TABLE IF NOT EXISTS `retail_device` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'デバイスID（主キー）',
  `store_id` bigint NOT NULL COMMENT '店舗ID',
  `device_code` varchar(50) NOT NULL COMMENT 'デバイスコード（一意、例: DEV-1-POS-01）',
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
  UNIQUE KEY `uk_device_code` (`device_code`) COMMENT 'デバイスコードはユニーク',
  KEY `idx_device_store` (`store_id`) COMMENT '店舗別デバイス検索用',
  KEY `idx_device_status` (`status`) COMMENT 'ステータス検索用',
  KEY `idx_device_heartbeat` (`last_heartbeat`) COMMENT '最終Heartbeat検索用（沈黙監視）',
  CONSTRAINT `fk_device_store` FOREIGN KEY (`store_id`) REFERENCES `retail_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='デバイスマスタ';

-- ============================================================
-- デモ用初期データ
-- ============================================================

-- 全店舗 × デバイス種別を一括投入（再実行可）
-- 既存device_codeは除外するため、何度実行しても重複登録されない
INSERT INTO `retail_device` (`store_id`, `device_code`, `device_type`, `device_name`, `status`, `last_heartbeat`)
SELECT
  s.`id` AS `store_id`,
  CONCAT('DEV-', s.`id`, '-', dt.`device_code_suffix`, '-01') AS `device_code`,
  dt.`device_type`,
  CONCAT(s.`store_name`, ' ', dt.`device_name_suffix`) AS `device_name`,
  'ONLINE' AS `status`,
  NOW() AS `last_heartbeat`
FROM `retail_store` s
CROSS JOIN (
  SELECT 'PAYMENT_TERMINAL' AS `device_type`, 'POS' AS `device_code_suffix`, '決済端末1号' AS `device_name_suffix`
  UNION ALL
  SELECT 'PRINTER', 'PTR', 'レシートプリンタ'
  UNION ALL
  SELECT 'NETWORK_ROUTER', 'NET', 'ルーター'
  UNION ALL
  SELECT 'CAMERA', 'CAM', '監視カメラ1号'
  UNION ALL
  SELECT 'GATE', 'GAT', '入退店ゲート1号'
  UNION ALL
  SELECT 'REFRIGERATOR_SENSOR', 'RFS', '冷蔵センサー1号'
) dt
LEFT JOIN `retail_device` d
  ON d.`device_code` = CONCAT('DEV-', s.`id`, '-', dt.`device_code_suffix`, '-01')
WHERE s.`is_deleted` = 0
  AND d.`id` IS NULL;

-- ============================================================
-- END OF FILE
-- ============================================================
