package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import io.restassured.response.ValidatableResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 在庫管理APIのテスト
 *
 * @author wangjw
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class InventoryControllerRestAssuredTest {

    @LocalServerPort
    private int port;

    private String baseUrl;
    private String bearerToken;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Bearer認証トークンを取得する
     */
    private String getBearerToken() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "123456");

        Response response = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("http://localhost:" + port + "/api/v1/auth/login");

        String token = response.path("data.accessToken");
        assertNotNull(token, "認証トークンが取得できませんでした");
        return "Bearer " + token;
    }

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        baseUrl = "http://localhost:" + port + "/api/v1/inventory";
        bearerToken = getBearerToken();
    }

    /**
     * JSONレスポンスを整形して出力する
     */
    private void prettyPrintJson(String title, ResponseBody body) {
        System.out.println("\n===== " + title + " =====");
        try {
            String prettyJson = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(body.as(Map.class));
            System.out.println(prettyJson);
        } catch (Exception e) {
            System.out.println("JSON整形エラー: " + e.getMessage());
            System.out.println(body.asString());
        }
    }

    /**
     * レスポンスボディをJSONファイルとして保存する
     */
    private void saveResponseBodyAsJson(String urlPath, ResponseBody body) {
        try {
            // ディレクトリ作成
            String dirPath = "target/test-responses";
            Path directory = Paths.get(dirPath);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            // URLからファイル名を生成
            String fileName = urlPath.replaceAll("[^a-zA-Z0-9]", "_") + ".json";
            Path filePath = directory.resolve(fileName);

            // JSONを整形
            Map<String, Object> jsonObject = body.as(Map.class);
            String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);

            // ファイルに書き込み
            Files.writeString(filePath, prettyJson);
            System.out.println("JSONファイルを保存しました: " + filePath.toAbsolutePath());
        } catch (Exception e) {
            System.out.println("JSONファイル保存エラー: " + e.getMessage());
        }
    }

    @Test
    void testGetInventoryList() {
        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl + "/list");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫一覧取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.size()"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_list", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testGetInventoryPage() {
        InventoryPageQuery query = new InventoryPageQuery();
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
        prettyPrintJson("在庫情報ページング検索レスポンス", responseBody);
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
    void testGetInventoryDetail() {
        Long inventoryId = 1L; // 実際のAPIでは既存のIDを使用

        // 在庫情報の詳細を取得
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryId)
        .when()
            .get(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫情報詳細取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_" + inventoryId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testGetInventoryByProductId() {
        Long productId = 1L; // 実際のAPIでは既存の商品IDを使用

        // 商品IDによる在庫情報を取得
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("productId", productId)
        .when()
            .get(baseUrl + "/product/{productId}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品IDによる在庫情報取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_product_" + productId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testGetInventoryByStoreId() {
        Long storeId = 1L; // 実際のAPIでは既存の店舗IDを使用

        // 店舗IDによる在庫情報を取得
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("storeId", storeId)
        .when()
            .get(baseUrl + "/store/{storeId}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("店舗IDによる在庫情報取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_store_" + storeId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testAddInventory() {
        // 在庫情報の作成
        InventoryForm form = new InventoryForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setStock(10);
        form.setExpiryDate("2024-12-31");
        form.setStatus("normal");
        form.setLotNumber("LOT-TEST-001");
        form.setRemarks("テスト用在庫データ");

        // 在庫情報の登録リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫情報登録レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_add", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }

    @Test
    void testUpdateInventory() {
        // 在庫情報の更新
        InventoryForm form = new InventoryForm();
        form.setId(1L); // 実際のAPIでは既存のIDを使用
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setStock(20);
        form.setExpiryDate("2024-12-31");
        form.setStatus("normal");
        form.setLotNumber("LOT-TEST-002");
        form.setRemarks("更新されたテスト用在庫データ");

        // 在庫情報の更新リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .put(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫情報更新レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_update", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }

    @Test
    void testDeleteInventory() {
        Long inventoryId = 1L; // 実際のAPIでは既存のIDを使用

        // 在庫情報の削除リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryId)
        .when()
            .delete(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫情報削除レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_delete_" + inventoryId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }

    @Test
    void testRestockInventory() {
        Long inventoryId = 1L; // 実際のAPIでは既存のIDを使用
        Integer amount = 5;
        String expiryDate = "2024-12-31";

        // 在庫補充リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("id", inventoryId)
            .queryParam("amount", amount)
            .queryParam("expiryDate", expiryDate)
        .when()
            .put(baseUrl + "/restock");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫補充レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_restock_" + inventoryId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }

    @Test
    void testGetInventoryHistory() {
        Long inventoryId = 1L; // 実際のAPIでは既存のIDを使用

        // 在庫履歴取得リクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryId)
        .when()
            .get(baseUrl + "/history/{id}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("在庫履歴取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_history_" + inventoryId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }
}
