# ADR-011: Vue版との後方互換性を維持するRetail API拡張

## ステータス

Proposed (2026-07-19)

## 背景

`_docs/api-modifications.html` では、Next.js 版の UI を正として Backend API との不足項目を整理している。一方、同じ `/api/v1` は移行元の Vue 3 版（`../smart-retail-dx/apps/frontend`）も利用しているため、既存エンドポイントのレスポンス形式や値の意味を Next.js 版に合わせて置き換えると、Vue 版に広範な修正が必要になる。

現行実装を照合すると、特に次の差異がある。

- `GET /api/v1/retail/inventories` は Backend と Vue 版ではロット単位の配列だが、Next.js 版 UI は店舗・SKU 単位の集約と `lots` を必要とする。
- Vue 版は `POST /api/v1/retail/inventories/{id}/discard` と `{ quantity, reason, remarks }` をすでに呼び出すが、現行 Backend に同エンドポイントがない。これは移行で新たに追加する機能ではなく、Vue 版に残る未実装 API 呼出（現状は 404）の修復対象である。
- アラートの業務ステータス（NEW、ACK、RESOLVED 等）と、利用者が一覧を読んだかどうかは異なる概念だが、Next.js 版は現状これらを代替利用している。
- 通知の現行 Backend と Vue 版 UI は `level: L | M | H`、`targetType: 1 | 2` を使用する。Next.js 版は一覧表示に `priority: 0 | 1 | 2`、対象種別に `0 | 1` も使用しており、二重表現になっている。
- 決済受信の現行 Backend 契約は `totalAmount`、`paymentReferenceId`、`saleTimestamp`、`items` だが、Next.js 版の型は `amount`、`referenceId`、`transactionTime`、`details` である。
- 現行 E2E mock は実在するロット API `/retail/inventories` から `lots`、`totalQuantity`、固定の `turnoverRate` を持つ集約形式を返している。実 Backend 契約とはすでに乖離しており、現在の E2E はこの契約差分を検出できない状態で green になっている。

移行期間中は Vue 版と Next.js 版を同時に動作させる必要がある。API の単純な置換ではなく、既存契約を保った追加型の拡張が必要である。

## 決定

### 1. `/api/v1` は追加型で進化させる

既存 URL、HTTP メソッド、レスポンスのトップレベル形式、既存フィールドの名前・型・意味は変更しない。

- 任意のレスポンスフィールドと任意の検索パラメータの追加は許可する。
- 配列からページ形式、ロット単位から SKU 集約単位など、リソース粒度またはトップレベル形式が変わる場合は新規エンドポイントを追加する。
- 列挙値は表示文言ではなく安定したコードを API 契約とし、表示文言は各 frontend で国際化する。
- 既存フィールドを廃止する場合は、別バージョンの API と移行期限を先に定義する。少なくとも Vue 版の廃止までは `/api/v1` から削除しない。
- Backend の OpenAPI、`docs/api-interface-design.html`、E2E mock を Backend 実装と同じ変更で更新する。

### 2. 在庫はロット API を維持し、集約 API を追加する

既存の `GET /api/v1/retail/inventories` と `GET /api/v1/retail/inventories/{id}` はロット単位の契約を維持する。Vue 版は変更しない。

Next.js 版の一覧用に、次の読取専用 API を追加する。

```http
GET /api/v1/retail/inventory-summaries
  ?storeId=&productId=&productName=&status=
```

レスポンスは配列のままとし、店舗・SKU 単位で次の項目を返す。

```json
[
  {
    "summaryKey": "1-100",
    "storeId": 1,
    "storeName": "東京店",
    "productId": 100,
    "productCode": "P-0100",
    "productName": "商品A",
    "totalQuantity": 30,
    "reorderPoint": 10,
    "upperLimit": 50,
    "oldestExpiryDate": "2026-08-01",
    "status": "NORMAL",
    "lots": [
      {
        "id": 101,
        "lotNumber": "LOT-001",
        "quantity": 30,
        "expiryDate": "2026-08-01"
      }
    ],
    "turnoverRate": null
  }
]
```

- 集約行には更新対象と誤認する数値 `id` を設けず、表示上の識別子として現行 mapper の grouping key と同じ `summaryKey = "{storeId}-{productId}"` を返す。
- 詳細・更新・廃棄と既存ロットへの補充は `lots[].id` でロットを指定する。新規ロットの補充は `storeId`、`productId`、新しい `lotNumber` で指定する。
- `inventoryId` は一貫してロット単位の在庫レコード ID を意味する。集約 ID として利用しない。
- `status` は既存 Backend コード（`EXPIRED`、`LOW_STOCK`、`EXPIRY_SOON`、`HIGH_STOCK`、`NORMAL`）を正とする。Next.js 版の表示用コードへの変換は mapper に残す。
- `turnoverRate` は期間と計算式が業務上確定するまでは `null` とし、UI は `-` を表示する。計算式を決めずに仮値を返さない。

当面は全件配列を返し、Next.js 版で集約行をページングする。データ量からサーバーページングが必要になった場合は `/api/v1/retail/inventory-summaries/page` を追加し、集約後の行を単位として `PageResult` を返す。既存の配列レスポンスはページ形式へ変更しない。

Vue 版がすでに利用している次の API を Backend に実装する。

```http
POST /api/v1/retail/inventories/{inventoryId}/discard
Content-Type: application/json

{
  "quantity": 2,
  "reason": "期限切れ",
  "remarks": "棚卸時に確認"
}
```

`reason` は監査履歴に残す必須の自由記述（1〜100文字）とする。Vue 版の既存選択肢は入力補助であり、API の列挙値とは扱わない。将来、集計用の区分が必要になった場合は安定したコード値を持つ `reasonCode` を別フィールドとして追加し、`reason` の意味を変更しない。`remarks` は任意の補足（最大500文字）とする。

`quantity` は1以上の整数を必須とし、対象ロットの現在数量以下でなければならない。形式・必須条件の違反は 400、同時更新等により残量が不足した場合は 409 とし、在庫を負数にしない。

Backend は対象ロットの数量減算と `reason` を含む `DISPOSAL` 取引履歴の登録を、排他制御を伴う同一トランザクションで行う。既存の `POST /api/v1/retail/inventory-transactions/outbound` は維持し、`InventoryTransactionForm` と `InventoryTransactionPageVO` に任意の `reason` を追加して永続化・返却する。現行 Next.js 版は outbound request に `reason` と `note` を別フィールドで送信済みだが、Backend が `reason` を受理・永続化しない点が問題である。Next.js 版の廃棄処理も最終的に `/{inventoryId}/discard` へ寄せる。

### 3. アラート検索は追加パラメータ、既読は別リソースとする

`GET /api/v1/retail/alerts` の配列レスポンスは維持し、次の任意パラメータを追加する。

```text
storeId, status, priority, category
```

`AlertPageVO` に任意の `category` と `read` を追加する。

- `category` は `INVENTORY`、`DEVICE`、`TEMPERATURE`、`PAYMENT`、`OTHER` のコードとする。
- 当面は `alertType` から Backend で導出し、カテゴリ固有の永続化要件が生じるまでは重複保存しない。
- Vue 版は追加フィールドを無視できるため、既存の一覧・詳細・ステータス更新処理を変更しない。

既読状態は ACK/RESOLVED 等の業務ステータスから分離し、利用者単位で管理する。

```http
PATCH /api/v1/retail/alerts/{id}/read
Content-Type: application/json

{ "read": true }
```

`PATCH /{id}/status` は従来どおり業務ワークフロー専用とする。既読情報は `(userId, alertId)` を一意キーとする関連データとして保持し、未登録時は `read: false` とする。Next.js 版の既読ボタンだけが新 API を利用し、Vue 版には変更を要求しない。

`read` は利用者依存情報であるため、アラート一覧・詳細レスポンスを利用者間で共有キャッシュしない。Next.js の Server Component から取得する場合も ADR-010 に従い、原則 `no-store` とする。

アラートのページングが必要になった場合は `/api/v1/retail/alerts/page` を追加する。既存の配列レスポンスをページ形式へ変更しない。

### 4. 通知は Backend/Vue の `level` 契約に統一する

通知優先度の API 表現は次を正とする。

```text
level: L | M | H
targetType: 1（全員）| 2（指定ユーザー）
```

Backend に数値 `priority` や `targetType: 0 | 1` の別表現を追加しない。Next.js 版は次のように修正する。

- `features/system/types/notice.ts` の `Notice` / `NoticeForm` から `priority` を削除し、`level: "L" | "M" | "H"` と `targetType: 1 | 2` を型として明示する。
- 作成・更新では `level` のみ送信し、`priority` を送信しない。
- 一覧は `level` から表示ラベルと badge を決定する。
- `targetType` のフォーム値を 1/2 に揃える。

Vue 版は実行時にすでに `level` と 1/2 を使用しているため、API 呼び出しと画面は変更しない。Vue 版の型定義 `../smart-retail-dx/apps/frontend/src/api/system/notice.api.ts` にある `NoticePageVO.priority` を `level?: "L" | "M" | "H"` に直す型のみの修正を行う。Backend の Java `NoticePageVO` はすでに `level` を使用しているため変更しない。

### 5. 決済は現行 Backend 契約を維持する

`POST /api/v1/retail/payments` は現行 Backend の次の契約を正とし、Backend と Vue 版は変更しない。

| Next.js 版の現在名 | Backend の正規名     |
| ------------------ | -------------------- |
| `amount`           | `totalAmount`        |
| `referenceId`      | `paymentReferenceId` |
| `transactionTime`  | `saleTimestamp`      |
| `details`          | `items`              |

Next.js 版の API client で正規名へ変換する。明細は `productId`、`quantity`、`unitPrice` を送信し、表示専用の `productName` は送信契約に含めない。この機能には専用 UI がまだないため、Backend API の変更は UI 実装時まで発生させない。

### 6. 要件未確定の API は追加しない

次の項目は本 ADR の Backend 実装対象外とする。

- ダッシュボード天気: 情報源、対象店舗の位置、キャッシュ時間、障害時表示が未決定のため、現在の placeholder を維持する。
- 在庫回転率の実計算: 対象期間、数量基準か金額基準か、平均在庫の算出方法が未決定のため `null` を維持する。
- 決済管理画面向けの追加項目: UI とユースケースができた時点で別途契約を決める。

これらは要件確定後に個別 ADR または本 ADR の改訂として扱う。

## Vue版の最小修正範囲

| 項目           | Vue版の対応                                          |
| -------------- | ---------------------------------------------------- |
| 在庫一覧・詳細 | 変更なし。既存ロット API を継続利用                  |
| 在庫廃棄       | 変更なし。既存呼出先を Backend が実装                |
| アラート       | 変更なし。追加フィールド・検索条件は利用しなくてよい |
| 通知           | Vue の `notice.api.ts` の型を `level` に合わせるだけ |
| 決済           | 現在利用箇所がないため変更なし                       |
| 天気・回転率   | 変更なし                                             |

Vue 版の必須 runtime 修正はゼロとし、推奨修正は通知の型定義 1 箇所に限定する。

## 実装順序

1. 現行 Vue 契約を固定する Backend 結合テストを追加する。
   - `GET /retail/inventories` がロット配列を返すこと
   - `GET /retail/alerts` が配列を返し、既存 `storeId/status` が動くこと
   - 通知が `level` と `targetType: 1 | 2` を返すこと
   - 決済が現行正規名を受け付けること
2. Backend に在庫廃棄 API、取引理由、在庫集約 API を追加する。
3. Backend にアラートの追加 filter/category と利用者別既読 API を追加する。
4. `docs/api-interface-design.html`、OpenAPI、`_docs/api-modifications.html`、Next.js の E2E mock を更新する。mock の `/retail/inventories` をロット形式へ戻し、`/retail/inventory-summaries` を集約形式で追加し、未定義の `turnoverRate` を `null` にする。在庫 VRT の期待画像も契約に合わせて更新する。
5. Next.js 版を次の契約へ切り替える。
   - `Inventory` 型の集約行 `id` を `summaryKey` に置き換え、一覧の React key には `summaryKey`、詳細・更新・廃棄と既存ロットへの補充には `lots[].id` を使用する。
   - 集約在庫 API、廃棄 API、アラート既読 API を利用する。
   - 通知を `level` / `targetType: 1 | 2`、決済を Backend の正規フィールド名に揃える。
6. Vue 版は通知の型定義だけを修正し、既存 E2E または smoke test で回帰確認する。

Backend 追加後、Next.js 切替前の期間も既存 Vue 版はそのまま動作できる順序とする。

## 受入条件

- Vue 版の既存 API 呼び出し URL、request body、主要 response body が変更前後で同じである。
- `GET /retail/inventories` のロット数と ID が Backend 追加前後で変わらない。
- `GET /retail/inventory-summaries` の `lots[].id` が既存ロット ID と一致する。
- 廃棄処理で在庫減算と `reason` 付き履歴作成が原子的に成功または失敗する。
- アラートの `read` 更新で業務 `status` が変化しない。
- 通知作成・更新で Next.js 版と Vue 版が同じ `level` / `targetType` 契約を送信する。
- 決済受信に対する Backend 変更がなく、Next.js 版の変換後 payload が現行 validation を通る。
- E2E mock がロット形式と集約形式をそれぞれ正しいエンドポイントで返し、在庫 VRT を含む E2E スイートが green である。

## 影響

- Vue 版の画面ロジックをほぼ変更せず、Next.js 版の UI 要件を満たせる。
- Backend には在庫集約処理と利用者別アラート既読データの追加が必要になる。
- 同じ概念の二重表現を Backend に増やさず、変換責務を移行中の Next.js adapter に限定できる。
- `/api/v1` の互換維持期間中は、ロット API と集約 API の両方を保守する必要がある。
- 集約行単位の API により、ロット側のページ境界に依存したクライアント集約と不正確な `total` を避けられる。
- 集約行には数値 `id` がないため、Next.js 一覧の React key は `summaryKey`、ロットの詳細・変更操作は `lots[].id` を使用する必要がある。
- 現在の E2E mock と VRT は実 Backend 契約から乖離しているため、mock の経路分離と期待画像の更新が発生する。
- `turnoverRate` と天気は要件確定まで UI 上の placeholder が残る。

## 却下した案

### `GET /retail/inventories` を集約形式へ直接変更する

Vue 版のフィルタ、詳細、廃棄対象 ID の前提が変わり、回帰範囲が大きいため却下する。

### 通知に `priority` を追加して `level` と両方を返す

値の不一致時にどちらを正とするか決められず、既存 Backend/Vue 契約にも不要なため却下する。

### アラートの既読を `status=ACK` で表す

閲覧と業務上の確認・対応開始は別の操作であり、複数利用者の既読状態も表現できないため却下する。

### 全不足項目を先に Backend に追加する

天気、回転率、未使用の決済 UI は要件が確定しておらず、互換性と保守コストだけを増やすため却下する。

## 参照

- `_docs/api-modifications.html`
- `_review/review_0719_adr-011.kimi.md`
- `_docs/adr/ADR-010-authenticated-fetch-cache.md`
- `features/inventory/lib/inventory-mapper.ts`
- `features/alerts/types/alert.ts`
- `features/system/components/notice-dialog.tsx`
- `features/payments/types/payment.ts`
- `../smart-retail-dx/apps/frontend/src/api/retail/inventory.ts`
- `../smart-retail-dx/apps/frontend/src/api/retail/alert.ts`
- `../smart-retail-dx/apps/frontend/src/api/system/notice.api.ts`
- `../smart-dx-backend/docs/api-interface-design.html`

## 変更履歴

| 日付       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 2026-07-19 | 初版作成                                                                          |
| 2026-07-19 | レビュー指摘を反映し、廃棄契約、mock 乖離、ページング・型・キャッシュ影響を明確化 |
