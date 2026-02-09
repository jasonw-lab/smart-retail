package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.form.AlertStatusForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AlertControllerRestAssuredTest {

    @LocalServerPort
    private int port;

    private String baseUrl;
    private String bearerToken;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        baseUrl = "/api/v1/retail/alerts";

        // 固定のトークンを使用
        bearerToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjowLCJleHAiOjE3NDY1ODcyNDgsInVzZXJJZCI6MiwiaWF0IjoxNzQ1OTgyNDQ4LCJhdXRob3JpdGllcyI6WyJST0xFX0FETUlOIl0sImp0aSI6IjU0MzQ2MWE5Y2NjMDQ2MjA5NWVmMzZmMWFlMGZiZDdiIn0.sN-EHmgOa7dIctxILX-cUSD1Sz-nn5HZ3xn2A5DO5AI";
    }

    /**
     * JSONデータを整形して出力
     */
    private void prettyPrintJson(String title, ResponseBody body) {
        try {
            Object jsonObject = objectMapper.readValue(body.asString(), Object.class);
            String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
            System.out.println(title + ":\n" + prettyJson);
        } catch (Exception e) {
            System.out.println(title + ": JSON整形エラー: " + e.getMessage());
            System.out.println("生データ: " + body.asString());
        }
    }

    /**
     * レスポンスボディをJSONファイルとして保存する
     */
    private void saveResponseBodyAsJson(String urlPath, ResponseBody body) {
        try {
            // URLからホスト部分を削除
            String cleanPath = urlPath;
            // http://localhost:XXXXX/api/... のようなパターンを削除
            if (urlPath.contains("://")) {
                // URLからパス部分のみを抽出
                int pathStartIndex = urlPath.indexOf("/", urlPath.indexOf("://") + 3);
                if (pathStartIndex > 0) {
                    cleanPath = urlPath.substring(pathStartIndex);
                }
            }

            // ファイル名に使用できない文字を置換
            String fileName = cleanPath.replaceAll("[\\/:*?\"<>|]", "_") + ".json";

            // テストファイルと同じディレクトリにファイルを保存
            Path directoryPath = Paths.get("src/test/java/com/youlai/boot/modules/retail/controller");
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            Path filePath = directoryPath.resolve(fileName);

            // JSONデータを整形
            Object jsonObject = objectMapper.readValue(body.asString(), Object.class);
            String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);

            // ファイルに書き込み
            Files.writeString(filePath, prettyJson);
            System.out.println("JSONファイルを保存しました: " + filePath.toAbsolutePath());
        } catch (Exception e) {
            System.out.println("JSONファイル保存エラー: " + e.getMessage());
        }
    }

    @Test
    void testGetAlertPage() {
        AlertPageQuery query = new AlertPageQuery();
        query.setPageNum(1);
        query.setPageSize(5);

        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", query.getPageNum())
            .queryParam("pageSize", query.getPageSize())
        .when()
            .get(baseUrl + "/page");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラート一覧取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.total"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_page", responseBody);

        // レスポンスに対してアサーション
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
        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラートリスト取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl, responseBody);

        // レスポンスに対してアサーション
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
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(2L);
        form.setLotNumber("LOT-2026-0209");
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

        String alertId = listResponse.path("data.find { it.lotNumber == 'LOT-2026-0209' }.id").toString();

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .delete(baseUrl + "/{id}");
    }

    @Test
    void testCreateHighStockAlert() {
        // 在庫過多アラート作成テスト
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(3L);
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

        String alertId = listResponse.path("data.find { it.alertType == 'HIGH_STOCK' && it.productId == 3 }.id").toString();

        if (alertId != null && !alertId.equals("null")) {
            given()
                .contentType(ContentType.JSON)
                .header("Authorization", bearerToken)
                .pathParam("id", alertId)
            .when()
                .delete(baseUrl + "/{id}");
        }
    }
}
