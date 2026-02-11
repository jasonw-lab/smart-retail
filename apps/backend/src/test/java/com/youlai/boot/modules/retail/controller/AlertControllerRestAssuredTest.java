package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.form.AlertStatusForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AlertControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "http://localhost:" + port + "/api/v1/retail/alerts";
    }

    @Test
    void testGetAlertPage() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", 1)
            .queryParam("pageSize", 5)
        .when()
            .get(baseUrl + "/page");

        prettyPrintJson("アラート一覧取得レスポンス", response.getBody());
        System.out.println("ステータスコード: " + response.getStatusCode());

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testGetAlertPageWithFilters() {
        // ステータスフィルタ付きテスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", 1)
            .queryParam("pageSize", 10)
            .queryParam("status", "NEW")
            .queryParam("priority", "P1")
        .when()
            .get(baseUrl + "/page");

        prettyPrintJson("フィルタ付きアラート一覧取得レスポンス", response.getBody());

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
    }

    @Test
    void testListAlerts() {
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        prettyPrintJson("アラートリスト取得レスポンス", response.getBody());
        System.out.println("ステータスコード: " + response.getStatusCode());

        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testCreateAndStatusTransitionAndDeleteAlert() {
        // アラート作成
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setLotNumber("TEST-LOT-001");
        form.setAlertType("LOW_STOCK");
        form.setPriority("P2");
        form.setMessage("テスト用アラート - 在庫切れ警告");
        form.setThresholdValue("10");
        form.setCurrentValue("5");
        form.setDetectedAt(LocalDateTime.now());

        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        prettyPrintJson("アラート作成レスポンス", createResponse.getBody());

        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // 作成されたアラートのIDを取得
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        String alertId = listResponse.path("data.find { it.lotNumber == 'TEST-LOT-001' }.id").toString();
        System.out.println("作成されたアラートID: " + alertId);

        // アラート詳細取得
        Response detailResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .get(baseUrl + "/{id}");

        prettyPrintJson("アラート詳細取得レスポンス", detailResponse.getBody());

        detailResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("data.alertType", equalTo("LOW_STOCK"))
            .body("data.priority", equalTo("P2"))
            .body("data.status", equalTo("NEW"));

        // 状態遷移テスト: NEW -> ACK
        AlertStatusForm ackForm = new AlertStatusForm();
        ackForm.setStatus("ACK");

        Response ackResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
            .body(ackForm)
        .when()
            .put(baseUrl + "/{id}/status");

        prettyPrintJson("アラート確認(ACK)レスポンス", ackResponse.getBody());

        ackResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // 状態遷移テスト: ACK -> IN_PROGRESS
        AlertStatusForm inProgressForm = new AlertStatusForm();
        inProgressForm.setStatus("IN_PROGRESS");

        Response inProgressResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
            .body(inProgressForm)
        .when()
            .put(baseUrl + "/{id}/status");

        prettyPrintJson("アラート対応開始(IN_PROGRESS)レスポンス", inProgressResponse.getBody());

        inProgressResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // 状態遷移テスト: IN_PROGRESS -> RESOLVED
        AlertStatusForm resolvedForm = new AlertStatusForm();
        resolvedForm.setStatus("RESOLVED");
        resolvedForm.setResolutionNote("在庫を補充しました。現在在庫: 50個");

        Response resolvedResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
            .body(resolvedForm)
        .when()
            .put(baseUrl + "/{id}/status");

        prettyPrintJson("アラート解決(RESOLVED)レスポンス", resolvedResponse.getBody());

        resolvedResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // 最終状態確認
        Response finalDetailResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .get(baseUrl + "/{id}");

        prettyPrintJson("最終状態確認レスポンス", finalDetailResponse.getBody());

        finalDetailResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("data.status", equalTo("RESOLVED"))
            .body("data.resolutionNote", equalTo("在庫を補充しました。現在在庫: 50個"));

        // クリーンアップ: アラート削除
        Response deleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .delete(baseUrl + "/{id}");

        deleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));
    }

    @Test
    void testCreateExpirySoonAlert() {
        // 賞味期限接近アラート作成テスト
        String uniqueLotNumber = "EXPIRY-TEST-" + System.currentTimeMillis();
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(2L);
        form.setLotNumber(uniqueLotNumber);
        form.setAlertType("EXPIRY_SOON");
        form.setPriority("P1");
        form.setMessage("[賞味期限接近] 店舗: 東京本店, 商品: オーガニックティー, 賞味期限まで1日");
        form.setThresholdValue("7");
        form.setCurrentValue("1");
        form.setDetectedAt(LocalDateTime.now());

        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        prettyPrintJson("賞味期限接近アラート作成レスポンス", createResponse.getBody());

        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // クリーンアップ
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        Object alertIdObj = listResponse.path("data.find { it.lotNumber == '" + uniqueLotNumber + "' }.id");
        if (alertIdObj != null) {
            String alertId = alertIdObj.toString();
            given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .pathParam("id", alertId)
            .when()
                .delete(baseUrl + "/{id}");
        }
    }

    @Test
    void testCreateHighStockAlert() {
        // 在庫過多アラート作成テスト
        String uniqueLotNumber = "HIGH-STOCK-TEST-" + System.currentTimeMillis();
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(3L);
        form.setLotNumber(uniqueLotNumber);
        form.setAlertType("HIGH_STOCK");
        form.setPriority("P3");
        form.setMessage("[在庫過多] 店舗: 名古屋栄店, 商品: ミネラルウォーター, 現在在庫: 150個, 適正上限: 100個");
        form.setThresholdValue("150");
        form.setCurrentValue("150");
        form.setDetectedAt(LocalDateTime.now());

        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        prettyPrintJson("在庫過多アラート作成レスポンス", createResponse.getBody());

        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"));

        // クリーンアップ
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        Object alertIdObj = listResponse.path("data.find { it.lotNumber == '" + uniqueLotNumber + "' }.id");
        if (alertIdObj != null) {
            String alertId = alertIdObj.toString();
            given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .pathParam("id", alertId)
            .when()
                .delete(baseUrl + "/{id}");
        }
    }
}
