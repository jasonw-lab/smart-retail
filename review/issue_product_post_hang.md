# 調査依頼: Product POST API ハング問題

## 問題概要

`POST /api/v1/retail/products` エンドポイントがタイムアウト（50秒以上応答なし）する。
他のAPIは正常動作。

## 発生環境

- **Frontend**: Vue 3 + Vite (`apps/frontend/`) - localhost:3000
- **Backend**: Spring Boot 3.3 + MyBatis Plus (`smart-dx-backend/apps/backend/`) - localhost:8080
- **DB**: MySQL (ローカル)

## 症状

| エンドポイント | メソッド | 結果 |
|---------------|---------|------|
| `/api/v1/retail/products/page` | GET | ✅ 正常 (即応答) |
| `/api/v1/retail/products/1` | GET | ✅ 正常 (即応答) |
| `/api/v1/retail/products` | POST | ❌ タイムアウト (応答なし) |
| `/api/v1/retail/products/1` | PUT | ❌ タイムアウト (応答なし) |
| `/api/v1/retail/products/99999` | DELETE | ⚠️ 500エラー (即応答) |
| `/api/v1/notices` | POST | ⚠️ 500エラー (即応答) |
| `/api/v1/retail/stores` | POST | ⚠️ 500エラー (即応答) |

**重要**: 他のPOSTエンドポイント（notices, stores）は500エラーで即応答するが、
**Product POST/PUTのみ無限にハング**する。

## テストコマンド

```bash
# 動作するGET
curl -s "http://localhost:8080/api/v1/retail/products/page?pageNum=1&pageSize=1" \
  -H "Authorization: Bearer <TOKEN>"

# ハングするPOST
curl -s --max-time 15 -X POST "http://localhost:8080/api/v1/retail/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Test","code":"TST001","price":100}'
```

## 関連ファイル

### Backend (smart-dx-backend)
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/controller/ProductController.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/service/impl/ProductServiceImpl.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/converter/ProductConverter.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/model/entity/Product.java`
- `apps/backend/services/retail-be/src/main/java/com/smartdx/retail/model/form/ProductForm.java`

### Tenant/MyBatis設定
- `apps/backend/libs/smart-be-tenant/src/main/java/com/smartdx/tenant/mybatis/config/MybatisConfig.java`
- `apps/backend/libs/smart-be-tenant/src/main/java/com/smartdx/tenant/mybatis/interceptor/MyTenantLineHandler.java`
- `apps/backend/libs/smart-be-tenant/src/main/java/com/smartdx/tenant/mybatis/handler/MyMetaObjectHandler.java`

## 調査済み事項

1. **バックエンド起動状態**: 正常（GETは動作）
2. **認証**: 正常（トークン有効）
3. **TenantAspect**: `@IgnoreTenant`用のみ、問題なし
4. **Product Entity**: `tenantId`に`@JsonIgnore`あり（interceptorで自動設定想定）
5. **MyMetaObjectHandler**: `tenantId`の自動fill処理あり
6. **TenantLineInnerInterceptor**: 有効化されている

## 調査依頼事項

1. **ProductServiceImpl.createProduct()** のデバッグ
   - `getOne()` でデッドロック発生の可能性
   - `productConverter.form2Entity()` の変換処理
   - `this.save()` 実行時のSQL確認

2. **MyBatis Plus Interceptor** の確認
   - `TenantLineInnerInterceptor` がINSERT文でハングしていないか
   - `DataPermissionInterceptor` の影響

3. **DBコネクションプール** の確認
   - HikariCPのコネクション枯渇
   - デッドロック検出

4. **ログ出力の追加**
   - ProductController.createProduct() にログ追加
   - ProductServiceImpl.createProduct() の各ステップにログ追加

## 期待する成果物

1. 根本原因の特定
2. 修正コード（必要な場合）
3. 再発防止策の提案
