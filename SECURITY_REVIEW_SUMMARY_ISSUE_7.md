# Issue #7 セキュリティレビュー結果サマリー

## レビュー対象
- **Issue**: #7 [Phase 1 Backend] ダッシュボード機能
- **PR**: #20 
- **レビュー日**: 2026-01-29
- **ステータス**: マージ済み（8cc16f2）

---

## エグゼクティブサマリー

ダッシュボード機能の実装をセキュリティと既存API影響の観点からレビューしました。

**総合評価**: ⚠️ **条件付き合格** - 基本的なセキュリティは確保されているが、改善推奨項目あり

---

## 主要な発見事項

### ✅ 良好な実装

1. **SQLインジェクション対策**
   - MyBatisのパラメータバインディング（`#{}`）を適切に使用
   - すべてのデータベースクエリが安全に実装されている

2. **認証**
   - Spring Securityによる認証が適切に機能
   - すべてのAPIエンドポイントが保護されている

3. **データモデル**
   - 必要最小限のデータのみ公開
   - 機密情報の漏洩リスクなし

4. **既存APIへの影響**
   - 既存のAPIエンドポイントに変更なし
   - 下位互換性を維持
   - データベーススキーマへの影響なし

### ⚠️ 改善が必要な項目

#### 1. 入力検証の不足（優先度: 高）

**問題箇所**: `DashboardController.java`

```java
// ❌ 問題: limitパラメータの範囲チェックなし
@GetMapping("/inventory-status")
public Result<List<InventoryStatusVO>> getInventoryStatus(
        @RequestParam(defaultValue = "10") Integer limit
) {
    // limit=-1 や limit=Integer.MAX_VALUE を許容してしまう
    List<InventoryStatusVO> inventoryStatus = dashboardService.getInventoryStatus(limit);
    return Result.success(inventoryStatus);
}

// ❌ 問題: 日付範囲の妥当性チェックなし
@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
) {
    // startDate > endDate のチェックなし
    // 過去すぎる日付や未来日付のチェックなし
}
```

**リスク**:
- DoS攻撃の可能性（極端に大きいlimit値）
- 不正なデータ取得
- システムパフォーマンスの劣化

**推奨修正**:
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

@GetMapping("/sales-trend")
public Result<List<SalesTrendVO>> getSalesTrend(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
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
    
    if (startDate.isBefore(LocalDate.now().minusYears(1))) {
        throw new BusinessException("開始日は過去1年以内である必要があります");
    }
    
    if (endDate.isAfter(LocalDate.now())) {
        throw new BusinessException("終了日は未来の日付を指定できません");
    }
    
    List<SalesTrendVO> trend = dashboardService.getSalesTrend(startDate, endDate);
    return Result.success(trend);
}
```

#### 2. AlertServiceImpl の実装（優先度: 高）

**問題箇所**: `AlertServiceImpl.java`

```java
public List<Alert> getRecentAlerts(Integer limit) {
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);  // ❌ 検証なし
    return this.list(queryWrapper);
}
```

**問題点**:
- `limit`が`Integer`型なので、文字列SQLインジェクションは不可能
- しかし、負の値や極端に大きい値への対処が不十分

**推奨修正**:
```java
public List<Alert> getRecentAlerts(Integer limit) {
    // limitの値を検証
    if (limit == null || limit <= 0 || limit > 1000) {
        limit = 10;  // デフォルト値
    }
    
    LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
            .orderByDesc(Alert::getAlertDate)
            .last("LIMIT " + limit);
    return this.list(queryWrapper);
}
```

#### 3. 認可（権限チェック）の不足（優先度: 中）

**現状**:
- 認証はあるが、ロールベースの認可が未実装
- すべての認証済みユーザーが全店舗のデータにアクセス可能

**懸念**:
- 店舗管理者が他店舗のデータを閲覧できる
- データの機密性が十分に保護されていない

**推奨実装**:
```java
@Operation(summary = "KPI取得")
@GetMapping("/kpi")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")  // ロールベースの認可
public Result<DashboardKpiVO> getKpi() {
    // 現在のユーザーの権限に応じたデータフィルタリング
    DashboardKpiVO kpi = dashboardService.getKpi();
    return Result.success(kpi);
}
```

#### 4. テストカバレッジの不足（優先度: 中）

**実装済みテスト**:
- ✅ 正常系テスト（5件）

**不足しているテスト**:
- ❌ 異常系テスト（無効な入力値）
- ❌ 境界値テスト
- ❌ セキュリティテスト（認証なし、権限なし）

**推奨追加テスト**:
```java
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
    
    // 極端に大きいlimit
    given()
        .header("Authorization", bearerToken)
        .queryParam("limit", 99999)
    .when()
        .get(baseUrl + "/inventory-status")
    .then()
        .statusCode(HttpStatus.BAD_REQUEST.value());
}

@Test
void testGetSalesTrendWithInvalidDateRange() {
    // startDate > endDate
    given()
        .header("Authorization", bearerToken)
        .queryParam("startDate", "2026-01-29")
        .queryParam("endDate", "2026-01-20")
    .when()
        .get(baseUrl + "/sales-trend")
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

## 既存APIへの影響評価

### ✅ 影響なし

1. **API構造**
   - 既存エンドポイントへの変更なし
   - 新規エンドポイントのみ追加
   - URLパターンの衝突なし

2. **データベース**
   - スキーマ変更なし
   - 既存データへの影響なし

3. **インターフェース**
   - `AlertService`に新規メソッド追加のみ
   - 既存メソッドのシグネチャ変更なし
   - 下位互換性を維持

4. **レスポンス形式**
   - 既存の`Result`パターンを踏襲
   - フロントエンドとの互換性維持

---

## 推奨アクションプラン

### フェーズ1: 必須対応（本番デプロイ前）

1. **入力検証の実装**
   - [ ] `DashboardController`にlimitの範囲チェック追加（1〜1000）
   - [ ] `DashboardController`に日付範囲の妥当性チェック追加
   - [ ] `AlertServiceImpl`にlimit検証追加

2. **テストケース追加**
   - [ ] 異常系テストケース追加（最低5件）
   - [ ] 境界値テストケース追加

### フェーズ2: 推奨対応（短期）

3. **認可の実装**
   - [ ] ロールベースアクセス制御の要件定義
   - [ ] `@PreAuthorize`アノテーションの追加
   - [ ] データスコープフィルタリングの実装

4. **エラーハンドリング改善**
   - [ ] カスタムエラーメッセージの実装
   - [ ] 本番環境での詳細エラー抑制

### フェーズ3: 将来的な改善（中長期）

5. **パフォーマンス最適化**
   - [ ] ページネーション機能の追加
   - [ ] キャッシング戦略の検討

6. **監査ログ**
   - [ ] 機密データアクセスのログ記録
   - [ ] セキュリティイベントの監視

---

## 結論

### セキュリティ評価

**現状**: ⚠️ 条件付き合格

**評価理由**:
- 基本的なセキュリティ対策（SQLインジェクション、認証）は適切
- 入力検証とDoS対策に改善の余地あり
- 既存システムへの悪影響なし

**次のステップ**:
1. フェーズ1（必須対応）の実施を推奨
2. 実装後の再テスト
3. 本番デプロイ前のセキュリティレビュー

### 最終推奨事項

**本番環境へのデプロイ**: 
- ⚠️ **フェーズ1の対応完了後を推奨**
- 入力検証の追加は必須
- 異常系テストの追加も強く推奨

**承認条件**:
1. 入力検証の実装完了
2. 異常系テストの追加
3. セキュリティレビューの再実施

---

**詳細レビュー**: `SECURITY_REVIEW_ISSUE_7.md` を参照

**レビュー完了**: 2026-01-29  
**レビュアー**: AI Security Review System
