package com.youlai.boot.modules.retail.controller;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * ダッシュボードコントローラーテスト
 *
 * @author wangjw
 * @since 2026-01-29
 */
public class DashboardControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/dashboard";
    }

    // ========== 正常系テスト ==========

    @Test
    void testGetKpi() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl + "/kpi");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("KPI取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        saveResponseBodyAsJson(baseUrl + "_kpi", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", notNullValue())
            .body("data.todaySales", notNullValue())
            .body("data.activeStoreCount", notNullValue())
            .body("data.pendingAlertCount", notNullValue())
            .body("data.outOfStockSkuCount", notNullValue());
    }

    @Test
    void testGetSalesTrend() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl + "/sales-trend");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("売上推移取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.size()"));

        saveResponseBodyAsJson(baseUrl + "_sales_trend", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", notNullValue())
            .body("data", not(empty()));
    }

    @Test
    void testGetSalesTrendWithDateRange() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("startDate", "2026-01-20")
            .queryParam("endDate", "2026-01-29")
        .when()
            .get(baseUrl + "/sales-trend");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("売上推移取得（期間指定）レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("データ件数: " + response.path("data.size()"));

        saveResponseBodyAsJson(baseUrl + "_sales_trend_range", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("data", notNullValue())
            .body("data.size()", greaterThan(0));
    }

    @Test
    void testGetInventoryStatus() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 10)
        .when()
            .get(baseUrl + "/inventory-status");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("在庫状況取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.size()"));

        saveResponseBodyAsJson(baseUrl + "_inventory_status", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", notNullValue());
    }

    @Test
    void testGetAlerts() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 10)
        .when()
            .get(baseUrl + "/alerts");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("アラート一覧取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.size()"));

        saveResponseBodyAsJson(baseUrl + "_alerts", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", notNullValue());
    }

    // ========== 異常系テスト: limitパラメータ ==========

    @Test
    void testGetInventoryStatusWithNegativeLimit() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", -1)
        .when()
            .get(baseUrl + "/inventory-status");

        System.out.println("負のlimitテスト - ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")))
            .body("msg", notNullValue());
    }

    @Test
    void testGetInventoryStatusWithTooLargeLimit() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 99999)
        .when()
            .get(baseUrl + "/inventory-status");

        System.out.println("大きすぎるlimitテスト - ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")))
            .body("msg", notNullValue());
    }

    @Test
    void testGetInventoryStatusWithZeroLimit() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 0)
        .when()
            .get(baseUrl + "/inventory-status");

        System.out.println("ゼロlimitテスト - ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")));
    }

    @Test
    void testGetAlertsWithNegativeLimit() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", -5)
        .when()
            .get(baseUrl + "/alerts");

        System.out.println("アラート負のlimitテスト - ステータスコード: " + response.getStatusCode());
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")));
    }

    @Test
    void testGetAlertsWithTooLargeLimit() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 10000)
        .when()
            .get(baseUrl + "/alerts");

        System.out.println("アラート大きすぎるlimitテスト - ステータスコード: " + response.getStatusCode());

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")));
    }

    // ========== 異常系テスト: 日付範囲 ==========

    @Test
    void testGetSalesTrendWithInvalidDateRange() {
        // startDate > endDate の場合
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("startDate", "2026-01-29")
            .queryParam("endDate", "2026-01-20")  // 開始日より前
        .when()
            .get(baseUrl + "/sales-trend");

        System.out.println("無効な日付範囲テスト - ステータスコード: " + response.getStatusCode());
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")))
            .body("msg", containsString("開始日"));
    }

    @Test
    void testGetSalesTrendWithFutureDate() {
        // 未来の日付
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("startDate", "2026-01-20")
            .queryParam("endDate", "2027-12-31")  // 未来の日付
        .when()
            .get(baseUrl + "/sales-trend");

        System.out.println("未来日付テスト - ステータスコード: " + response.getStatusCode());
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")))
            .body("msg", containsString("未来"));
    }

    @Test
    void testGetSalesTrendWithTooOldDate() {
        // 過去すぎる日付（1年以上前）
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("startDate", "2020-01-01")  // 1年以上前
            .queryParam("endDate", "2026-01-29")
        .when()
            .get(baseUrl + "/sales-trend");

        System.out.println("過去すぎる日付テスト - ステータスコード: " + response.getStatusCode());
        System.out.println("メッセージ: " + response.path("msg"));

        response.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .body("code", not(equalTo("00000")))
            .body("msg", containsString("過去1年"));
    }

    // ========== 境界値テスト ==========

    @Test
    void testGetInventoryStatusBoundaryLimits() {
        // 境界値: limit=1 (最小値)
        Response response1 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1)
        .when()
            .get(baseUrl + "/inventory-status");
        
        response1.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("data", notNullValue());
        
        System.out.println("境界値テスト(limit=1) - データ件数: " + response1.path("data.size()"));
        
        // 境界値: limit=1000 (最大値)
        Response response2 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1000)
        .when()
            .get(baseUrl + "/inventory-status");
        
        response2.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
        
        System.out.println("境界値テスト(limit=1000) - データ件数: " + response2.path("data.size()"));
        
        // 境界値を超える: limit=1001
        Response response3 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1001)
        .when()
            .get(baseUrl + "/inventory-status");
        
        response3.then()
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        System.out.println("境界値超えテスト(limit=1001) - ステータスコード: " + response3.getStatusCode());
    }

    @Test
    void testGetAlertsBoundaryLimits() {
        // 境界値: limit=1 (最小値)
        Response response1 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1)
        .when()
            .get(baseUrl + "/alerts");
        
        response1.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
        
        System.out.println("アラート境界値(limit=1) - データ件数: " + response1.path("data.size()"));
        
        // 境界値: limit=1000 (最大値)
        Response response2 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1000)
        .when()
            .get(baseUrl + "/alerts");
        
        response2.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
        
        System.out.println("アラート境界値(limit=1000) - データ件数: " + response2.path("data.size()"));
    }
}
