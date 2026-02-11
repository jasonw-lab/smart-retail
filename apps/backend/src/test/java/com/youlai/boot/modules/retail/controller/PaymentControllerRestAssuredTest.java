package com.youlai.boot.modules.retail.controller;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * 決済結果受信APIテスト
 *
 * @author jason.w
 */
public class PaymentControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/payments";
    }

    @Test
    void testReceivePayment_Success() {
        Map<String, Object> payload = createPaymentPayload(1L, "CASH", null);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（成功・現金）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_success_cash", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    void testReceivePayment_CardPayment() {
        Map<String, Object> payload = createPaymentPayload(1L, "CARD", "VISA");

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（成功・カード）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_success_card", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    void testReceivePayment_QRPayment() {
        Map<String, Object> payload = createPaymentPayload(1L, "QR", "PayPay");

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（成功・QR）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_success_qr", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    void testReceivePayment_MultipleItems() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("storeId", 1L);
        payload.put("totalAmount", new BigDecimal("2500.00"));
        payload.put("paymentMethod", "CASH");
        payload.put("saleTimestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        List<Map<String, Object>> items = new ArrayList<>();

        Map<String, Object> item1 = new HashMap<>();
        item1.put("productId", 1L);
        item1.put("quantity", 2);
        item1.put("unitPrice", new BigDecimal("500.00"));
        items.add(item1);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("productId", 2L);
        item2.put("quantity", 3);
        item2.put("unitPrice", new BigDecimal("500.00"));
        items.add(item2);

        payload.put("items", items);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（複数商品）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_multiple_items", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    void testReceivePayment_WithOrderNumber() {
        String orderNumber = "ORD-TEST-" + System.currentTimeMillis();
        Map<String, Object> payload = createPaymentPayload(1L, "CASH", null);
        payload.put("orderNumber", orderNumber);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（注文番号指定）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_with_order_number", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("data", notNullValue());
    }

    @Test
    void testReceivePayment_InvalidStoreId() {
        Map<String, Object> payload = createPaymentPayload(99999L, "CASH", null);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（無効な店舗ID）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_invalid_store", responseBody);

        // 無効な店舗IDの場合はビジネスエラー（400）
        response.then()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .body("code", not(equalTo("00000")));
    }

    @Test
    void testReceivePayment_MissingRequiredFields() {
        Map<String, Object> payload = new HashMap<>();
        // storeIdのみ設定、他の必須フィールドなし

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("決済結果受信レスポンス（必須フィールド不足）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_missing_fields", responseBody);

        // バリデーションエラー（400）
        response.then()
                .statusCode(HttpStatus.BAD_REQUEST.value());
    }

    /**
     * 決済ペイロードを作成する
     */
    private Map<String, Object> createPaymentPayload(Long storeId, String paymentMethod, String provider) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("storeId", storeId);
        payload.put("totalAmount", new BigDecimal("1000.00"));
        payload.put("paymentMethod", paymentMethod);
        if (provider != null) {
            payload.put("paymentProvider", provider);
        }
        payload.put("paymentReferenceId", "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payload.put("saleTimestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("productId", 1L);
        item.put("quantity", 2);
        item.put("unitPrice", new BigDecimal("500.00"));
        items.add(item);

        payload.put("items", items);

        return payload;
    }
}
