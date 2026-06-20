# 追加したい機能
Task 03: 商品管理画面 Backend Integration

# 背景
frontend-nextの商品管理画面をsmart-dx-backendの商品APIに接続する。
Type定義をバックエンドのProductVOに合わせて拡張する必要がある。

# 期待する振る舞い
- 商品一覧がページネーション付きで表示 (`GET /api/v1/retail/products/page`)
- 商品詳細の取得 (`GET /api/v1/retail/products/{id}`)
- 商品の新規作成 (`POST /api/v1/retail/products`)
- 商品の更新 (`PUT /api/v1/retail/products/{id}`)
- 商品の削除 (`DELETE /api/v1/retail/products/{id}`)
- 検索・フィルタが正常動作

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - `features/products/types/product.ts` (拡張: barcode, costPrice, unit, shelfLifeDays, supplierId, supplierName, reorderPoint, maxStock追加、status: number→string)
  - `features/products/schemas/product-schema.ts` (Zod schema更新)
  - `features/products/lib/product-api.client.ts`
  - `features/products/lib/product-api.server.ts`
- バックエンドAPIは変更不要（既存エンドポイント使用）

# スコープ外
- 商品画像アップロード機能
- 商品カテゴリ管理
- UI変更

# 完了の目安
- 商品CRUDが全て正常動作
- Type定義がバックエンドVOと一致
- E2Eテスト (`e2e/specs/products.spec.ts`) 通過
