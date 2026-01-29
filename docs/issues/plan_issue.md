# Issue開発計画書

**作成日**: 2026-01-29
**対象**: Smart Retail System Phase 1
**バージョン**: 1.0

---

## 1. 概要

本計画書は、Smart Retail System Phase 1の要件定義（smart-retail-requirements-v1.0.md）および画面設計（smart-retail-screen-design-v1.0.md）に基づき、実装可能な作業単位にIssueを分解したものです。

### 1.1 分解方針

- **画面機能単位**: 一覧、詳細、編集、削除を1つのセットとしてissue化
- **バックエンド/フロントエンド分離**: 各機能をバックエンドとフロントエンドで分けて管理
- **基盤機能の優先実装**: データベース、認証、共通コンポーネントを先行実装
- **段階的実装**: 依存関係を考慮した実装順序を定義

---

## 2. 既存実装状況

### 既存基盤機能（実装済み）

以下の基盤機能は既に実装されているため、新規開発は不要です：

#### ✅ 認証・認可基盤（実装済み）

**実装内容**:
- JWT認証機能（`JwtTokenManager.java`、`TokenAuthenticationFilter.java`）
- Spring Security設定（`SecurityConfig.java`）
- 認証API（`AuthController.java`）
  - ログイン（パスワード、SMS、WeChat）
  - ログアウト
  - トークンリフレッシュ
- ロールベースアクセス制御
- 認証フィルター・例外ハンドラー

**実装場所**:
- `backend/src/main/java/com/youlai/boot/core/security/`
- `backend/src/main/java/com/youlai/boot/shared/auth/`
- `backend/src/main/java/com/youlai/boot/config/SecurityConfig.java`

---

#### ✅ 共通コンポーネント・レイアウト（実装済み）

**実装内容**:
- レイアウト（`frontend/src/layout/index.vue`）
  - Sidebar、NavBar、AppMain、TagsView
  - 複数レイアウトモード対応（LEFT、TOP、MIX）
- 共通コンポーネント（22個実装済み）
  - Breadcrumb、Pagination、Upload、IconSelect
  - CURD（汎用CRUD操作）、Dict（辞書管理）
  - ECharts（グラフ）、Hamburger、Fullscreen等

**実装場所**:
- `frontend/src/layout/`
- `frontend/src/components/`

---

## 3. Issue一覧

### Phase 0: 基盤機能

#### Issue #0-1: Smart Retail用データベース設計・マイグレーション

**目的**: Smart Retail Phase 1で必要なデータベーススキーマの設計と実装

**スコープ**:
- テーブル設計（store, product, inventory, alert, device）
- マイグレーションスクリプト作成
- インデックス設計
- 初期データ投入スクリプト
- 既存テーブルとの関連設計

**成果物**:
- マイグレーションファイル（`backend/src/main/resources/db/migration/`）
- ER図
- テーブル定義書

**前提条件**:
- なし

**実装場所**:
- `backend/src/main/resources/db/migration/`
- `backend/src/main/java/com/youlai/boot/modules/retail/model/entity/`

**見積もり工数**: 中

---

### Phase 1: コア機能実装

#### Issue #1-1: ダッシュボード機能（バックエンド）

**目的**: ダッシュボード表示に必要なAPIの実装

**スコープ**:
- KPI集計API（/api/v1/retail/dashboard/kpi）
- アラート一覧API（/api/v1/retail/dashboard/alerts）
- 売上推移API（/api/v1/retail/dashboard/sales-trend）
- 在庫状況API（/api/v1/retail/dashboard/inventory-status）
- REST Assuredテストコード作成

**成果物**:
- DashboardController.java
- DashboardService.java / DashboardServiceImpl.java
- DashboardVO.java（レスポンス）
- DashboardControllerTest.java
- APIドキュメント

**実装場所**:
- `backend/src/main/java/com/youlai/boot/modules/retail/controller/`
- `backend/src/main/java/com/youlai/boot/modules/retail/service/`
- `backend/src/test/java/com/youlai/boot/modules/retail/`

**前提条件**:
- Issue #0-1完了（認証・認可は既存実装を利用）

**見積もり工数**: 中

---

#### Issue #1-2: ダッシュボード機能（フロントエンド）

**目的**: ダッシュボード画面（D-01）の実装

**スコープ**:
- KPI表示カード
- アラート一覧表示
- 売上推移グラフ（EChartsコンポーネント利用）
- 在庫状況表示
- 自動更新機能

**成果物**:
- Dashboard.vue
- KPIカードコンポーネント
- ダッシュボードAPI連携

**実装場所**:
- `frontend/src/views/retail/dashboard/`
- `frontend/src/api/retail/dashboard.ts`

**前提条件**:
- Issue #1-1完了（共通コンポーネントは既存実装を利用）

**見積もり工数**: 中

---

#### Issue #2-1: 店舗管理機能（バックエンド）

**目的**: 店舗管理に必要なCRUD APIの実装

**スコープ**:
- 店舗一覧取得API（/api/v1/retail/stores）
- 店舗詳細取得API（/api/v1/retail/stores/:id）
- 店舗作成API（POST /api/v1/retail/stores）
- 店舗更新API（PUT /api/v1/retail/stores/:id）
- 店舗削除API（DELETE /api/v1/retail/stores/:id）
- 検索・フィルタ・ソート・ページネーション機能
- REST Assuredテストコード作成

**成果物**:
- StoreController.java
- StoreService.java / StoreServiceImpl.java
- Store.java（entity）
- StoreForm.java（作成・更新）
- StorePageQuery.java（検索）
- StoreVO.java（レスポンス）
- StoreConverter.java
- StoreMapper.java / StoreMapper.xml
- StoreControllerTest.java

**実装場所**:
- `backend/src/main/java/com/youlai/boot/modules/retail/`
- `backend/src/main/resources/mapper/retail/`
- `backend/src/test/java/com/youlai/boot/modules/retail/`

**参考実装**:
- UserController.java、UserServiceImpl.java、UserPageQuery.java

**前提条件**:
- Issue #0-1完了

**見積もり工数**: 中

---

#### Issue #2-2: 店舗管理機能（フロントエンド）

**目的**: 店舗管理画面（S-01）の実装

**スコープ**:
- 店舗一覧画面（CURDコンポーネント利用）
- 店舗詳細画面
- 店舗編集画面（作成・更新）
- 店舗削除機能
- 検索・フィルタ・ソート・ページネーション機能

**成果物**:
- StoreList.vue
- StoreDetail.vue
- StoreForm.vue
- store.ts（API定義）

**実装場所**:
- `frontend/src/views/retail/store/`
- `frontend/src/api/retail/store.ts`

**前提条件**:
- Issue #2-1完了

**見積もり工数**: 中

---

#### Issue #3-1: 商品管理機能（バックエンド）

**目的**: 商品管理に必要なCRUD APIの実装

**スコープ**:
- 商品一覧取得API（/api/v1/retail/products）
- 商品詳細取得API（/api/v1/retail/products/:id）
- 商品作成API（POST /api/v1/retail/products）
- 商品更新API（PUT /api/v1/retail/products/:id）
- 商品削除API（DELETE /api/v1/retail/products/:id）
- カテゴリ管理API
- 検索・フィルタ・ソート・ページネーション機能
- REST Assuredテストコード作成

**成果物**:
- ProductController.java
- ProductService.java / ProductServiceImpl.java
- Product.java（entity）
- ProductForm.java（作成・更新）
- ProductPageQuery.java（検索）
- ProductVO.java（レスポンス）
- ProductConverter.java
- ProductMapper.java / ProductMapper.xml
- ProductControllerTest.java

**実装場所**:
- `backend/src/main/java/com/youlai/boot/modules/retail/`
- `backend/src/main/resources/mapper/retail/`
- `backend/src/test/java/com/youlai/boot/modules/retail/`

**参考実装**:
- ProductControllerRestAssuredTest.java（テスト参考）

**前提条件**:
- Issue #0-1完了

**見積もり工数**: 中

---

#### Issue #3-2: 商品管理機能（フロントエンド）

**目的**: 商品管理画面（P-01）の実装

**スコープ**:
- 商品一覧画面（CURDコンポーネント利用）
- 商品詳細画面
- 商品編集画面（作成・更新）
- 商品削除機能
- カテゴリフィルタ（Dictコンポーネント利用）
- 検索・ソート・ページネーション機能

**成果物**:
- ProductList.vue
- ProductDetail.vue
- ProductForm.vue
- product.ts（API定義）

**実装場所**:
- `frontend/src/views/retail/product/`
- `frontend/src/api/retail/product.ts`

**前提条件**:
- Issue #3-1完了

**見積もり工数**: 中

---

#### Issue #4-1: 在庫管理機能（バックエンド）

**目的**: 在庫管理に必要なAPIの実装

**スコープ**:
- 在庫一覧取得API（/api/v1/retail/inventory）
- 在庫詳細取得API（/api/v1/retail/inventory/:id）
- 在庫補充記録API（POST /api/v1/retail/inventory/:id/replenish）
- 在庫履歴取得API（/api/v1/retail/inventory/:id/history）
- 在庫アラート検出ロジック
- 検索・フィルタ・ソート・ページネーション機能
- REST Assuredテストコード作成

**成果物**:
- InventoryController.java
- InventoryService.java / InventoryServiceImpl.java
- Inventory.java（entity）
- InventoryReplenishForm.java
- InventoryPageQuery.java
- InventoryVO.java、InventoryHistoryVO.java
- InventoryConverter.java
- InventoryMapper.java / InventoryMapper.xml
- InventoryControllerTest.java

**実装場所**:
- `backend/src/main/java/com/youlai/boot/modules/retail/`
- `backend/src/main/resources/mapper/retail/`
- `backend/src/test/java/com/youlai/boot/modules/retail/`

**前提条件**:
- Issue #0-1, #3-1完了

**見積もり工数**: 大

---

#### Issue #4-2: 在庫管理機能（フロントエンド）

**目的**: 在庫管理画面（I-01）の実装

**スコープ**:
- 在庫一覧画面（CURDコンポーネント利用）
- 在庫詳細画面
- 在庫補充記録画面
- 在庫履歴表示
- アラート表示
- 検索・フィルタ・ソート・ページネーション機能

**成果物**:
- InventoryList.vue
- InventoryDetail.vue
- ReplenishForm.vue
- InventoryHistory.vue
- inventory.ts（API定義）

**実装場所**:
- `frontend/src/views/retail/inventory/`
- `frontend/src/api/retail/inventory.ts`

**前提条件**:
- Issue #4-1完了

**見積もり工数**: 大

---

#### Issue #5-1: アラート管理機能（バックエンド）

**目的**: アラート管理に必要なAPIの実装

**スコープ**:
- アラート一覧取得API（/api/v1/retail/alerts）
- アラート詳細取得API（/api/v1/retail/alerts/:id）
- アラート状態更新API（PUT /api/v1/retail/alerts/:id/status）
- アラート検出バッチ処理（PowerJob連携）
- 検索・フィルタ・ソート・ページネーション機能
- REST Assuredテストコード作成

**成果物**:
- AlertController.java
- AlertService.java / AlertServiceImpl.java
- Alert.java（entity）
- AlertStatusForm.java
- AlertPageQuery.java
- AlertVO.java
- AlertConverter.java
- AlertMapper.java / AlertMapper.xml
- AlertDetectionJob.java（バッチ処理）
- AlertControllerTest.java

**実装場所**:
- `backend/src/main/java/com/youlai/boot/modules/retail/`
- `backend/src/main/resources/mapper/retail/`
- `backend/src/test/java/com/youlai/boot/modules/retail/`

**前提条件**:
- Issue #0-1, #4-1完了

**見積もり工数**: 中

---

#### Issue #5-2: アラート管理機能（フロントエンド）

**目的**: アラート管理画面（A-01）の実装

**スコープ**:
- アラート一覧画面（CURDコンポーネント利用）
- アラート詳細画面
- アラート状態変更機能
- アラート通知表示（NoticeDropdownコンポーネント利用）
- 検索・フィルタ・ソート・ページネーション機能

**成果物**:
- AlertList.vue
- AlertDetail.vue
- alert.ts（API定義）

**実装場所**:
- `frontend/src/views/retail/alert/`
- `frontend/src/api/retail/alert.ts`

**前提条件**:
- Issue #5-1完了

**見積もり工数**: 中

---

### Phase 2: 統合・テスト

#### Issue #6-1: E2Eテスト実装

**目的**: 主要機能のE2Eテスト実装

**スコープ**:
- ダッシュボード表示テスト
- 店舗管理CRUDテスト
- 商品管理CRUDテスト
- 在庫管理テスト
- アラート管理テスト

**成果物**:
- E2Eテストスイート
- テストデータ
- テスト実行スクリプト

**前提条件**:
- 全機能実装完了

**見積もり工数**: 大

---

#### Issue #6-2: パフォーマンステスト・最適化

**目的**: システムパフォーマンスの検証と最適化

**スコープ**:
- 負荷テスト実施
- クエリ最適化
- キャッシュ実装
- フロントエンド最適化

**成果物**:
- パフォーマンステストレポート
- 最適化実装
- パフォーマンスガイドライン

**前提条件**:
- Issue #6-1完了

**見積もり工数**: 中

---

## 4. 実装順序

### 推奨実装順序

```
Phase 0: 基盤機能
└─ Issue #0-1: Smart Retail用データベース設計・マイグレーション
   ※ 認証・認可基盤、共通コンポーネント・レイアウトは既存実装を利用

Phase 1: コア機能実装（並行実施可能）
├─ ダッシュボード
│  ├─ Issue #1-1: バックエンド
│  └─ Issue #1-2: フロントエンド
│
├─ 店舗管理
│  ├─ Issue #2-1: バックエンド
│  └─ Issue #2-2: フロントエンド
│
├─ 商品管理
│  ├─ Issue #3-1: バックエンド
│  └─ Issue #3-2: フロントエンド
│
├─ 在庫管理（商品管理完了後）
│  ├─ Issue #4-1: バックエンド
│  └─ Issue #4-2: フロントエンド
│
└─ アラート管理（在庫管理完了後）
   ├─ Issue #5-1: バックエンド
   └─ Issue #5-2: フロントエンド

Phase 2: 統合・テスト
├─ Issue #6-1: E2Eテスト実装
└─ Issue #6-2: パフォーマンステスト・最適化
```

### 並行実施可能なIssue

以下のIssueは並行して実施可能：
- Issue #1-1, #2-1, #3-1（バックエンドAPI実装）
- Issue #1-2, #2-2, #3-2（フロントエンド実装、対応するバックエンド完了後）

---

## 5. 技術スタック

### バックエンド
- 言語: Java 17+
- フレームワーク: Spring Boot 3.x
- データベース: MySQL
- 認証: JWT（既存実装）
- ORM: MyBatis
- テスト: REST Assured

### フロントエンド
- 言語: TypeScript
- フレームワーク: Vue 3
- 状態管理: Pinia
- UIライブラリ: Element Plus
- グラフ: ECharts

### 既存基盤の活用
- 認証・認可: Spring Security + JWT（既存実装）
- レイアウト: frontend/src/layout/（既存実装）
- 共通コンポーネント: frontend/src/components/（既存実装）

---

## 6. 実装ガイドライン

### 6.1 バックエンド実装規約

#### ディレクトリ構造
```
backend/src/main/java/com/youlai/boot/modules/retail/
├── controller          # REST API エンドポイント
├── converter          # entity, form, vo の変換
├── mapper             # MyBatis マッパーインターフェース
├── model/
│   ├── entity        # データベースエンティティ
│   ├── form          # 更新・追加APIのリクエストパラメータ
│   ├── query         # 検索APIのリクエストパラメータ
│   └── vo            # 検索時のレスポンスパラメータ
├── service            # ビジネスロジックインターフェース
└── service/impl       # ビジネスロジック実装

backend/src/main/resources/mapper/retail/  # MyBatis XML マッパー
backend/src/test/java/com/youlai/boot/modules/retail/  # テストコード
```

#### 参考実装
- **UserPageQuery.java** - ページネーション検索クエリ
- **User.java** (entity) - データベースエンティティ
- **UserForm.java** - 更新・追加フォーム
- **UserServiceImpl.java** - サービス実装
- **UserController.java** - REST コントローラー
- **UserConverter.java** - オブジェクト変換
- **ProductControllerRestAssuredTest.java** - テストケース参考

#### API設計規約
- **エンドポイント**: `/api/v1/retail/{resource}`
- **レスポンス構造**: `res.data.list` → `res.list`、`res.data.total` → `res.total`
- **ページネーション**: PageQuery を使用
- **テスト**: REST Assured による統合テスト必須

### 6.2 フロントエンド実装規約

#### ディレクトリ構造
```
frontend/src/views/retail/
├── dashboard/         # ダッシュボード
├── store/            # 店舗管理
├── product/          # 商品管理
├── inventory/        # 在庫管理
└── alert/            # アラート管理

frontend/src/api/retail/
├── dashboard.ts
├── store.ts
├── product.ts
├── inventory.ts
└── alert.ts
```

#### 既存コンポーネントの活用
- **CURD**: 汎用CRUD操作コンポーネント
- **Pagination**: ページネーション
- **Dict**: 辞書管理（カテゴリ等）
- **ECharts**: グラフ表示
- **NoticeDropdown**: 通知表示

### 6.3 開発フロー

1. **ブランチ作成**
   ```bash
   git checkout develop
   git checkout -b feature/issue-<番号>-<概要>
   ```

2. **実装**
   - 1 Issue = 1 ブランチ
   - バックエンド: ビジネスロジック + テストコードをセット作成
   - フロントエンド: 画面 + API連携

3. **テスト・ビルド確認**
   - ビルドエラーがないことを確認
   - テストケースが全て通ることを確認

4. **動作確認（ユーザー目視）**
   - テスト・ビルド完了後、一旦停止
   - ユーザーが目視で動作確認

5. **コミット・プッシュ**
   ```bash
   git add <files>
   git commit -m "feat(retail): description (issue-XXX)"
   git push -u origin feature/issue-XXX-description
   ```

6. **PR作成**
   ```bash
   gh pr create --title "feat(retail): description (issue-XXX)" \
     --body "## Summary\n- ...\n\n## Test plan\n- [ ] ..." \
     --base develop
   ```

---

## 7. 補足事項

## 7. 補足事項

### 7.1 Issue作成時の注意点

- 各Issueには明確な完了条件を定義すること
- APIドキュメントは実装と同時に更新すること
- テストコードは実装と同時に作成すること（バックエンド必須）
- コードレビューは必須とすること
- 既存のアプリケーション基盤（`backend/src/main/java/com/youlai/boot/core/`等）は変更しない

### 7.2 品質基準

- コードカバレッジ: 80%以上（バックエンド）
- APIレスポンスタイム: 200ms以内（95パーセンタイル）
- フロントエンドレンダリング: 3秒以内（初回表示）
- REST Assuredテスト: 全APIエンドポイントをカバー

### 7.3 変更影響範囲チェックリスト

各Issue実装時に以下を確認：
- [ ] ビジネスロジック（controller, service, mapper等）
- [ ] MyBatis XML マッパーファイル
- [ ] テストソース
- [ ] フロントエンドAPI呼び出し箇所（影響がある場合）
- [ ] 既存基盤への影響がないこと

---

## 8. リスクと対策

### 8.1 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| データベース設計の変更 | 高 | Phase 0で十分な設計レビューを実施 |
| パフォーマンス問題 | 中 | 早期にパフォーマンステストを実施 |
| 既存基盤との競合 | 中 | retail配下のみ変更、既存基盤は変更しない |

### 8.2 スケジュールリスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 依存関係による遅延 | 中 | 並行実施可能なIssueを優先 |
| 要件変更 | 中 | 変更管理プロセスを明確化 |

---

## 9. Issue一覧サマリー

| Phase | Issue番号 | Issue名 | 工数 | 依存関係 |
|-------|----------|---------|------|---------|
| Phase 0 | #0-1 | Smart Retail用データベース設計・マイグレーション | 中 | なし |
| Phase 1 | #1-1 | ダッシュボード機能（バックエンド） | 中 | #0-1 |
| Phase 1 | #1-2 | ダッシュボード機能（フロントエンド） | 中 | #1-1 |
| Phase 1 | #2-1 | 店舗管理機能（バックエンド） | 中 | #0-1 |
| Phase 1 | #2-2 | 店舗管理機能（フロントエンド） | 中 | #2-1 |
| Phase 1 | #3-1 | 商品管理機能（バックエンド） | 中 | #0-1 |
| Phase 1 | #3-2 | 商品管理機能（フロントエンド） | 中 | #3-1 |
| Phase 1 | #4-1 | 在庫管理機能（バックエンド） | 大 | #0-1, #3-1 |
| Phase 1 | #4-2 | 在庫管理機能（フロントエンド） | 大 | #4-1 |
| Phase 1 | #5-1 | アラート管理機能（バックエンド） | 中 | #0-1, #4-1 |
| Phase 1 | #5-2 | アラート管理機能（フロントエンド） | 中 | #5-1 |
| Phase 2 | #6-1 | E2Eテスト実装 | 大 | 全機能完了 |
| Phase 2 | #6-2 | パフォーマンステスト・最適化 | 中 | #6-1 |

**合計**: 13 Issues

---

## 10. 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026-01-29 | 1.0 | 初版作成 | - |
| 2026-01-29 | 1.1 | 既存実装状況を反映、Issue #0-2, #0-3を削除 | - |

---

**以上**
