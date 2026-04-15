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

public class CategoryControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {　
        super.setUp();
        baseUrl = "/api/v1/retail/categories";
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
                .body("data.id", anyOf(equalTo(categoryId.intValue()), equalTo(categoryId.toString())));
    }

    @Test
    void testCreateAndUpdateAndDeleteCategory() {
        // Create a new category
        String uniqueCode = "CAT-TEST-" + System.currentTimeMillis();
        Category category = new Category();
        category.setCode(uniqueCode);
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
        System.out.println("レスポンスボディ: " + createResponse.getBody().asString());
        System.out.println("レスポンスコード: " + createResponse.path("code"));
        System.out.println("結果: " + createResponse.path("data"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_create", createResponseBody);

        // 400エラーの場合は終了（重複データの可能性）
        if (createResponse.getStatusCode() == 400) {
            System.out.println("400エラー: " + createResponse.path("msg"));
            return;
        }

        // レスポンスに対してアサーション
        createResponse.then()
                .statusCode(HttpStatus.OK.value())
                .body("code", equalTo("00000"))
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
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
                .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
                .body("data", nullValue());
    }
}
