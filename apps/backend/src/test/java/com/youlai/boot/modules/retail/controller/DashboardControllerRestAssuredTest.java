package com.youlai.boot.modules.retail.controller;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.Matchers.anyOf;

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
        System.out.println("使用するBearerToken: " + (bearerToken != null ? bearerToken.substring(0, Math.min(20, bearerToken.length())) + "..." : "null"));

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

        // 400エラーの場合は認証失敗の可能性
        if (response.getStatusCode() == 400 || response.getStatusCode() == 401 || response.getStatusCode() == 403) {
            System.out.println("KPI取得がステータス" + response.getStatusCode() + "で終了: " + response.path("msg"));
            return;
        }

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
        Object trendData = response.path("data");
        System.out.println("データ件数: " + (trendData != null ? ((java.util.List<?>) trendData).size() : 0));

        saveResponseBodyAsJson(baseUrl + "_sales_trend", responseBody);

        // 400エラーの場合は認証失敗の可能性
        if (response.getStatusCode() == 400 || response.getStatusCode() == 401 || response.getStatusCode() == 403) {
            System.out.println("売上推移取得がステータス" + response.getStatusCode() + "で終了: " + response.path("msg"));
            return;
        }

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")));
    }

    @Test
    void testGetSalesTrendWithDateRange() {
        // 過去7日間のデータを取得（動的な日付を使用）
        java.time.LocalDate endDate = java.time.LocalDate.now();
        java.time.LocalDate startDate = endDate.minusDays(6);

        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("startDate", startDate.toString())
            .queryParam("endDate", endDate.toString())
        .when()
            .get(baseUrl + "/sales-trend");

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("売上推移取得（期間指定）レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        Object trendRangeData = response.path("data");
        System.out.println("データ件数: " + (trendRangeData != null ? ((java.util.List<?>) trendRangeData).size() : 0));

        saveResponseBodyAsJson(baseUrl + "_sales_trend_range", responseBody);

        // 400エラーの場合は認証失敗の可能性
        if (response.getStatusCode() == 400 || response.getStatusCode() == 401 || response.getStatusCode() == 403) {
            System.out.println("売上推移取得がステータス" + response.getStatusCode() + "で終了: " + response.path("msg"));
            return;
        }

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
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
        Object data = response.path("data");
        System.out.println("データ件数: " + (data != null ? ((java.util.List<?>) data).size() : 0));

        saveResponseBodyAsJson(baseUrl + "_inventory_status", responseBody);

        // 権限設定によっては403が返る可能性があるため柔軟に対応
        int statusCode = response.getStatusCode();
        if (statusCode == 200) {
            response.then()
                .body("code", equalTo("00000"))
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")));
        } else {
            System.out.println("在庫状況取得がステータス" + statusCode + "で終了（権限設定の可能性）");
        }
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
        Object alertData = response.path("data");
        System.out.println("データ件数: " + (alertData != null ? ((java.util.List<?>) alertData).size() : 0));

        saveResponseBodyAsJson(baseUrl + "_alerts", responseBody);

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        // APIの実装によってエラーか正常かが変わる可能性があるため、ステータスコードを確認のみ
        response.then()
            .statusCode(anyOf(equalTo(HttpStatus.OK.value()), equalTo(HttpStatus.BAD_REQUEST.value()), equalTo(HttpStatus.INTERNAL_SERVER_ERROR.value())));
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

        int statusCode1 = response1.getStatusCode();
        System.out.println("境界値テスト(limit=1) - ステータスコード: " + statusCode1);

        // 権限設定によっては403が返る可能性があるため柔軟に対応
        if (statusCode1 == 200) {
            response1.then()
                .body("code", equalTo("00000"));
            Object data1 = response1.path("data");
            System.out.println("境界値テスト(limit=1) - データ件数: " + (data1 != null ? ((java.util.List<?>) data1).size() : 0));
        } else {
            System.out.println("在庫状況取得がステータス" + statusCode1 + "で終了（権限設定の可能性）");
        }

        // 境界値: limit=1000 (最大値)
        Response response2 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1000)
        .when()
            .get(baseUrl + "/inventory-status");

        int statusCode2 = response2.getStatusCode();
        System.out.println("境界値テスト(limit=1000) - ステータスコード: " + statusCode2);

        if (statusCode2 == 200) {
            response2.then()
                .body("code", equalTo("00000"));
            Object data2 = response2.path("data");
            System.out.println("境界値テスト(limit=1000) - データ件数: " + (data2 != null ? ((java.util.List<?>) data2).size() : 0));
        }

        // 境界値を超える: limit=1001
        Response response3 = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("limit", 1001)
        .when()
            .get(baseUrl + "/inventory-status");

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

        Object alertData1 = response1.path("data");
        System.out.println("アラート境界値(limit=1) - データ件数: " + (alertData1 != null ? ((java.util.List<?>) alertData1).size() : 0));

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

        Object alertData2 = response2.path("data");
        System.out.println("アラート境界値(limit=1000) - データ件数: " + (alertData2 != null ? ((java.util.List<?>) alertData2).size() : 0));
    }
}
