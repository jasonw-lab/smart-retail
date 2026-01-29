# セキュリティレビュー - Issue #7 ダッシュボード機能実装

**レビュー日時**: 2026-01-29  
**対象PR**: #20  
**対象Issue**: #7  
**レビュアー**: AI Security Review

## 1. 実装概要

### 追加されたAPI
1. `GET /api/v1/retail/dashboard/kpi` - KPI集計
2. `GET /api/v1/retail/dashboard/sales-trend` - 売上推移
3. `GET /api/v1/retail/dashboard/inventory-status` - 在庫状況
4. `GET /api/v1/retail/dashboard/alerts` - アラート一覧

### 追加されたファイル
- `DashboardController.java` - REST API エンドポイント
- `DashboardService.java` / `DashboardServiceImpl.java` - ビジネスロジック
- `DashboardMapper.java` / `DashboardMapper.xml` - データアクセス層
- `DashboardKpiVO.java`, `SalesTrendVO.java`, `InventoryStatusVO.java` - レスポンスモデル
- `DashboardControllerRestAssuredTest.java` - テストコード

---

## 2. セキュリティ分析

### 2.1 SQLインジェクション脆弱性

#### ⚠️ 重大な脆弱性: LIMIT句のSQLインジェクション

**場所**: `AlertServiceImpl.java:getRecentAlerts()`

```java
public List<Alert> getRecentAlerts(Integer limit) {
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);  // ❌ SQL インジェクション脆弱性
    return this.list(queryWrapper);
}
```

**問題点**:
- `limit`パラメータが直接SQL文字列に連結されている
- パラメータ化されていないため、SQLインジェクション攻撃が可能
- 例: `limit=10; DROP TABLE retail_alert; --` のような攻撃が可能

**推奨修正**:
```java
public List<Alert> getRecentAlerts(Integer limit) {
    // limitの値を検証
    if (limit == null || limit <= 0 || limit > 1000) {
        limit = 10;  // デフォルト値
    }
    
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);  // Integerなので文字列連結でも安全
    return this.list(queryWrapper);
}
```

**影響度**: 高
- ただし、`limit`は`Integer`型なので、文字列注入は不可能
- しかし、負の値や極端に大きい値の処理が不適切

#### ✅ MyBatisクエリは安全

**DashboardMapper.xml**のクエリは適切にパラメータ化されている:
```xml
<!-- ✅ 安全な実装 -->
<select id="getInventoryStatus">
    ...
    <if test="limit != null">
        LIMIT #{limit}  <!-- パラメータバインディング使用 -->
    </if>
</select>

<select id="getSalesTrend">
    ...
    WHERE DATE(sale_timestamp) BETWEEN #{startDate} AND #{endDate}
    <!-- パラメータバインディング使用 -->
</select>
```

**評価**: MyBatisのパラメータバインディング（`#{}`）を使用しており、SQLインジェクション対策が適切。

---

### 2.2 認証・認可

#### ✅ 認証は実装済み

**DashboardController.java**:
```java
@RestController
@RequestMapping("/api/v1/retail/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    // 全APIエンドポイントは /api/v1 配下
    // Spring Securityの既存設定により認証が必要
}
```

**テストコード確認**:
```java
Response response = given()
    .contentType(ContentType.JSON)
    .header("Authorization", bearerToken)  // ✅ 認証トークン使用
.when()
    .get(baseUrl + "/kpi");
```

**評価**: 既存のSpring Security設定により、認証が適切に適用されている。

#### ⚠️ 認可（権限チェック）の確認が必要

**懸念事項**:
- ダッシュボードAPIは店舗横断的なデータを扱う
- 現在の実装では、全ユーザーが全店舗のデータにアクセス可能
- 店舗管理者が他店舗のデータを見られる可能性

**推奨事項**:
1. ユーザーロールに基づいた権限チェック
2. データスコープによるフィルタリング（店舗管理者は自店舗のみ）
3. Spring Security の `@PreAuthorize` アノテーションの活用

```java
@Operation(summary = "KPI取得")
@GetMapping("/kpi")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")  // 推奨追加
public Result<DashboardKpiVO> getKpi() {
    // 現在のユーザーの権限に応じたデータフィルタリング
    DashboardKpiVO kpi = dashboardService.getKpi();
    return Result.success(kpi);
}
```

---

### 2.3 入力検証

#### ⚠️ 不十分な入力検証

**DashboardController.java**:

```java
@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
) {
    // ❌ 日付の妥当性チェックが不足
    if (startDate == null) {
        startDate = LocalDate.now().minusDays(6);
    }
    if (endDate == null) {
        endDate = LocalDate.now();
    }
    // ❌ startDate > endDate のチェックなし
    // ❌ 過去すぎる日付や未来日付のチェックなし
}

@GetMapping("/inventory-status")
public Result<List<InventoryStatusVO>> getInventoryStatus(
        @RequestParam(defaultValue = "10") Integer limit
) {
    // ❌ limitの範囲チェックなし
    // 負の値や極端に大きい値（例: Integer.MAX_VALUE）が許可される
}
```

**推奨修正**:
```java
@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
    if (startDate == null) {
        startDate = LocalDate.now().minusDays(6);
    }
    if (endDate == null) {
        endDate = LocalDate.now();
    }
    
    // 入力検証追加
    if (startDate.isAfter(endDate)) {
        throw new BusinessException("開始日は終了日より前である必要があります");
    }
    
    // 最大取得期間の制限（例: 1年）
    if (startDate.isBefore(LocalDate.now().minusYears(1))) {
        throw new BusinessException("開始日は過去1年以内である必要があります");
    }
    
    if (endDate.isAfter(LocalDate.now())) {
        throw new BusinessException("終了日は未来の日付を指定できません");
    }
    
    List<SalesTrendVO> trend = dashboardService.getSalesTrend(startDate, endDate);
    return Result.success(trend);
}

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

---

### 2.4 データ漏洩リスク

#### ✅ 適切なデータモデル設計

**InventoryStatusVO.java**:
```java
@Data
@Schema(description = "在庫状況")
public class InventoryStatusVO implements Serializable {
    private Long productId;
    private String productName;
    private String productCode;
    private Long storeId;
    private String storeName;
    private Integer quantity;
    private Integer reorderPoint;
    private String status;
}
```

**評価**: 
- 必要最小限のデータのみ公開
- 機密情報（原価、仕入先情報など）は含まれていない
- ✅ 適切

#### ⚠️ エラーハンドリング

**現在の実装**:
- 例外が発生した場合のエラーメッセージが詳細すぎる可能性
- データベース構造やSQLクエリの情報が漏洩する可能性

**推奨事項**:
- 本番環境では詳細なエラーメッセージを抑制
- ログには詳細を記録し、ユーザーには一般的なエラーメッセージのみ表示

---

### 2.5 パフォーマンスとDoS対策

#### ⚠️ DoS攻撃のリスク

**問題点**:
1. **limitパラメータの制限なし**
   ```java
   @GetMapping("/inventory-status")
   public Result<List<InventoryStatusVO>> getInventoryStatus(
           @RequestParam(defaultValue = "10") Integer limit
   ) {
       // limit=Integer.MAX_VALUE を指定された場合、
       // 全データを取得しようとしてメモリ不足になる可能性
   }
   ```

2. **日付範囲の制限なし**
   ```java
   // startDate=1900-01-01, endDate=2099-12-31 のような
   // 極端に広い範囲を指定された場合、大量のデータを処理
   ```

**推奨対策**:
- limitの最大値を設定（例: 1000件）
- 日付範囲の最大期間を設定（例: 1年）
- ページネーション機能の追加

---

### 2.6 ビジネスロジックの脆弱性

#### ⚠️ ゼロ除算の可能性

**DashboardServiceImpl.java**:
```java
// 前日売上が0の場合の処理
if (yesterdaySales != null && yesterdaySales.compareTo(BigDecimal.ZERO) > 0) {
    BigDecimal growthRate = todaySales.subtract(yesterdaySales)
            .divide(yesterdaySales, 4, RoundingMode.HALF_UP)  // ✅ 0チェック済み
            .multiply(new BigDecimal("100"))
            .setScale(1, RoundingMode.HALF_UP);
    kpi.setSalesGrowthRate(growthRate);
} else {
    kpi.setSalesGrowthRate(BigDecimal.ZERO);
}
```

**評価**: ✅ ゼロ除算対策が適切に実装されている

---

## 3. 既存APIへの影響

### 3.1 新規メソッドの追加

**AlertService.java** に新規メソッド追加:
```java
List<Alert> getRecentAlerts(Integer limit);
```

**影響範囲**:
- ✅ 既存メソッドは変更なし
- ✅ インターフェースへの追加のみ（互換性維持）
- ✅ 既存のコンパイル・実行に影響なし

### 3.2 データベーススキーマ

**確認事項**:
- 新規テーブル追加なし
- 既存テーブルの構造変更なし
- ✅ 既存データへの影響なし

### 3.3 レスポンス形式

**既存のレスポンス形式との一貫性**:
```java
return Result.success(data);  // ✅ 既存のパターンと一致
```

**評価**: ✅ 既存APIとの一貫性が保たれている

---

## 4. テストカバレッジ

### 4.1 実装されたテスト

**DashboardControllerRestAssuredTest.java**:
- ✅ testGetKpi - KPI取得の正常系
- ✅ testGetSalesTrend - 売上推移取得の正常系
- ✅ testGetSalesTrendWithDateRange - 期間指定の正常系
- ✅ testGetInventoryStatus - 在庫状況取得の正常系
- ✅ testGetAlerts - アラート一覧取得の正常系

### 4.2 不足しているテスト

**異常系テスト**:
- ❌ 無効な日付範囲のテスト（startDate > endDate）
- ❌ 不正なlimitパラメータのテスト（負の値、極端に大きい値）
- ❌ 認証なしでのアクセステスト
- ❌ 権限のないユーザーでのアクセステスト
- ❌ 境界値テスト

**推奨追加テスト**:
```java
@Test
void testGetSalesTrendWithInvalidDateRange() {
    // startDate > endDate の場合
    Response response = given()
        .header("Authorization", bearerToken)
        .queryParam("startDate", "2026-01-29")
        .queryParam("endDate", "2026-01-20")  // 開始日より前
    .when()
        .get(baseUrl + "/sales-trend");
    
    response.then()
        .statusCode(HttpStatus.BAD_REQUEST.value());
}

@Test
void testGetInventoryStatusWithInvalidLimit() {
    // 負のlimit
    given()
        .header("Authorization", bearerToken)
        .queryParam("limit", -1)
    .when()
        .get(baseUrl + "/inventory-status")
    .then()
        .statusCode(HttpStatus.BAD_REQUEST.value());
}

@Test
void testGetKpiWithoutAuthentication() {
    // 認証なし
    given()
        .contentType(ContentType.JSON)
    .when()
        .get(baseUrl + "/kpi")
    .then()
        .statusCode(HttpStatus.UNAUTHORIZED.value());
}
```

---

## 5. セキュリティ推奨事項まとめ

### 5.1 必須修正項目（優先度: 高）

1. **入力検証の強化**
   - limitパラメータの範囲チェック（1〜1000）
   - 日付範囲の妥当性チェック（startDate <= endDate）
   - 最大取得期間の制限（例: 1年）

2. **AlertServiceImpl.getRecentAlerts()の修正**
   - limitパラメータの検証追加
   - デフォルト値の設定

### 5.2 推奨修正項目（優先度: 中）

3. **認可の実装**
   - ユーザーロールベースのアクセス制御
   - データスコープによるフィルタリング

4. **エラーハンドリングの改善**
   - 本番環境での詳細エラー抑制
   - 適切なロギング

5. **テストケースの追加**
   - 異常系テストの追加
   - セキュリティテストの追加

### 5.3 推奨検討項目（優先度: 低）

6. **パフォーマンス最適化**
   - ページネーション機能の追加
   - キャッシング戦略の検討

7. **監査ログ**
   - 機密データアクセスのログ記録

---

## 6. 結論

### セキュリティ評価: ⚠️ 条件付き合格

**良い点**:
- ✅ SQLインジェクション対策（MyBatis）
- ✅ 認証機構の活用
- ✅ 適切なデータモデル設計
- ✅ ゼロ除算対策
- ✅ 既存APIへの影響なし

**改善が必要な点**:
- ⚠️ 入力検証の不足
- ⚠️ DoS攻撃のリスク
- ⚠️ 認可（権限チェック）の不足
- ⚠️ 異常系テストの不足

**推奨アクション**:
1. 入力検証を優先的に追加
2. limitと日付範囲の制限を実装
3. 異常系テストを追加
4. 認可要件を明確にし、必要に応じて実装

**総合評価**: 基本的なセキュリティは確保されているが、本番環境デプロイ前に入力検証とDoS対策の強化を推奨。

---

**レビュー完了日**: 2026-01-29  
**次回レビュー推奨時期**: 修正実装後
