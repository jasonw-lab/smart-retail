package com.youlai.boot.modules.retail.controller;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * 決済履歴APIテスト
 *
 * @author jason.w
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SalesControllerRestAssuredTest extends BaseControllerTest {

    private static Long salesId;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/sales";
    }

    @Test
    @Order(1)
    @DisplayName("決済履歴一覧取得（ページング）")
    void testGetSalesPage() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("決済履歴一覧取得（ページング）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue())
                .body("data.total", greaterThanOrEqualTo(0));

        // 取得したデータからsalesIdを保存
        if (response.path("data.list") != null && !((java.util.List<?>) response.path("data.list")).isEmpty()) {
            Object idObj = ((java.util.Map<?, ?>) ((java.util.List<?>) response.path("data.list")).get(0)).get("id");
            salesId = idObj instanceof Number ? ((Number) idObj).longValue() : Long.parseLong(idObj.toString());
            System.out.println("取得した売上ID: " + salesId);
        }
    }

    @Test
    @Order(2)
    @DisplayName("決済履歴一覧取得（店舗フィルタ）")
    void testGetSalesPageByStore() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("storeId", 1)
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("決済履歴一覧取得（店舗フィルタ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(3)
    @DisplayName("決済履歴一覧取得（決済方法フィルタ）")
    void testGetSalesPageByPaymentMethod() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("paymentMethod", "CARD")
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("決済履歴一覧取得（決済方法フィルタ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(4)
    @DisplayName("決済履歴一覧取得（期間フィルタ）")
    void testGetSalesPageByDateRange() {
        LocalDate today = LocalDate.now();
        LocalDate oneMonthAgo = today.minusMonths(1);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;

        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("startDate", oneMonthAgo.format(formatter))
                .queryParam("endDate", today.format(formatter))
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("決済履歴一覧取得（期間フィルタ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(5)
    @DisplayName("決済履歴一覧取得（注文番号検索）")
    void testGetSalesPageByOrderNumber() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("pageNum", 1)
                .queryParam("pageSize", 10)
                .queryParam("orderNumber", "ORD")
                .when()
                .get(baseUrl + "/page");

        prettyPrintJson("決済履歴一覧取得（注文番号検索）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data.list", notNullValue());
    }

    @Test
    @Order(6)
    @DisplayName("決済詳細取得")
    void testGetSalesDetail() {
        if (salesId == null) {
            System.out.println("売上IDが取得できていないため、テストをスキップします");
            return;
        }

        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl + "/" + salesId);

        prettyPrintJson("決済詳細取得", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .body("data.id", notNullValue())
                .body("data.orderNumber", notNullValue())
                .body("data.totalAmount", notNullValue())
                .body("data.paymentMethod", notNullValue());
    }

    @Test
    @Order(7)
    @DisplayName("決済サマリ取得")
    void testGetSalesSummary() {
        Response response = given()
                .header("Authorization", bearerToken)
                .when()
                .get(baseUrl + "/summary");

        prettyPrintJson("決済サマリ取得", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue())
                .body("data.totalAmount", notNullValue())
                .body("data.totalCount", notNullValue());
    }

    @Test
    @Order(8)
    @DisplayName("決済サマリ取得（店舗フィルタ）")
    void testGetSalesSummaryByStore() {
        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("storeId", 1)
                .when()
                .get(baseUrl + "/summary");

        prettyPrintJson("決済サマリ取得（店舗フィルタ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    @Order(9)
    @DisplayName("決済サマリ取得（期間フィルタ）")
    void testGetSalesSummaryByDateRange() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;

        Response response = given()
                .header("Authorization", bearerToken)
                .queryParam("startDate", today.format(formatter))
                .queryParam("endDate", today.format(formatter))
                .when()
                .get(baseUrl + "/summary");

        prettyPrintJson("決済サマリ取得（期間フィルタ）", response.getBody());

        response.then()
                .statusCode(200)
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }
}
