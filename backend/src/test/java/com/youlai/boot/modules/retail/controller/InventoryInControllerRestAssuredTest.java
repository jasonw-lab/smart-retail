package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.form.InventoryInForm;
import com.youlai.boot.modules.retail.model.query.InventoryInOutPageQuery;
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
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 入庫管理APIのテスト
 *
 * @author wangjw
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class InventoryInControllerRestAssuredTest {

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
        baseUrl = "http://localhost:" + port + "/api/v1/inventory/in";
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
    void testGetInventoryInPage() {
        InventoryInOutPageQuery query = new InventoryInOutPageQuery();
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
        prettyPrintJson("入庫情報一覧取得レスポンス", responseBody);
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
    void testInventoryIn() {
        // 入庫情報の作成
        InventoryInForm form = new InventoryInForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setQuantity(10);
        form.setLotNumber("LOT-TEST-001");
        form.setExpiryDate(LocalDate.now().plusMonths(6));
        form.setInType("仕入れ");
        form.setInOperator("テストユーザー");
        form.setRemarks("テスト用入庫データ");

        // 入庫処理のリクエスト
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);
        
        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("入庫処理レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_create", responseBody);
        
        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }

    @Test
    void testGetInventoryInDetail() {
        // テスト用の入庫データを作成
        InventoryInForm form = new InventoryInForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setQuantity(10);
        form.setLotNumber("LOT-TEST-002");
        form.setExpiryDate(LocalDate.now().plusMonths(6));
        form.setInType("仕入れ");
        form.setInOperator("テストユーザー");
        form.setRemarks("テスト用入庫データ");

        // 入庫処理を実行
        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);
        
        // 作成された入庫情報のIDを取得（実際のAPIレスポンスに合わせて調整が必要）
        Long inventoryInId = 1L; // 実際のAPIでは新しく作成されたIDを返すようにするか、既存のIDを使用
        
        // 入庫情報の詳細を取得
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryInId)
        .when()
            .get(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("入庫情報詳細取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_" + inventoryInId, responseBody);
        
        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    @Test
    void testCompleteInventoryIn() {
        // テスト用の入庫データを作成
        InventoryInForm form = new InventoryInForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setQuantity(10);
        form.setLotNumber("LOT-TEST-003");
        form.setExpiryDate(LocalDate.now().plusMonths(6));
        form.setInType("仕入れ");
        form.setInOperator("テストユーザー");
        form.setRemarks("テスト用入庫データ");

        // 入庫処理を実行
        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);
        
        // 作成された入庫情報のIDを取得（実際のAPIレスポンスに合わせて調整が必要）
        Long inventoryInId = 1L; // 実際のAPIでは新しく作成されたIDを返すようにするか、既存のIDを使用
        
        // 入庫完了処理を実行
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", inventoryInId)
        .when()
            .put(baseUrl + "/{id}/complete");
        
        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("入庫完了処理レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_complete_" + inventoryInId, responseBody);
        
        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));
    }
}