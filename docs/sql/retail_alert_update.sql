-- アラートテーブル構造更新スクリプト
-- Issue #15: [Phase 1 Backend] アラート管理機能

-- 既存テーブルが存在する場合は削除して再作成
DROP TABLE IF EXISTS retail_alert;

-- アラートテーブル作成
CREATE TABLE retail_alert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'アラートID',
    store_id BIGINT NOT NULL COMMENT '店舗ID',
    product_id BIGINT COMMENT '商品ID',
    device_id BIGINT COMMENT 'デバイスID',
    lot_number VARCHAR(50) COMMENT 'ロット番号',
    alert_type ENUM('LOW_STOCK', 'EXPIRY_SOON', 'HIGH_STOCK', 'COMMUNICATION_DOWN', 'PAYMENT_TERMINAL_DOWN') NOT NULL COMMENT 'アラートタイプ',
    priority ENUM('P1', 'P2', 'P3', 'P4') NOT NULL COMMENT '優先度',
    status ENUM('NEW', 'ACK', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'NEW' COMMENT 'ステータス',
    message VARCHAR(500) COMMENT 'アラートメッセージ',
    threshold_value VARCHAR(50) COMMENT 'しきい値',
    current_value VARCHAR(50) COMMENT '現在値',
    detected_at DATETIME NOT NULL COMMENT '検知日時',
    acknowledged_at DATETIME COMMENT '確認日時',
    resolved_at DATETIME COMMENT '解決日時',
    closed_at DATETIME COMMENT 'クローズ日時',
    resolution_note TEXT COMMENT '解決メモ',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    KEY idx_alert_store_status (store_id, status, detected_at),
    KEY idx_alert_type_priority (alert_type, priority),
    CONSTRAINT fk_alert_store FOREIGN KEY (store_id) REFERENCES retail_store(id),
    CONSTRAINT fk_alert_product FOREIGN KEY (product_id) REFERENCES retail_product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='アラート';

-- インデックス追加
CREATE INDEX idx_alert_detected_at ON retail_alert(detected_at);
CREATE INDEX idx_alert_status ON retail_alert(status);

-- サンプルデータ挿入（テスト用）
INSERT INTO retail_alert (store_id, product_id, lot_number, alert_type, priority, status, message, threshold_value, current_value, detected_at) VALUES
(1, 1, NULL, 'LOW_STOCK', 'P1', 'NEW', '[在庫切れ警告] 店舗: 東京本店, 商品: プレミアムコーヒー, 現在在庫: 2個, 発注点: 10個', '10', '2', NOW()),
(1, 2, 'LOT-2026-0201', 'EXPIRY_SOON', 'P2', 'NEW', '[賞味期限接近] 店舗: 東京本店, 商品: オーガニックティー, ロット: LOT-2026-0201, 賞味期限まで3日', '7', '3', NOW()),
(2, 3, NULL, 'HIGH_STOCK', 'P3', 'NEW', '[在庫過多] 店舗: 横浜駅前店, 商品: ミネラルウォーター, 現在在庫: 150個, 適正上限: 100個', '150', '150', NOW());
