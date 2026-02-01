# Issue #13: v1.1対応 - アラート自動クローズ・重複抑制機能

**作成日**: 2026-02-01
**対応バージョン**: v1.1
**優先度**: 中
**ステータス**: 未着手

---

## 1. 概要

要件定義書(smart-retail-requirements.md) v1.1で明確化されたアラート自動クローズ条件および重複アラート抑制ロジックの実装。

---

## 2. 変更根拠

### 2.1 要件定義書 v1.1 変更内容（セクション5.5）

**自動クローズ条件**:
- 条件解消検知後、`IN_PROGRESS` のみ自動で `RESOLVED` へ遷移
- 条件解消後24時間で自動 `CLOSED`
- `NEW/ACK` は自動クローズ対象外

**重複アラート抑制**:
- 同一商品・同一種別の未解決アラートが存在する場合は新規生成しない
- 条件悪化時は既存アラートの優先度を上げる（状態昇格）

### 2.2 アラート検出ロジック整合性修正

- LOW_STOCK: 有効在庫合計 ≤ reorder_point（期限切れロット除外）
- EXPIRY_SOON: ロット単位判定、残日数による優先度分岐
- HIGH_STOCK: 有効在庫合計 ≥ max_stock_level × 1.5

---

## 3. 実装スコープ

### 3.1 バックエンド

#### 3.1.1 アラート自動状態遷移

**条件解消検知ロジック**:
```java
// 定期バッチで実行（1時間毎）
public void checkAlertResolution() {
    // IN_PROGRESSのアラートを取得
    List<Alert> inProgressAlerts = alertMapper.findByStatus("IN_PROGRESS");

    for (Alert alert : inProgressAlerts) {
        if (isConditionResolved(alert)) {
            alert.setStatus("RESOLVED");
            alert.setResolvedAt(LocalDateTime.now());
            alertMapper.updateById(alert);
        }
    }
}

// RESOLVED後24時間経過でCLOSED
public void autoCloseResolvedAlerts() {
    LocalDateTime threshold = LocalDateTime.now().minusHours(24);
    alertMapper.closeResolvedAlertsBefore(threshold);
}
```

#### 3.1.2 重複アラート抑制

**アラート生成前チェック**:
```java
public boolean shouldCreateAlert(Long storeId, Long productId, String alertType) {
    // 未解決アラート（NEW, ACK, IN_PROGRESS）が存在するかチェック
    Alert existing = alertMapper.findActiveAlert(storeId, productId, alertType);
    return existing == null;
}

public void escalatePriority(Alert existing, String newPriority) {
    // 新しい優先度が高い場合のみ昇格
    if (isPriorityHigher(newPriority, existing.getPriority())) {
        existing.setPriority(newPriority);
        alertMapper.updateById(existing);
    }
}
```

#### 3.1.3 アラート検出ロジック修正

**LOW_STOCK判定**:
- 有効在庫 = Σ（quantity > 0 かつ expiry_date >= CURRENT_DATE のロット）
- 有効在庫 ≤ reorder_point でアラート生成

**EXPIRY_SOON判定**:
- ロット単位で判定
- 残日数 ≤ 1日: P1
- 残日数 2-3日: P2
- 残日数 4-7日: P3

**HIGH_STOCK判定**:
- 有効在庫 ≥ max_stock_level × 1.5 でアラート生成
- 賞味期限あり商品: P2
- その他: P3

---

## 4. 成果物

### 4.1 バックエンド

- [ ] `AlertAutoCloseJob.java`（バッチジョブ）
- [ ] `AlertDetectionService.java` 拡張（重複チェック、優先度昇格）
- [ ] `AlertMapper.java` 拡張（findActiveAlert, closeResolvedAlertsBefore）
- [ ] `AlertMapper.xml` 拡張
- [ ] テストコード追加

### 4.2 バッチ設定

- [ ] PowerJob設定（自動クローズジョブ: 1時間毎）
- [ ] PowerJob設定（24時間経過CLOSED処理: 日次）

---

## 5. 前提条件

- Issue #5-1（アラート管理機能バックエンド）の基本実装完了
- Issue #4-1（在庫管理機能バックエンド）の基本実装完了

---

## 6. 完了条件

- [ ] IN_PROGRESSアラートが条件解消時に自動でRESOLVEDになる
- [ ] RESOLVED後24時間経過でCLOSEDになる
- [ ] NEW/ACKは自動クローズ対象外であること
- [ ] 同一条件のアラートが重複生成されないこと
- [ ] 条件悪化時に既存アラートの優先度が昇格すること
- [ ] テストコード追加・全テストパス

---

## 7. 参照

- 要件定義書: `docs/architecture/design/smart-retail-requirements.md` v1.1 セクション5.2, 5.5

---

## 8. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-02-01 | 1.0 | 初版作成 |
