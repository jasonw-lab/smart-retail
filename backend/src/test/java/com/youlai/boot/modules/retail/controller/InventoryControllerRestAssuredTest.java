package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.form.InventoryReplenishForm;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * 在庫管理APIテスト
 *
 * @author jason.w
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class InventoryControllerRestAssuredTest extends BaseControllerTest {

    private static Long createdInventoryId;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "http://localhost:" + port + "/api/v1/retail/inventory";
    }

    @Test
    @Order(1)
    @DisplayName("在庫一覧取得（ページング）")
    void testGetInventoryPage() {
        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue())
                .body("data.total", greaterThanOrEqualTo(0))
                .extract()
                .response();

        prettyPrintJson("在庫一覧（ページング）", response.body());
    }

    @Test
    @Order(2)
    @DisplayName("在庫一覧取得（全件）")
    void testListInventories() {
        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .when()
                .get(baseUrl)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .extract()
                .response();

        prettyPrintJson("在庫一覧（全件）", response.body());
    }

    @Test
    @Order(3)
    @DisplayName("在庫新規作成")
    void testCreateInventory() {
        InventoryForm form = new InventoryForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setLotNumber("LOT-TEST-" + System.currentTimeMillis());
        form.setQuantity(100);
        form.setMinStock(20);
        form.setMaxStock(200);
        form.setExpiryDate(LocalDate.now().plusMonths(6));
        form.setLocation("A-01-01");
        form.setStatus("normal");
        form.setRemarks("テスト用在庫");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .body(form)
                .when()
                .post(baseUrl)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("在庫新規作成", response.body());

        // 作成した在庫のIDを取得（次のテストで使用）
        Response listResponse = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 1)
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .extract()
                .response();

        if (listResponse.path("data.list") != null && !listResponse.path("data.list").toString().equals("[]")) {
            createdInventoryId = Long.valueOf(listResponse.path("data.list[0].id").toString());
            System.out.println("作成した在庫ID: " + createdInventoryId);
        }
    }

    @Test
    @Order(4)
    @DisplayName("在庫詳細取得")
    void testGetInventory() {
        if (createdInventoryId == null) {
            System.out.println("在庫IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .when()
                .get(baseUrl + "/" + createdInventoryId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .body("data.id", equalTo(createdInventoryId.intValue()))
                .extract()
                .response();

        prettyPrintJson("在庫詳細取得", response.body());
    }

    @Test
    @Order(5)
    @DisplayName("在庫補充記録")
    void testReplenishInventory() {
        if (createdInventoryId == null) {
            System.out.println("在庫IDが取得できていないため、テストをスキップします");
            return;
        }

        InventoryReplenishForm form = new InventoryReplenishForm();
        form.setQuantity(50);
        form.setReason("定期補充");
        form.setOperator("テスト担当者");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .body(form)
                .when()
                .post(baseUrl + "/" + createdInventoryId + "/replenish")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("在庫補充記録", response.body());
    }

    @Test
    @Order(6)
    @DisplayName("在庫履歴取得")
    void testGetInventoryHistory() {
        if (createdInventoryId == null) {
            System.out.println("在庫IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .when()
                .get(baseUrl + "/" + createdInventoryId + "/history")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .extract()
                .response();

        prettyPrintJson("在庫履歴取得", response.body());
    }

    @Test
    @Order(7)
    @DisplayName("在庫更新")
    void testUpdateInventory() {
        if (createdInventoryId == null) {
            System.out.println("在庫IDが取得できていないため、テストをスキップします");
            return;
        }

        InventoryForm form = new InventoryForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setLotNumber("LOT-TEST-UPDATED");
        form.setQuantity(150);
        form.setMinStock(30);
        form.setMaxStock(250);
        form.setExpiryDate(LocalDate.now().plusMonths(8));
        form.setLocation("A-01-02");
        form.setStatus("normal");
        form.setRemarks("更新されたテスト用在庫");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .body(form)
                .when()
                .put(baseUrl + "/" + createdInventoryId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("在庫更新", response.body());
    }

    @Test
    @Order(8)
    @DisplayName("在庫アラート検出")
    void testDetectInventoryAlerts() {
        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .when()
                .post(baseUrl + "/detect-alerts")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("在庫アラート検出", response.body());
    }

    @Test
    @Order(9)
    @DisplayName("在庫削除")
    void testDeleteInventory() {
        if (createdInventoryId == null) {
            System.out.println("在庫IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .when()
                .delete(baseUrl + "/" + createdInventoryId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("在庫削除", response.body());
    }

    @Test
    @Order(10)
    @DisplayName("在庫検索（店舗IDでフィルタ）")
    void testGetInventoryPageByStoreId() {
        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("storeId", 1)
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue())
                .extract()
                .response();

        prettyPrintJson("在庫検索（店舗IDでフィルタ）", response.body());
    }

    @Test
    @Order(11)
    @DisplayName("在庫検索（在庫状態でフィルタ）")
    void testGetInventoryPageByStatus() {
        Response response = given()
                .header("Authorization", bearerToken)
                .contentType(ContentType.JSON)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("status", "normal")
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue())
                .extract()
                .response();

        prettyPrintJson("在庫検索（在庫状態でフィルタ）", response.body());
    }

    /**
     * POST /api/v1/retail/inventories/{id}/discard - 在庫廃棄APIのテスト（v1.1対応）
     */
    @Test
    void testDiscardInventory() {
        Long inventoryId = 1L; // 実際のAPIでは既存のIDを使用

        // 廃棄フォームの作成
        Map<String, Object> discardForm = new HashMap<>();
        discardForm.put("quantity", 5);
        discardForm.put("reason", "期限切れ");
        discardForm.put("remarks", "テスト廃棄");

        // 廃棄リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryId)
            .body(discardForm)
        .when()
            .post("http://localhost:" + port + "/api/v1/retail/inventories/{id}/discard");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫廃棄レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_discard_" + inventoryId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    /**
     * GET /api/v1/retail/inventories/page - 期限切れフィルタ付き在庫ページングのテスト（v1.1対応）
     */
    @Test
    void testGetInventoryPageWithExpiredFilter() {
        // 期限切れフィルタ付きリクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", 1)
            .queryParam("pageSize", 10)
            .queryParam("status", "EXPIRED")
        .when()
            .get("http://localhost:" + port + "/api/v1/retail/inventories/page");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("期限切れフィルタ付き在庫ページング", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_page_expired", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }
}
