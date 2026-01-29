# Issue #7 セキュリティ修正ガイド - Quick Reference

## 修正が必要なファイル一覧

| ファイル | 修正内容 | 優先度 | 推定工数 |
|---------|---------|--------|---------|
| `DashboardController.java` | 入力検証追加 | 高 | 30分 |
| `AlertServiceImpl.java` | limit検証追加 | 高 | 15分 |
| `DashboardControllerRestAssuredTest.java` | 異常系テスト追加 | 中 | 1時間 |
| `DashboardController.java` | 認可アノテーション追加 | 中 | 30分 |

---

## 修正コード例

### 1. DashboardController.java - 入力検証

#### 修正箇所1: getInventoryStatus メソッド

**現在のコード**:
```java
@GetMapping("/inventory-status")
public Result<List<InventoryStatusVO>> getInventoryStatus(
        @RequestParam(defaultValue = "10") Integer limit
) {
    List<InventoryStatusVO> inventoryStatus = dashboardService.getInventoryStatus(limit);
    return Result.success(inventoryStatus);
}
```

**修正後のコード**:
```java
@GetMapping("/inventory-status")
public Result<List<InventoryStatusVO>> getInventoryStatus(
        @RequestParam(defaultValue = "10") Integer limit
) {
    // 入力検証追加
    if (limit == null || limit < 1 || limit > 1000) {
        throw new BusinessException("limitは1から1000の範囲で指定してください");
    }
    
    List<InventoryStatusVO> inventoryStatus = dashboardService.getInventoryStatus(limit);
    return Result.success(inventoryStatus);
}
```

#### 修正箇所2: getSalesTrend メソッド

**現在のコード**:
```java
@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
    // デフォルト: 過去7日間
    if (startDate == null) {
        startDate = LocalDate.now().minusDays(6);
    }
    if (endDate == null) {
        endDate = LocalDate.now();
    }

    List<SalesTrendVO> trend = dashboardService.getSalesTrend(startDate, endDate);
    return Result.success(trend);
}
```

**修正後のコード**:
```java
@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
    // デフォルト: 過去7日間
    if (startDate == null) {
        startDate = LocalDate.now().minusDays(6);
    }
    if (endDate == null) {
        endDate = LocalDate.now();
    }
    
    // ===== 入力検証追加 =====
    // 1. 日付範囲の妥当性チェック
    if (startDate.isAfter(endDate)) {
        throw new BusinessException("開始日は終了日より前である必要があります");
    }
    
    // 2. 最大取得期間の制限（1年）
    if (startDate.isBefore(LocalDate.now().minusYears(1))) {
        throw new BusinessException("開始日は過去1年以内である必要があります");
    }
    
    // 3. 未来日付のチェック
    if (endDate.isAfter(LocalDate.now())) {
        throw new BusinessException("終了日は未来の日付を指定できません");
    }
    // ===== 入力検証ここまで =====

    List<SalesTrendVO> trend = dashboardService.getSalesTrend(startDate, endDate);
    return Result.success(trend);
}
```

#### 修正箇所3: getAlerts メソッド

**現在のコード**:
```java
@GetMapping("/alerts")
public Result<List<Alert>> getAlerts(
        @RequestParam(defaultValue = "10") Integer limit
) {
    List<Alert> alerts = alertService.getRecentAlerts(limit);
    return Result.success(alerts);
}
```

**修正後のコード**:
```java
@GetMapping("/alerts")
public Result<List<Alert>> getAlerts(
        @RequestParam(defaultValue = "10") Integer limit
) {
    // 入力検証追加
    if (limit == null || limit < 1 || limit > 1000) {
        throw new BusinessException("limitは1から1000の範囲で指定してください");
    }
    
    List<Alert> alerts = alertService.getRecentAlerts(limit);
    return Result.success(alerts);
}
```

---

### 2. AlertServiceImpl.java - limit検証

#### 修正箇所: getRecentAlerts メソッド

**現在のコード**:
```java
public List<Alert> getRecentAlerts(Integer limit) {
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);
    return this.list(queryWrapper);
}
```

**修正後のコード**:
```java
public List<Alert> getRecentAlerts(Integer limit) {
    // limitの値を検証・正規化
    if (limit == null || limit <= 0 || limit > 1000) {
        limit = 10;  // デフォルト値
    }
    
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);
    return this.list(queryWrapper);
}
```

---

### 3. DashboardControllerRestAssuredTest.java - 異常系テスト追加

#### 追加テスト1: 無効なlimitパラメータ

**追加コード**:
```java
@Test
void testGetInventoryStatusWithNegativeLimit() {
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("limit", -1)
    .when()
        .get(baseUrl + "/inventory-status");

    response.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .body("code", not(equalTo("00000")));
    
    System.out.println("負のlimitテスト - ステータスコード: " + response.getStatusCode());
}

@Test
void testGetInventoryStatusWithTooLargeLimit() {
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("limit", 99999)
    .when()
        .get(baseUrl + "/inventory-status");

    response.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .body("code", not(equalTo("00000")));
    
    System.out.println("大きすぎるlimitテスト - ステータスコード: " + response.getStatusCode());
}

@Test
void testGetInventoryStatusWithValidLimit() {
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("limit", 50)
    .when()
        .get(baseUrl + "/inventory-status");

    response.then()
        .statusCode(HttpStatus.OK.value())
        .body("code", equalTo("00000"));
    
    System.out.println("有効なlimitテスト - ステータスコード: " + response.getStatusCode());
}
```

#### 追加テスト2: 無効な日付範囲

**追加コード**:
```java
@Test
void testGetSalesTrendWithInvalidDateRange() {
    // startDate > endDate の場合
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("startDate", "2026-01-29")
        .queryParam("endDate", "2026-01-20")  // 開始日より前
    .when()
        .get(baseUrl + "/sales-trend");

    response.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .body("code", not(equalTo("00000")));
    
    System.out.println("無効な日付範囲テスト - ステータスコード: " + response.getStatusCode());
}

@Test
void testGetSalesTrendWithFutureDate() {
    // 未来の日付
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("startDate", "2026-01-20")
        .queryParam("endDate", "2027-12-31")  // 未来の日付
    .when()
        .get(baseUrl + "/sales-trend");

    response.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .body("code", not(equalTo("00000")));
    
    System.out.println("未来日付テスト - ステータスコード: " + response.getStatusCode());
}

@Test
void testGetSalesTrendWithTooOldDate() {
    // 過去すぎる日付
    Response response = given()
        .contentType(ContentType.JSON)
        .header("Authorization", bearerToken)
        .queryParam("startDate", "2020-01-01")  // 1年以上前
        .queryParam("endDate", "2026-01-29")
    .when()
        .get(baseUrl + "/sales-trend");

    response.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .body("code", not(equalTo("00000")));
    
    System.out.println("過去すぎる日付テスト - ステータスコード: " + response.getStatusCode());
}
```

#### 追加テスト3: 境界値テスト

**追加コード**:
```java
@Test
void testGetInventoryStatusBoundaryLimits() {
    // 境界値: limit=1 (最小値)
    Response response1 = given()
        .header("Authorization", bearerToken)
        .queryParam("limit", 1)
    .when()
        .get(baseUrl + "/inventory-status");
    
    response1.then()
        .statusCode(HttpStatus.OK.value())
        .body("code", equalTo("00000"))
        .body("data.size()", lessThanOrEqualTo(1));
    
    System.out.println("境界値テスト(limit=1) - データ件数: " + response1.path("data.size()"));
    
    // 境界値: limit=1000 (最大値)
    Response response2 = given()
        .header("Authorization", bearerToken)
        .queryParam("limit", 1000)
    .when()
        .get(baseUrl + "/inventory-status");
    
    response2.then()
        .statusCode(HttpStatus.OK.value())
        .body("code", equalTo("00000"));
    
    System.out.println("境界値テスト(limit=1000) - データ件数: " + response2.path("data.size()"));
    
    // 境界値を超える: limit=1001
    Response response3 = given()
        .header("Authorization", bearerToken)
        .queryParam("limit", 1001)
    .when()
        .get(baseUrl + "/inventory-status");
    
    response3.then()
        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
    
    System.out.println("境界値超えテスト(limit=1001) - ステータスコード: " + response3.getStatusCode());
}
```

---

## 修正の実施手順

### ステップ1: 入力検証の追加（優先度: 高）

1. `DashboardController.java` を開く
2. 上記の修正を適用
3. コンパイルエラーがないか確認

```bash
cd backend
./mvnw clean compile
```

### ステップ2: AlertServiceImpl の修正（優先度: 高）

1. `AlertServiceImpl.java` を開く
2. `getRecentAlerts()` メソッドを修正
3. コンパイル確認

### ステップ3: テストケースの追加（優先度: 中）

1. `DashboardControllerRestAssuredTest.java` を開く
2. 上記の異常系テストを追加
3. テスト実行

```bash
cd backend
./mvnw test -Dtest=DashboardControllerRestAssuredTest
```

### ステップ4: 全体テストの実行

```bash
cd backend
./mvnw clean test
```

### ステップ5: コミット

```bash
git add .
git commit -m "fix(dashboard): Add input validation and error handling tests"
git push
```

---

## 修正後の確認事項

### 機能テスト

- [ ] KPI取得が正常に動作する
- [ ] 売上推移取得が正常に動作する
- [ ] 在庫状況取得が正常に動作する
- [ ] アラート一覧取得が正常に動作する

### セキュリティテスト

- [ ] 負のlimit値で400エラーが返る
- [ ] 極端に大きいlimit値で400エラーが返る
- [ ] 無効な日付範囲で400エラーが返る
- [ ] 未来の日付で400エラーが返る
- [ ] 過去すぎる日付で400エラーが返る

### パフォーマンステスト

- [ ] limit=1000でも適切なレスポンスタイムで応答する
- [ ] 1年間の売上推移取得が適切な時間で完了する

---

## 推奨: BusinessException のカスタマイズ

現在の `BusinessException` が適切にHTTPステータスコード400（Bad Request）を返すか確認してください。

**確認方法**:
```java
// GlobalExceptionHandler.java を確認
@ExceptionHandler(BusinessException.class)
public Result<?> handleBusinessException(BusinessException e) {
    return Result.error(e.getMessage());  // HTTPステータスは?
}
```

**推奨実装** (必要に応じて):
```java
@ExceptionHandler(BusinessException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)  // 400エラーを明示
public Result<?> handleBusinessException(BusinessException e) {
    log.warn("Business exception: {}", e.getMessage());
    return Result.error(e.getMessage());
}
```

---

## 次のステップ

1. ✅ このガイドに従って修正を実施
2. ✅ テストを実行して動作確認
3. ✅ セキュリティレビューを再実施
4. ✅ 本番環境へのデプロイ承認を取得

---

**作成日**: 2026-01-29  
**最終更新**: 2026-01-29
