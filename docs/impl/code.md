# Smart Retail 実装資産情報

**作成日**: 2026-01-29
**目的**: Issue実装時に参照する既存コード構造とパターン

---

## 1. プロジェクト構造

### 1.1 バックエンド構造

```
backend/
├── src/main/java/com/youlai/boot/
│   ├── core/                      # アプリケーション基盤（変更禁止）
│   │   └── security/              # 認証・認可（JWT、Spring Security）
│   ├── common/                    # 共通ユーティリティ
│   │   ├── result/                # Result, PageResult
│   │   └── base/                  # BasePageQuery
│   ├── system/                    # システム管理機能
│   │   ├── controller/            # UserController等
│   │   ├── service/               # UserService等
│   │   └── model/                 # User, UserPageQuery, UserForm等
│   └── modules/                   # ビジネスモジュール
│       └── retail/                # Smart Retail機能（変更可能）
│           ├── controller/        # REST API
│           ├── service/           # ビジネスロジック
│           ├── mapper/            # MyBatis Mapper
│           ├── model/
│           │   ├── entity/        # DB Entity
│           │   ├── form/          # リクエストForm
│           │   ├── query/         # 検索Query
│           │   └── vo/            # レスポンスVO
│           └── converter/         # Entity⇔Form⇔VO変換
├── src/main/resources/
│   └── mapper/retail/             # MyBatis XML
├── src/test/java/
│   └── com/youlai/boot/modules/retail/
│       └── controller/            # REST Assuredテスト
└── sql/mysql/retail/              # SQLスクリプト
```

### 1.2 フロントエンド構造

```
frontend/
├── src/
│   ├── layout/                    # レイアウト（既存実装）
│   │   ├── index.vue              # メインレイアウト
│   │   └── components/            # Sidebar, NavBar, AppMain
│   ├── components/                # 共通コンポーネント（既存実装）
│   │   ├── CURD/                  # 汎用CRUD
│   │   ├── Pagination/            # ページネーション
│   │   ├── Dict/                  # 辞書管理
│   │   └── ECharts/               # グラフ
│   ├── views/retail/              # Smart Retail画面（実装対象）
│   │   ├── dashboard/
│   │   ├── store/
│   │   ├── product/
│   │   ├── inventory/
│   │   └── alert/
│   └── api/retail/                # API定義（実装対象）
│       ├── dashboard.ts
│       ├── store.ts
│       └── ...
```

---

## 2. 実装パターン

### 2.1 Controller実装パターン

**参考**: `UserController.java`, `ProductController.java`

```java
@Tag(name = "XX管理API")
@RestController
@RequestMapping("/api/v1/retail/{resource}")
@RequiredArgsConstructor
public class XxxController {
    private final XxxService xxxService;

    @Operation(summary = "XX一覧（ページング）")
    @GetMapping("/page")
    public PageResult<XxxPageVO> getXxxPage(@Valid XxxPageQuery queryParams) {
        return xxxService.getXxxPage(queryParams);
    }

    @Operation(summary = "XX詳細取得")
    @GetMapping("/{id}")
    public Result<Xxx> getXxx(@PathVariable Long id) {
        return Result.success(xxxService.getXxxById(id));
    }

    @Operation(summary = "XX新規作成")
    @PostMapping
    public Result<?> createXxx(@RequestBody @Valid XxxForm form) {
        return Result.judge(xxxService.createXxx(form));
    }

    @Operation(summary = "XX更新")
    @PutMapping("/{id}")
    public Result<?> updateXxx(@PathVariable Long id, @RequestBody @Valid XxxForm form) {
        return Result.judge(xxxService.updateXxx(id, form));
    }

    @Operation(summary = "XX削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteXxx(@PathVariable Long id) {
        return Result.judge(xxxService.deleteXxx(id));
    }
}
```

### 2.2 Service実装パターン

**参考**: `ProductServiceImpl.java`

```java
@Service
@RequiredArgsConstructor
public class XxxServiceImpl extends ServiceImpl<XxxMapper, Xxx> implements XxxService {

    private final XxxConverter xxxConverter;

    @Override
    public PageResult<XxxPageVO> getXxxPage(XxxPageQuery queryParams) {
        // ページングパラメータ
        Page<Xxx> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        // クエリ条件
        LambdaQueryWrapper<Xxx> queryWrapper = new LambdaQueryWrapper<Xxx>()
                .like(StringUtils.hasText(queryParams.getName()), Xxx::getName, queryParams.getName())
                .eq(queryParams.getStatus() != null, Xxx::getStatus, queryParams.getStatus())
                .orderByDesc(Xxx::getCreateTime);

        // クエリ実行
        IPage<Xxx> result = this.page(page, queryWrapper);

        // 結果変換
        List<XxxPageVO> list = result.getRecords().stream()
                .map(xxxConverter::entity2Vo)
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public Xxx getXxxById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createXxx(XxxForm form) {
        Xxx entity = xxxConverter.form2Entity(form);
        return this.save(entity);
    }

    @Override
    public boolean updateXxx(Long id, XxxForm form) {
        Xxx entity = xxxConverter.form2Entity(form);
        entity.setId(id);
        return this.updateById(entity);
    }

    @Override
    public boolean deleteXxx(Long id) {
        return this.removeById(id);
    }
}
```

### 2.3 PageQuery実装パターン

**参考**: `UserPageQuery.java`

```java
@Data
@EqualsAndHashCode(callSuper = false)
@Schema(description = "XX分页查询对象")
public class XxxPageQuery extends BasePageQuery {

    @Schema(description = "关键字")
    private String keywords;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "创建时间范围")
    private List<String> createTime;

    @Schema(description = "排序的字段")
    @ValidField(allowedValues = {"create_time", "update_time"})
    private String field;

    @Schema(description = "排序方式（正序:ASC；反序:DESC）")
    private Direction direction;
}
```

### 2.4 REST Assuredテストパターン

**参考**: `ProductControllerRestAssuredTest.java`

```java
public class XxxControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/xxx";
    }

    @Test
    void testGetXxxPage() {
        XxxPageQuery query = new XxxPageQuery();
        query.setPageNum(1);
        query.setPageSize(5);

        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", query.getPageNum())
            .queryParam("pageSize", query.getPageSize())
        .when()
            .get(baseUrl + "/page");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("XX一覧取得レスポンス", responseBody);
        saveResponseBodyAsJson(baseUrl + "_page", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.list", not(empty()))
            .body("data.total", greaterThan(0));
    }

    @Test
    void testCreateXxx() {
        XxxForm form = new XxxForm();
        form.setName("テストXX");
        // ... その他のフィールド設定

        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
    }
}
```

---

## 3. レスポンス構造

### 3.1 Result構造

```json
{
  "code": "00000",
  "msg": "一切ok",
  "data": { ... }
}
```

### 3.2 PageResult構造

```json
{
  "code": "00000",
  "msg": "一切ok",
  "data": {
    "list": [ ... ],
    "total": 100
  }
}
```

**重要**: `res.data.list` → `res.list`、`res.data.total` → `res.total` の簡潔化は**不要**（既存実装に準拠）

---

## 4. 既存実装済み機能

### 4.1 認証・認可（変更禁止）

- **JWT認証**: `JwtTokenManager.java`、`TokenAuthenticationFilter.java`
- **Spring Security**: `SecurityConfig.java`
- **認証API**: `AuthController.java` (ログイン、ログアウト、トークンリフレッシュ)
- **エンドポイント**: `/api/v1/auth/login`, `/api/v1/auth/logout`

### 4.2 共通コンポーネント（変更禁止）

- **レイアウト**: `frontend/src/layout/index.vue`
- **共通コンポーネント**: 22個実装済み
  - CURD、Pagination、Dict、ECharts、Breadcrumb等

### 4.3 Retail既存実装

以下は既に実装済み：
- **ProductController**: 商品管理API
- **InventoryController**: 在庫管理API
- **AlertController**: アラート管理API
- **CategoryController**: カテゴリ管理API

---

## 5. データベース

### 5.1 SQL配置場所

- **配置先**: `backend/sql/mysql/retail/`
- **既存ファイル**:
  - `retail_category.sql`
  - `retail_inventory.sql`
  - `retail_product.sql`
  - `retail_v0.2.sql` (統合版)

### 5.2 テーブル命名規則

- プレフィックス: `retail_`
- 例: `retail_product`, `retail_inventory`, `retail_alert`, `retail_store`

---

## 6. API設計規約

### 6.1 エンドポイント規約

- **ベースパス**: `/api/v1/retail/{resource}`
- **例**:
  - `/api/v1/retail/products`
  - `/api/v1/retail/stores`
  - `/api/v1/retail/inventory`
  - `/api/v1/retail/alerts`
  - `/api/v1/retail/dashboard`

### 6.2 HTTPメソッド

| メソッド | 用途 | 例 |
|---------|------|-----|
| GET | 一覧取得 | `/api/v1/retail/products/page` |
| GET | 詳細取得 | `/api/v1/retail/products/{id}` |
| POST | 新規作成 | `/api/v1/retail/products` |
| PUT | 更新 | `/api/v1/retail/products/{id}` |
| DELETE | 削除 | `/api/v1/retail/products/{id}` |

---

## 7. 開発時の注意事項

### 7.1 変更禁止範囲

- `backend/src/main/java/com/youlai/boot/core/` - アプリケーション基盤
- `backend/src/main/java/com/youlai/boot/config/` - 設定クラス
- `frontend/src/layout/` - レイアウト
- `frontend/src/components/` - 共通コンポーネント

### 7.2 変更可能範囲

- `backend/src/main/java/com/youlai/boot/modules/retail/` - Retail機能
- `backend/src/main/resources/mapper/retail/` - MyBatis XML
- `backend/src/test/java/com/youlai/boot/modules/retail/` - テスト
- `backend/sql/mysql/retail/` - SQLスクリプト
- `frontend/src/views/retail/` - Retail画面
- `frontend/src/api/retail/` - Retail API定義

### 7.3 必須実装項目

各Issue実装時に必ず含めること：
1. **Controller** + **Service** + **Mapper** (バックエンド)
2. **Entity** + **Form** + **Query** + **VO** (モデル)
3. **Converter** (変換ロジック)
4. **MyBatis XML** (SQL)
5. **REST Assuredテスト** (統合テスト)
6. **Vue画面** + **API定義** (フロントエンド)

---

## 8. 参考実装ファイル一覧

### 8.1 バックエンド参考

| ファイル | 用途 |
|---------|------|
| `UserController.java` | Controller実装パターン |
| `UserServiceImpl.java` | Service実装パターン |
| `UserPageQuery.java` | PageQuery実装パターン |
| `User.java` | Entity実装パターン |
| `UserForm.java` | Form実装パターン |
| `UserConverter.java` | Converter実装パターン |
| `ProductController.java` | Retail Controller例 |
| `ProductServiceImpl.java` | Retail Service例 |
| `ProductControllerRestAssuredTest.java` | テスト実装パターン |

### 8.2 フロントエンド参考

| ディレクトリ/ファイル | 用途 |
|---------------------|------|
| `frontend/src/layout/` | レイアウト構造 |
| `frontend/src/components/CURD/` | 汎用CRUD操作 |
| `frontend/src/components/Pagination/` | ページネーション |
| `frontend/src/components/ECharts/` | グラフ表示 |

---

**最終更新**: 2026-01-29
