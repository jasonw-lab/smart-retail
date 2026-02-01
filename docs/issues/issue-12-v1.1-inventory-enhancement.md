# Issue #12: v1.1対応 - 在庫管理機能強化

**作成日**: 2026-02-01
**対応バージョン**: v1.1
**優先度**: 高
**ステータス**: 実装完了

---

## 1. 概要

要件定義書(smart-retail-requirements.md) v1.1およびUI設計書(smart-retail-ui-design.md) v1.1で追加された在庫管理機能の強化実装。

---

## 2. 変更根拠

### 2.1 要件定義書 v1.1 変更内容

| セクション | 変更内容 |
|-----------|---------|
| 8.1.1 | ロット運用（補充/減算）ルールの明記 |
| 8.1.1 | FEFO引当ロジック（期限切れロット除外） |
| 8.1.1 | I-01に「廃棄（在庫調整）」記録を追加 |
| 8.4 | inventory_transactionテーブルの追加 |

### 2.2 UI設計書 v1.1 変更内容

| セクション | 変更内容 |
|-----------|---------|
| 6.2 | ロット管理UI仕様明文化（集約行の最古期限定義） |
| 6.3.2 | 期限切れ状態表示と判定優先順位の追加 |
| 6.3.4 | 廃棄（在庫調整）ダイアログ追加 |
| 6.3.5 | 履歴表示ダイアログ追加 |
| 6.3.1 | 状態フィルタに「期限切れ」追加 |

---

## 3. 実装スコープ

### 3.1 データベース

**inventory_transactionテーブル追加**:
```sql
CREATE TABLE inventory_transaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    transaction_type ENUM('SALE', 'STOCK_IN', 'ADJUSTMENT', 'DISCARD', 'TRANSFER') NOT NULL,
    quantity_change INT NOT NULL,
    reference_id VARCHAR(100),
    note VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    INDEX idx_inventory_tx_inventory (inventory_id),
    INDEX idx_inventory_tx_type (transaction_type),
    INDEX idx_inventory_tx_created_at (created_at)
);
```

### 3.2 バックエンドAPI

| API | メソッド | パス | 説明 |
|-----|---------|------|------|
| 廃棄登録 | POST | /api/v1/retail/inventory/{id}/discard | ロット指定での在庫廃棄 |
| 履歴取得 | GET | /api/v1/retail/inventory/{storeId}/{productId}/transactions | 入出庫履歴一覧 |
| 在庫一覧 | GET | /api/v1/retail/inventory | 期限切れフィルタ追加 |

### 3.3 状態判定ロジック

**優先順位**:
| 優先度 | 状態 | 条件 | 表示色 |
|--------|------|------|--------|
| 1 | EXPIRED | `expiry_date < today` のロットあり | 🔴 赤 |
| 2 | LOW_STOCK | 合計在庫 ≤ 発注点 | 🔴 赤 |
| 3 | EXPIRY_SOON | 最古期限 ≤ 3日後 | 🟠 橙 |
| 4 | HIGH_STOCK | 合計在庫 ≥ 適正上限×1.5 | 🟡 黄 |
| 5 | NORMAL | 上記以外 | 🟢 緑 |

### 3.4 フロントエンドUI

- 廃棄ダイアログ（DiscardDialog.vue）
- 履歴表示ダイアログ（TransactionHistory.vue）
- 状態フィルタ拡張（「期限切れ」追加）
- 状態カラー表示

---

## 4. 成果物

### 4.1 バックエンド

- [x] `InventoryTransaction.java`（entity）- 既存
- [x] `InventoryTransactionMapper.java` / `.xml` - 既存
- [x] `InventoryStatus.java`（enum）- 新規作成
- [x] `DiscardForm.java` - 新規作成
- [x] `InventoryTransactionVO.java` - 既存
- [x] `InventoryPageVO.java` 拡張（status, statusLabel, statusColor, hasExpiredLot, daysUntilExpiry）
- [x] `InventoryPageQuery.java` 拡張（statusフィルタ, expiredOnly）
- [x] `InventoryServiceImpl.java` 拡張（discardInventory, applyInventoryStatus）
- [x] `InventoryController.java` 拡張（廃棄API: POST /{id}/discard）
- [x] テストコード追加（廃棄API, 期限切れフィルタ）

### 4.2 フロントエンド

- [x] `api/retail/inventory.ts` - 新規作成（API定義、型定義、状態オプション）
- [x] `views/retail/inventory/index.vue` - 新規作成（在庫一覧、廃棄ダイアログ、履歴ダイアログ）
- [x] `router/index.ts` - ルーティング更新

---

## 5. 前提条件

- Issue #4-1（在庫管理機能バックエンド）完了
- Issue #4-2（在庫管理機能フロントエンド）完了

---

## 6. 完了条件

- [x] 廃棄APIで指定ロットの在庫が減算される
- [x] 入出庫履歴が正しく記録・取得できる
- [x] 期限切れロットを含むSKUが「期限切れ」状態で表示される
- [x] 状態判定が優先順位通りに動作する
- [x] 状態フィルタで「期限切れ」を選択すると対象のみ表示される
- [x] テストコード追加（バックエンド）
- [x] フロントエンド廃棄ダイアログ実装
- [x] フロントエンド状態フィルタUI実装
- [x] フロントエンド履歴表示ダイアログ実装
- [x] ビルド成功確認

---

## 7. 参照

- 要件定義書: `docs/architecture/design/smart-retail-requirements.md` v1.1
- UI設計書: `docs/architecture/design/smart-retail-ui-design.md` v1.1

---

## 8. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-02-01 | 1.0 | 初版作成（#12, #14を統合） |
| 2026-02-01 | 1.1 | バックエンド実装完了（InventoryStatus enum, DiscardForm, 廃棄API, 状態判定ロジック, テストコード） |
| 2026-02-01 | 1.2 | フロントエンド実装完了（API定義, 在庫一覧画面, 廃棄ダイアログ, 履歴ダイアログ, ルーティング） |
