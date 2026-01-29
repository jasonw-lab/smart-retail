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
            .body("data.size()", equalTo(10));
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
}
