package com.youlai.boot.modules.retail.controller;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

/**
 * Heartbeat受信APIテスト
 *
 * @author jason.w
 */
public class HeartbeatControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/heartbeat";
    }

    @Test
    void testReceiveHeartbeat_Success() {
        Map<String, Object> payload = createHeartbeatPayload(1L, "ONLINE", true);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("Heartbeat受信レスポンス（成功）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_success", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"));
    }

    @Test
    void testReceiveHeartbeat_WithDeviceOffline() {
        Map<String, Object> payload = createHeartbeatPayload(1L, "OFFLINE", false);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("Heartbeat受信レスポンス（デバイスOFFLINE）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_device_offline", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"));
    }

    @Test
    void testReceiveHeartbeat_WithPrinterPaperEmpty() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("storeId", 1L);
        payload.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        Map<String, Object> deviceStats = new HashMap<>();

        Map<String, Object> paymentTerminal = new HashMap<>();
        paymentTerminal.put("status", "ONLINE");
        paymentTerminal.put("cardReaderConnected", true);
        deviceStats.put("paymentTerminal", paymentTerminal);

        Map<String, Object> printer = new HashMap<>();
        printer.put("status", "ONLINE");
        printer.put("paperLevel", "EMPTY");
        deviceStats.put("printer", printer);

        payload.put("deviceStats", deviceStats);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("Heartbeat受信レスポンス（プリンター用紙切れ）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_printer_empty", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"));
    }

    @Test
    void testReceiveHeartbeat_WithNetworkDegradation() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("storeId", 1L);
        payload.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        Map<String, Object> deviceStats = new HashMap<>();

        Map<String, Object> network = new HashMap<>();
        network.put("latencyMs", 500);
        network.put("signalStrength", "POOR");
        deviceStats.put("network", network);

        payload.put("deviceStats", deviceStats);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("Heartbeat受信レスポンス（ネットワーク劣化）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_network_degradation", responseBody);

        response.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"));
    }

    @Test
    void testReceiveHeartbeat_InvalidStoreId() {
        Map<String, Object> payload = createHeartbeatPayload(99999L, "ONLINE", true);

        Response response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .body(payload)
                .when()
                .post(baseUrl);

        ResponseBody responseBody = response.getBody();
        prettyPrintJson("Heartbeat受信レスポンス（無効な店舗ID）", responseBody);
        saveResponseBodyAsJson(baseUrl + "_invalid_store", responseBody);

        // 無効な店舗IDの場合はエラーではなくfalseが返される
        response.then()
                .statusCode(HttpStatus.OK.value());
    }

    /**
     * Heartbeatペイロードを作成する
     */
    private Map<String, Object> createHeartbeatPayload(Long storeId, String terminalStatus, Boolean cardReaderConnected) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("storeId", storeId);
        payload.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        Map<String, Object> deviceStats = new HashMap<>();

        Map<String, Object> paymentTerminal = new HashMap<>();
        paymentTerminal.put("status", terminalStatus);
        paymentTerminal.put("cardReaderConnected", cardReaderConnected);
        paymentTerminal.put("lastSelfTestAt", LocalDateTime.now().minusMinutes(5).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        deviceStats.put("paymentTerminal", paymentTerminal);

        Map<String, Object> printer = new HashMap<>();
        printer.put("status", "ONLINE");
        printer.put("paperLevel", "OK");
        deviceStats.put("printer", printer);

        Map<String, Object> network = new HashMap<>();
        network.put("latencyMs", 45);
        network.put("signalStrength", "GOOD");
        deviceStats.put("network", network);

        payload.put("deviceStats", deviceStats);

        return payload;
    }
}
