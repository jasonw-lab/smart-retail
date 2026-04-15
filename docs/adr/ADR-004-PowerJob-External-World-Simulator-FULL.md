# ADR-004: PowerJob を用いた External World Simulator 設計

## ステータス
Accepted

---

## 背景・コンテキスト

Smart Retail Backend は、店舗・決済端末といった **外部世界（External World）** から送信される
Heartbeat や決済結果をもとに、稼働監視・異常検知・アラート管理を行う。

本番環境では、これらの外部世界は以下のような実体を持つ。

- 店舗ゲートウェイ
- 決済端末
- Edge Agent / MDM 管理端末

一方、デモ・PoC 環境では実際の端末やネットワーク環境を用意できないため、
**外部世界の振る舞いを安全かつ再現性高く模擬する仕組み**が必要となる。

---

## 決定事項（Decision）

本デモでは、外部世界（店舗・決済端末）を再現するためのシミュレーター基盤として
**PowerJob** を採用する。

- PowerJob Worker を「店舗」や「決済端末」に見立てる
- PowerJob Job により heartbeat / 決済試行などの定期通信を再現する
- Smart Retail Backend は PowerJob の存在を意識せず、
  受信した事実（時刻・結果）のみを記録・判定する
- PowerJob は Backend ドメインの一部ではなく、
  **明確に外部システムとして分離**して配置する

---

## PowerJob 採用理由

1. **外部世界の振る舞いを自然に再現できる**
2. **障害注入（通信断・決済端末停止）が容易**
3. **管理 UI による可視性と操作性**
4. **Backend との責務分離を維持できる**
5. **本番構成への移行説明が容易**

---

## ベストプラクティス（技術選定の整理）

| 処理内容 | 採用技術 | 選定理由 |
| --- | --- | --- |
| 通信・端末監視 | Spring @Scheduled | 沈黙監視は Backend の責務 |
| 日次売上集計 | Spring Batch / @Scheduled | 冪等性・再実行性 |
| 疑似端末 | PowerJob | 外部世界の再現 |
| 障害再現 | PowerJob | 障害注入が容易 |
| 分析（将来） | Airflow | ETL / 分析専用 |

---

## シーケンス図（フロー）

### 正常系（Heartbeat）

```text
PowerJob Worker        Smart Retail Backend
      |                        |
      | heartbeatJob           |
      | POST /api/heartbeat    |
      |----------------------->|
      |                        |
      |                        | lastSeen 更新
```

### 異常系（通信断）

```text
Backend Scheduler      Smart Retail Backend
      |                        |
      | 定期チェック            |
      |----------------------->|
      |                        |
      |                        | lastSeen > threshold
      |                        | COMMUNICATION_DOWN
```

### 正常系（決済）

```text
PowerJob Worker        Smart Retail Backend
      |                        |
      | paymentJob             |
      | POST /api/payments     |
      |----------------------->|
      |                        |
      |                        | lastPaymentAt 更新
```

### 異常系（決済端末停止）

```text
Backend Scheduler      Smart Retail Backend
      |                        |
      | 定期チェック            |
      |----------------------->|
      |                        |
      |                        | heartbeat 正常
      |                        | lastPaymentAt > threshold
      |                        | PAYMENT_TERMINAL_DOWN
```

---

## 影響・結果（Consequences）

- Backend は本番そのまま利用可能
- 外部世界のみ差し替え可能な構成
- デモで監視・障害説明が可能

---

## 将来展望

本番環境では PowerJob Worker を以下に置き換える。

- 店舗ゲートウェイ
- 決済端末
- Edge Agent / MDM 管理端末

**採用する方式**: Heartbeatペイロードの拡張を採用します。

**理由**:
1. 売上ベースの推測は不確実（夜間・閑散期の誤検知リスク）
2. デバイス自己診断結果を直接受信することで確実な障害検知が可能
3. PowerJob側で `simulateDeviceFailure` ジョブを作成し、デモでの障害シミュレーションも容易

**Heartbeat ペイロード拡張仕様（採用）**:
```json
{
  "storeId": "STORE-001",
  "timestamp": "2026-01-28T10:30:00Z",
  "deviceStats": {
    "paymentTerminal": {
      "status": "ONLINE",  // ONLINE / OFFLINE / ERROR
      "cardReaderConnected": true,
      "lastSelfTestAt": "2026-01-28T10:25:00Z",
      "errorCode": null
    },
    "printer": {
      "status": "ONLINE",
      "paperLevel": "OK"  // OK / LOW / EMPTY
    },
    "network": {
      "latencyMs": 45,
      "signalStrength": "GOOD"  // GOOD / FAIR / POOR
    }
  }
}
```

**障害検知ロジック（更新後）**:
| 検知条件 | アラート種別 | 優先度 |
|---------|------------|--------|
| Heartbeat未受信（5分超過）| 通信断 | P1 |
| `deviceStats.paymentTerminal.status` = OFFLINE/ERROR | 決済端末停止 | P1 |
| `deviceStats.paymentTerminal.cardReaderConnected` = false | カードリーダー異常 | P1 |
| `deviceStats.printer.paperLevel` = EMPTY | プリンター用紙切れ | P3 |

本ADRのシーケンス図「異常系（決済端末停止）」は、上記の `deviceStats` ベースの判定に更新予定です。
