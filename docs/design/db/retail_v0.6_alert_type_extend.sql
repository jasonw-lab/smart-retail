-- ============================================================
-- Smart Retail Database Migration v0.6
-- ============================================================
-- 目的: アラートタイプの拡張（沈黙監視対応）
-- 対象: retail_alert.alert_type ENUM
--
-- 追加するアラートタイプ:
--   - CARD_READER_ERROR: カードリーダー異常（P1）
--   - PRINTER_PAPER_EMPTY: プリンター用紙切れ（P3）
--
-- 準拠ドキュメント:
--   - plan_powerjob.md PJ-6: 沈黙監視（Silent Monitoring）実装
--   - ADR-004-PowerJob-External-World-Simulator-FULL.md
--
-- 更新履歴:
--   v0.6 (2026-02-15): アラートタイプ拡張
--     - CARD_READER_ERROR追加: paymentTerminal.cardReaderConnected = false
--     - PRINTER_PAPER_EMPTY追加: printer.paperLevel = EMPTY
-- ============================================================

USE youlai_boot;

-- アラートタイプENUMの拡張
-- 既存: LOW_STOCK, EXPIRY_SOON, HIGH_STOCK, COMMUNICATION_DOWN, PAYMENT_TERMINAL_DOWN
-- 追加: CARD_READER_ERROR, PRINTER_PAPER_EMPTY
ALTER TABLE `retail_alert`
MODIFY COLUMN `alert_type` enum(
  'LOW_STOCK',
  'EXPIRY_SOON',
  'HIGH_STOCK',
  'COMMUNICATION_DOWN',
  'PAYMENT_TERMINAL_DOWN',
  'CARD_READER_ERROR',
  'PRINTER_PAPER_EMPTY'
) NOT NULL COMMENT 'アラートタイプ（要件定義§5.2 + PJ-6沈黙監視拡張）';

-- 確認用クエリ
-- SHOW COLUMNS FROM retail_alert LIKE 'alert_type';
