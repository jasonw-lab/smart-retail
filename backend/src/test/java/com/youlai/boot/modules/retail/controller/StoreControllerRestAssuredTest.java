package com.youlai.boot.modules.retail.controller;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * 店舗管理APIテスト
 *
 * @author wangjw
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class StoreControllerRestAssuredTest extends BaseControllerTest {

    private static Long createdStoreId;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "http://localhost:" + port + "/api/v1/retail/stores";
    }

    @Test
    @Order(1)
    @DisplayName("店舗新規作成")
    void testCreateStore() {
        Map<String, Object> storeData = new HashMap<>();
        storeData.put("storeCode", "ST001");
        storeData.put("storeName", "テスト店舗1");
        storeData.put("address", "東京都渋谷区1-1-1");
        storeData.put("phone", "03-1234-5678");
        storeData.put("manager", "山田太郎");
        storeData.put("status", "active");
        storeData.put("openingHours", "9:00-21:00");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType("application/json")
                .body(storeData)
                .when()
                .post(baseUrl)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("msg", equalTo("成功"))
                .extract()
                .response();

        prettyPrintJson("店舗新規作成", response.getBody());
    }

    @Test
    @Order(2)
    @DisplayName("店舗一覧取得（ページング）")
    void testGetStorePage() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("list", notNullValue())
                .body("total", greaterThanOrEqualTo(0))
                .extract()
                .response();

        prettyPrintJson("店舗一覧取得（ページング）", response.getBody());

        if (response.path("list") != null && !((java.util.List<?>) response.path("list")).isEmpty()) {
            createdStoreId = ((Number) ((Map<?, ?>) ((java.util.List<?>) response.path("list")).get(0)).get("id")).longValue();
            System.out.println("取得した店舗ID: " + createdStoreId);
        }
    }

    @Test
    @Order(3)
    @DisplayName("店舗一覧取得（全件）")
    void testListStores() {
        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .extract()
                .response();

        prettyPrintJson("店舗一覧取得（全件）", response.getBody());
    }

    @Test
    @Order(4)
    @DisplayName("店舗詳細取得")
    void testGetStore() {
        if (createdStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl + "/" + createdStoreId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .body("data.id", equalTo(createdStoreId.intValue()))
                .extract()
                .response();

        prettyPrintJson("店舗詳細取得", response.getBody());
    }

    @Test
    @Order(5)
    @DisplayName("店舗更新")
    void testUpdateStore() {
        if (createdStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Map<String, Object> updateData = new HashMap<>();
        updateData.put("storeCode", "ST001");
        updateData.put("storeName", "テスト店舗1（更新）");
        updateData.put("address", "東京都渋谷区2-2-2");
        updateData.put("phone", "03-9876-5432");
        updateData.put("manager", "佐藤花子");
        updateData.put("status", "active");
        updateData.put("openingHours", "10:00-22:00");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType("application/json")
                .body(updateData)
                .when()
                .put(baseUrl + "/" + createdStoreId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("店舗更新", response.getBody());
    }

    @Test
    @Order(6)
    @DisplayName("店舗検索（店舗名）")
    void testSearchStoreByName() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("storeName", "テスト")
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("list", notNullValue())
                .extract()
                .response();

        prettyPrintJson("店舗検索（店舗名）", response.getBody());
    }

    @Test
    @Order(7)
    @DisplayName("店舗検索（店舗コード）")
    void testSearchStoreByCode() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("storeCode", "ST001")
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("list", notNullValue())
                .extract()
                .response();

        prettyPrintJson("店舗検索（店舗コード）", response.getBody());
    }

    @Test
    @Order(8)
    @DisplayName("店舗検索（状態）")
    void testSearchStoreByStatus() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("status", "active")
                .when()
                .get(baseUrl + "/page")
                .then()
                .statusCode(200)
                .body("list", notNullValue())
                .extract()
                .response();

        prettyPrintJson("店舗検索（状態）", response.getBody());
    }

    @Test
    @Order(9)
    @DisplayName("店舗削除")
    void testDeleteStore() {
        if (createdStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .delete(baseUrl + "/" + createdStoreId)
                .then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .extract()
                .response();

        prettyPrintJson("店舗削除", response.getBody());
    }
}
