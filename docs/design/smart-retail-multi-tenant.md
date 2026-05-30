# Smart Retail マルチテナント設計 v1.0

> **対象範囲**: Phase 2（マルチテナント対応）
> **目的**: 複数テナント（企業・組織）が同一システムを安全に共有利用できる基盤設計

---

## 1. 設計方針

### 1.1 テナント分離方式

**採用方式**: カラム分離（Shared Database, Shared Schema）

| 方式 | メリット | デメリット | 採用 |
|------|----------|------------|------|
| カラム分離 | 運用コスト低、スケーラビリティ高 | クエリにtenant_id条件必須 | ✅ |
| スキーマ分離 | データ分離が明確 | スキーマ変更の運用負荷 | - |
| DB分離 | 完全分離、パフォーマンス | インフラコスト高、運用複雑 | - |

**選定理由**:
- 小売システムではテナント数の増加が見込まれる
- MyBatis Plus の `TenantLineInnerInterceptor` で自動分離可能
- 運用コストとスケーラビリティのバランスが最適

### 1.2 テナント識別方式

```
[リクエスト] → [JWT Token] → [tenant_id 抽出] → [ThreadLocal 格納] → [SQL 自動付与]
```

- JWT トークンの claims に `tenant_id` を含める
- `TenantContextHolder` で `ThreadLocal` に格納
- MyBatis Plus Interceptor が全クエリに `tenant_id` 条件を自動付与

### 1.3 テナント分離対象テーブル

| テーブル | tenant_id 追加 | 備考 |
|----------|----------------|------|
| retail_store | ✅ | テナント別店舗 |
| retail_product | ✅ | テナント別商品マスタ |
| retail_category | ✅ | テナント別カテゴリ |
| retail_inventory | ✅ | テナント別在庫 |
| retail_inventory_transaction | ✅ | テナント別入出庫履歴 |
| retail_device | ✅ | テナント別デバイス |
| retail_alert | ✅ | テナント別アラート |
| retail_sales | ✅ | テナント別売上 |
| retail_sales_detail | - | sales_id 経由で分離 |
| retail_tenant | - | テナントマスタ（親テーブル） |

---

## 2. DDL（MySQL 8.x想定）

### 2.1 テナントマスタ（retail_tenant）

```sql
CREATE TABLE `retail_tenant` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `tenant_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'テナントコード（一意識別子）',
  `tenant_name` VARCHAR(200) NOT NULL COMMENT 'テナント名（企業名・組織名）',
  `contact_email` VARCHAR(255) COMMENT '連絡先メールアドレス',
  `contact_phone` VARCHAR(50) COMMENT '連絡先電話番号',
  `plan_type` ENUM('FREE', 'BASIC', 'STANDARD', 'ENTERPRISE') NOT NULL DEFAULT 'BASIC' COMMENT 'プランタイプ',
  `max_stores` INT NOT NULL DEFAULT 10 COMMENT '最大店舗数',
  `max_users` INT NOT NULL DEFAULT 50 COMMENT '最大ユーザー数',
  `status` ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'テナント状態',
  `activated_at` DATETIME COMMENT 'アクティベート日時',
  `expires_at` DATETIME COMMENT '有効期限',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_tenant_code` (`tenant_code`),
  KEY `idx_tenant_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='テナントマスタ';
```

### 2.2 既存テーブルへの tenant_id 追加

```sql
-- ============================================================
-- Smart Retail Database Migration: Multi-Tenant Support
-- ============================================================

-- 2.2.1 店舗テーブル
ALTER TABLE `retail_store`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_store_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_store_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- store_code をテナント内一意に変更
ALTER TABLE `retail_store`
  DROP INDEX `uk_store_code`,
  ADD UNIQUE KEY `uk_store_tenant_code` (`tenant_id`, `store_code`),
  ADD UNIQUE KEY `uk_store_tenant_id` (`tenant_id`, `id`);

-- 2.2.2 カテゴリテーブル
ALTER TABLE `retail_category`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_category_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_category_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- category_code をテナント内一意に変更
ALTER TABLE `retail_category`
  DROP INDEX `uk_category_code`,
  ADD UNIQUE KEY `uk_category_tenant_code` (`tenant_id`, `category_code`);

-- 2.2.3 商品テーブル
ALTER TABLE `retail_product`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_product_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_product_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- product_code をテナント内一意に変更
ALTER TABLE `retail_product`
  DROP INDEX `uk_product_code`,
  ADD UNIQUE KEY `uk_product_tenant_code` (`tenant_id`, `product_code`);

-- 2.2.4 在庫テーブル
ALTER TABLE `retail_inventory`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_inventory_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_inventory_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- 2.2.5 入出庫履歴テーブル
ALTER TABLE `retail_inventory_transaction`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_invtxn_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_invtxn_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- 2.2.6 デバイステーブル
ALTER TABLE `retail_device`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_device_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_device_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- device_code をテナント内一意に変更
ALTER TABLE `retail_device`
  DROP INDEX `uk_device_code`,
  ADD UNIQUE KEY `uk_device_tenant_code` (`tenant_id`, `device_code`);

-- 2.2.7 アラートテーブル
ALTER TABLE `retail_alert`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_alert_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_alert_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);

-- 2.2.8 売上テーブル
ALTER TABLE `retail_sales`
  ADD COLUMN `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'テナントID' AFTER `id`,
  ADD KEY `idx_sales_tenant` (`tenant_id`),
  ADD CONSTRAINT `fk_sales_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `retail_tenant`(`id`);
```

---

## 3. Backend 実装設計

### 3.1 TenantContextHolder

```java
/**
 * テナントコンテキストホルダー（ThreadLocal管理）
 */
public class TenantContextHolder {
    private static final ThreadLocal<Long> TENANT_ID = new ThreadLocal<>();

    public static void setTenantId(Long tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static Long getTenantId() {
        return TENANT_ID.get();
    }

    public static void clear() {
        TENANT_ID.remove();
    }
}
```

### 3.2 TenantInterceptor（JWT からテナント抽出）

```java
/**
 * テナント識別インターセプター
 * JWT トークンから tenant_id を抽出し ThreadLocal に格納
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        // JWT から tenant_id を抽出
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            Long tenantId = extractTenantIdFromToken(token.substring(7));
            TenantContextHolder.setTenantId(tenantId);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        TenantContextHolder.clear();
    }

    private Long extractTenantIdFromToken(String token) {
        // JWT パース処理（実装省略）
        return null;
    }
}
```

### 3.3 MyBatis Plus テナント分離設定

```java
/**
 * MyBatis Plus テナント分離設定
 */
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // テナント分離インターセプター
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
        tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {

            @Override
            public Expression getTenantId() {
                Long tenantId = TenantContextHolder.getTenantId();
                if (tenantId == null) {
                    throw new RuntimeException("Tenant ID not found in context");
                }
                return new LongValue(tenantId);
            }

            @Override
            public String getTenantIdColumn() {
                return "tenant_id";
            }

            @Override
            public boolean ignoreTable(String tableName) {
                // テナント分離対象外テーブル
                return Arrays.asList(
                    "retail_tenant",           // テナントマスタ
                    "retail_sales_detail",     // sales_id経由で分離
                    "sys_user",                // システムユーザー
                    "sys_role",                // システムロール
                    "sys_menu"                 // システムメニュー
                ).contains(tableName);
            }
        });

        interceptor.addInnerInterceptor(tenantInterceptor);
        return interceptor;
    }
}
```

### 3.4 Entity 修正例

```java
/**
 * テナント分離対象エンティティの基底クラス
 */
@Data
public abstract class TenantBaseEntity {

    /**
     * テナントID
     */
    @TableField("tenant_id")
    private Long tenantId;
}

/**
 * 店舗エンティティ（修正例）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("retail_store")
public class Store extends TenantBaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String storeCode;

    private String storeName;

    // ... 他フィールド
}
```

---

## 4. セキュリティ考慮事項

### 4.1 テナント間データ漏洩防止

| リスク | 対策 |
|--------|------|
| SQL インジェクション | MyBatis Plus Interceptor で自動 tenant_id 付与 |
| API パラメータ改ざん | JWT claims から tenant_id 取得（リクエストパラメータ不使用） |
| 管理者による越権アクセス | ロールベースアクセス制御（SUPER_ADMIN のみ全テナント参照可） |

### 4.2 テナント無効化時の挙動

```java
/**
 * テナント状態チェックフィルター
 */
@Component
public class TenantStatusFilter extends OncePerRequestFilter {

    @Autowired
    private TenantService tenantService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Long tenantId = TenantContextHolder.getTenantId();
        if (tenantId != null) {
            Tenant tenant = tenantService.getById(tenantId);
            if (tenant == null || tenant.getStatus() != TenantStatus.ACTIVE) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"code\":\"TENANT_INACTIVE\",\"message\":\"テナントが無効です\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
```

---

## 5. データ移行計画

### 5.1 移行手順

1. **テナントマスタ作成**: `retail_tenant` テーブル作成、デフォルトテナント（id=1）挿入
2. **カラム追加**: 各テーブルに `tenant_id` カラム追加（DEFAULT 1）
3. **インデックス再構築**: ユニークキーをテナント考慮型に変更
4. **アプリケーション更新**: Interceptor・Entity・Service 修正
5. **検証**: テナント分離動作確認

### 5.2 デフォルトテナント

```sql
-- デフォルトテナント挿入（既存データ用）
INSERT INTO `retail_tenant` (
  `id`, `tenant_code`, `tenant_name`, `plan_type`, `status`, `activated_at`
) VALUES (
  1, 'DEFAULT', 'デフォルトテナント', 'ENTERPRISE', 'ACTIVE', NOW()
);
```

---

## 6. 主要クエリ（マルチテナント対応後）

### 6.1 在庫一覧（I-01）集約

```sql
-- MyBatis Plus Interceptor により tenant_id 条件が自動付与される
-- 実際に発行されるSQL:
SELECT
  i.store_id,
  i.product_id,
  SUM(i.quantity) AS total_quantity,
  MIN(CASE WHEN i.quantity > 0 THEN i.expiry_date ELSE NULL END) AS oldest_expiry_date
FROM retail_inventory i
WHERE i.tenant_id = ?  -- 自動付与
GROUP BY i.store_id, i.product_id;
```

### 6.2 店舗別アラート取得

```sql
-- 元のクエリ（tenant_id 条件なし）
SELECT * FROM retail_alert WHERE store_id = ? AND status = 'NEW';

-- Interceptor 適用後（自動変換）
SELECT * FROM retail_alert WHERE store_id = ? AND status = 'NEW' AND tenant_id = ?;
```

---

## 7. プラン別制限

| プラン | 最大店舗数 | 最大ユーザー数 | 機能制限 |
|--------|-----------|---------------|----------|
| FREE | 1 | 5 | 基本機能のみ |
| BASIC | 5 | 20 | アラート・レポート |
| STANDARD | 20 | 100 | API連携・バッチ処理 |
| ENTERPRISE | 無制限 | 無制限 | 全機能・SLA保証 |

---

## 8. DDLファイル

| ファイル | 説明 |
|----------|------|
| `docs/design/db/retail_v0.7.1_multi_tenant.sql` | マルチテナント対応フルスキーマ（複合FK対応、sales_detail tenant_id追加） |
| `docs/design/db/retail_demo_data_v0.7.1.sql` | デモデータ（テナント分離対応、sales_detail含む） |

**適用方法**:
```bash
mysql -u root -p smart_dx_db < docs/design/db/retail_v0.7.1_multi_tenant.sql
mysql -u root -p smart_dx_db < docs/design/db/retail_demo_data_v0.7.1.sql
```

---

## 9. 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v1.0 | 2026-05-25 | 初版作成（カラム分離方式、MyBatis Plus Interceptor設計） |
| v1.1 | 2026-05-28 | retail_v0.7_multi_tenant.sql 追加（フルスキーマ統合） |
| v1.2 | 2026-05-28 | Codexレビュー対応: 複合FK導入、sales_detail tenant_id追加、インデックス名修正 |
