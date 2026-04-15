package com.youlai.boot.modules.retail.controller;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * デバイス管理APIテスト
 *
 * @author jason.w
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DeviceControllerRestAssuredTest extends BaseControllerTest {

    private static Long createdDeviceId;
    private static Long testStoreId;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/devices";
    }

    @Test
    @Order(1)
    @DisplayName("前提条件：店舗IDを取得")
    void testGetStoreIdForTest() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 1)
                .when()
                .get("/api/v1/retail/stores/page");

        prettyPrintJson("店舗一覧取得", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"));

        if (response.path("data.list") != null && !((java.util.List<?>) response.path("data.list")).isEmpty()) {
            Object idObj = ((Map<?, ?>) ((java.util.List<?>) response.path("data.list")).get(0)).get("id");
            testStoreId = idObj instanceof Number ? ((Number) idObj).longValue() : Long.parseLong(idObj.toString());
            System.out.println("テスト用店舗ID: " + testStoreId);
        }
    }

    @Test
    @Order(2)
    @DisplayName("デバイス新規作成")
    void testCreateDevice() {
        if (testStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Map<String, Object> deviceData = new HashMap<>();
        deviceData.put("storeId", testStoreId);
        deviceData.put("deviceType", "PAYMENT_TERMINAL");
        deviceData.put("deviceName", "テスト決済端末1");
        deviceData.put("status", "ONLINE");
        deviceData.put("metadata", "{\"serial\":\"TEST-001\",\"model\":\"POS-X100\"}");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType("application/json")
                .body(deviceData)
                .when()
                .post(baseUrl);

        prettyPrintJson("デバイス新規作成", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")));
    }

    @Test
    @Order(3)
    @DisplayName("デバイス一覧取得（ページング）")
    void testGetDevicePage() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("デバイス一覧取得（ページング）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue())
                .body("data.total", greaterThanOrEqualTo(0));

        if (response.path("data.list") != null && !((java.util.List<?>) response.path("data.list")).isEmpty()) {
            Object idObj = ((Map<?, ?>) ((java.util.List<?>) response.path("data.list")).get(0)).get("id");
            createdDeviceId = idObj instanceof Number ? ((Number) idObj).longValue() : Long.parseLong(idObj.toString());
            System.out.println("取得したデバイスID: " + createdDeviceId);
        }
    }

    @Test
    @Order(4)
    @DisplayName("デバイス一覧取得（全件）")
    void testListDevices() {
        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl);

        prettyPrintJson("デバイス一覧取得（全件）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    @Order(5)
    @DisplayName("店舗別デバイス一覧取得")
    void testListDevicesByStoreId() {
        if (testStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl + "/store/" + testStoreId);

        prettyPrintJson("店舗別デバイス一覧取得", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    @Order(6)
    @DisplayName("デバイス詳細取得")
    void testGetDevice() {
        if (createdDeviceId == null) {
            System.out.println("デバイスIDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl + "/" + createdDeviceId);

        prettyPrintJson("デバイス詳細取得", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    @Order(7)
    @DisplayName("デバイス更新")
    void testUpdateDevice() {
        if (createdDeviceId == null || testStoreId == null) {
            System.out.println("デバイスIDまたは店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Map<String, Object> updateData = new HashMap<>();
        updateData.put("storeId", testStoreId);
        updateData.put("deviceType", "PAYMENT_TERMINAL");
        updateData.put("deviceName", "テスト決済端末1（更新）");
        updateData.put("status", "MAINTENANCE");
        updateData.put("errorCode", "E001");
        updateData.put("metadata", "{\"serial\":\"TEST-001\",\"model\":\"POS-X100\",\"firmware\":\"v2.0\"}");

        Response response = given()
                .header("Authorization", bearerToken)
                .contentType("application/json")
                .body(updateData)
                .when()
                .put(baseUrl + "/" + createdDeviceId);

        prettyPrintJson("デバイス更新", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"));
    }

    @Test
    @Order(8)
    @DisplayName("デバイス検索（店舗ID）")
    void testSearchDeviceByStoreId() {
        if (testStoreId == null) {
            System.out.println("店舗IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("storeId", testStoreId)
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("デバイス検索（店舗ID）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(9)
    @DisplayName("デバイス検索（デバイスタイプ）")
    void testSearchDeviceByDeviceType() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("deviceType", "PAYMENT_TERMINAL")
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("デバイス検索（デバイスタイプ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(10)
    @DisplayName("デバイス検索（ステータス）")
    void testSearchDeviceByStatus() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("status", "ONLINE")
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("デバイス検索（ステータス）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(11)
    @DisplayName("デバイス検索（デバイス名）")
    void testSearchDeviceByDeviceName() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("deviceName", "テスト")
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("デバイス検索（デバイス名）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(12)
    @DisplayName("デバイス削除")
    void testDeleteDevice() {
        if (createdDeviceId == null) {
            System.out.println("デバイスIDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .delete(baseUrl + "/" + createdDeviceId);

        prettyPrintJson("デバイス削除", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"));
    }
}
