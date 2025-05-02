package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.form.AlertForm;
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
    void testCreateAndUpdateAndDeleteAlert() {
        // Create a new alert
        AlertForm form = new AlertForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setLotNumber("TEST-LOT-001");
        form.setAlertType("LOW_STOCK");
        form.setAlertMessage("テスト用アラート");
        form.setAlertDate(LocalDateTime.now());
        form.setResolved(false);

        // Create alert - レスポンスデータを変数に格納
        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody createResponseBody = createResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラート作成レスポンス", createResponseBody);
        System.out.println("ステータスコード: " + createResponse.getStatusCode());
        System.out.println("レスポンスコード: " + createResponse.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_create", createResponseBody);

        // レスポンスに対してアサーション
        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));

        // Get all alerts to find the newly created one
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody listResponseBody = listResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラートリスト取得レスポンス", listResponseBody);

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_list_after_create", listResponseBody);

        // 作成されたアラートのIDを取得
        String alertId = listResponse.path("data.find { it.lotNumber == 'TEST-LOT-001' }.id");
        System.out.println("作成されたアラートID: " + alertId);

        // Update the alert
        form.setAlertMessage("更新されたテスト用アラート");

        // アラート更新 - レスポンスデータを変数に格納
        Response updateResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
            .body(form)
        .when()
            .put(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody updateResponseBody = updateResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラート更新レスポンス", updateResponseBody);
        System.out.println("ステータスコード: " + updateResponse.getStatusCode());
        System.out.println("レスポンスコード: " + updateResponse.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_update_" + alertId, updateResponseBody);

        // レスポンスに対してアサーション
        updateResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));

        // Resolve the alert
        Response resolveResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .put(baseUrl + "/{id}/resolve");

        // レスポンスボディを変数に格納
        ResponseBody resolveResponseBody = resolveResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラート解決レスポンス", resolveResponseBody);
        System.out.println("ステータスコード: " + resolveResponse.getStatusCode());
        System.out.println("レスポンスコード: " + resolveResponse.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_resolve_" + alertId, resolveResponseBody);

        // レスポンスに対してアサーション
        resolveResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));

        // Delete the alert
        Response deleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", alertId)
        .when()
            .delete(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody deleteResponseBody = deleteResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("アラート削除レスポンス", deleteResponseBody);
        System.out.println("ステータスコード: " + deleteResponse.getStatusCode());

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_delete_" + alertId, deleteResponseBody);

        // レスポンスに対してアサーション
        deleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }
}
