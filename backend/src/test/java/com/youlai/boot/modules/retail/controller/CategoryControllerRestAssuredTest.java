package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.entity.Category;
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
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CategoryControllerRestAssuredTest {

    @LocalServerPort
    private int port;

    private String baseUrl;
    private String bearerToken;
    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get a valid Bearer token for authentication
     * @return Bearer token string
     */
    private String getBearerToken() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "123456");

        String token = given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/api/v1/auth/login")
        .then()
            .statusCode(HttpStatus.OK.value())
            .extract()
            .path("data.accessToken");

        return "Bearer " + token;
    }

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        baseUrl = "/api/v1/retail/categories";

        // Get a valid Bearer token before running tests
        // bearerToken = getBearerToken();

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
     * @param urlPath リクエストURL（ファイル名として使用）
     * @param body レスポンスボディ
     */
    private void saveResponseBodyAsJson(String urlPath, ResponseBody body) {
        try {
            // ファイル名に使用できない文字を置換
            String fileName = urlPath.replaceAll("[\\/:*?\"<>|]", "_") + ".json";
            
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
    void testListCategories() {
        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);
        
        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリリスト取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("カテゴリ数: " + response.path("data.size()"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl, responseBody);
        
        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", not(empty()));
    }

    @Test
    void testGetCategoryById() {
        Long categoryId = 1L;

        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", categoryId)
        .when()
            .get(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリ詳細取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("カテゴリID: " + response.path("data.id"));
        System.out.println("カテゴリ名: " + response.path("data.name"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_" + categoryId, responseBody);
        
        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.id", equalTo(categoryId.intValue()));
    }

    @Test
    void testCreateAndUpdateAndDeleteCategory() {
        // Create a new category
        Category category = new Category();
        category.setName("テストカテゴリ");

        // Create category - レスポンスデータを変数に格納
        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(category)
        .when()
            .post(baseUrl);
        
        // レスポンスボディを変数に格納
        ResponseBody createResponseBody = createResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリ作成レスポンス", createResponseBody);
        System.out.println("ステータスコード: " + createResponse.getStatusCode());
        System.out.println("レスポンスコード: " + createResponse.path("code"));
        System.out.println("結果: " + createResponse.path("data"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_create", createResponseBody);
        
        // レスポンスに対してアサーション
        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(null));

        // Get all categories to find the newly created one
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);
        
        // レスポンスボディを変数に格納
        ResponseBody listResponseBody = listResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリリスト取得レスポンス", listResponseBody);
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_list_after_create", listResponseBody);
        
        String categoryId = listResponse.path("data.find { it.name == 'テストカテゴリ' }.id");
        System.out.println("作成されたカテゴリID: " + categoryId);
    
        assertNotNull(categoryId, "Created category not found");
    
        // Update the category
        category.setName("更新テストカテゴリ");
    
        // カテゴリ更新 - レスポンスデータを変数に格納
        Response updateResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", categoryId)
            .body(category)
        .when()
            .put(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody updateResponseBody = updateResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリ更新レスポンス", updateResponseBody);
        System.out.println("ステータスコード: " + updateResponse.getStatusCode());
        System.out.println("レスポンスコード: " + updateResponse.path("code"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_update_" + categoryId, updateResponseBody);
        
        // レスポンスに対してアサーション
        updateResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(null));
    
        // Get the updated category
        Response getUpdatedResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", categoryId)
        .when()
            .get(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody getUpdatedResponseBody = getUpdatedResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("更新されたカテゴリ取得レスポンス", getUpdatedResponseBody);
        System.out.println("更新されたカテゴリ名: " + getUpdatedResponse.path("data.name"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_get_updated_" + categoryId, getUpdatedResponseBody);
        
        // レスポンスに対してアサーション
        getUpdatedResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.name", equalTo("更新テストカテゴリ"));
    
        // Delete the category
        Response deleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", categoryId)
        .when()
            .delete(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody deleteResponseBody = deleteResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("カテゴリ削除レスポンス", deleteResponseBody);
        System.out.println("ステータスコード: " + deleteResponse.getStatusCode());
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_delete_" + categoryId, deleteResponseBody);
        
        // レスポンスに対してアサーション
        deleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(null));
    
        // Verify the category is deleted
        Response verifyDeleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", categoryId)
        .when()
            .get(baseUrl + "/{id}");
        
        // レスポンスボディを変数に格納
        ResponseBody verifyDeleteResponseBody = verifyDeleteResponse.getBody();
            
        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("削除確認レスポンス", verifyDeleteResponseBody);
        System.out.println("削除確認データ: " + verifyDeleteResponse.path("data"));
        
        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_verify_delete_" + categoryId, verifyDeleteResponseBody);
        
        // レスポンスに対してアサーション
        verifyDeleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", nullValue());
    }
}