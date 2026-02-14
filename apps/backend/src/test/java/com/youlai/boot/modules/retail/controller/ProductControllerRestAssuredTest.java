package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
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
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.Matchers.anyOf;
import static org.junit.jupiter.api.Assertions.*;

public class ProductControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "/api/v1/retail/products";
    }

    @Test
    void testGetProductPage() {
        ProductPageQuery query = new ProductPageQuery();
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
        prettyPrintJson("商品一覧取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("データ件数: " + response.path("data.total"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_page", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data.list", not(empty()))
            .body("data.total", greaterThan(0));
    }

    @Test
    void testListProducts() {
        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品リスト取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("商品数: " + response.path("data.size()"));

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
    void testGetProductById() {
        Long productId = 1L;

        // レスポンスデータを変数に格納
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody responseBody = response.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品詳細取得レスポンス", responseBody);
        System.out.println("ステータスコード: " + response.getStatusCode());
        System.out.println("レスポンスコード: " + response.path("code"));
        System.out.println("商品ID: " + response.path("data.id"));
        System.out.println("商品名: " + response.path("data.name"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_" + productId, responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data.id", equalTo(productId.toString()));
    }

    @Test
    void testCreateAndUpdateAndDeleteProduct() {
        // Create a new product
        String uniqueCode = "TP-" + System.currentTimeMillis();
        ProductForm form = new ProductForm();
        form.setName("Test Product");
        form.setCode(uniqueCode);
        form.setPrice(new BigDecimal("99.99"));
        form.setReorderPoint(10);
        form.setMaxStock(100);
        form.setCategoryId(1L);
        form.setCategoryName("Test Category");
        form.setDescription("Test Description");

        // Create product - レスポンスデータを変数に格納
        Response createResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody createResponseBody = createResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品作成レスポンス", createResponseBody);
        System.out.println("ステータスコード: " + createResponse.getStatusCode());
        System.out.println("レスポンスコード: " + createResponse.path("code"));
        System.out.println("結果: " + createResponse.path("data"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_create", createResponseBody);

        // レスポンスに対してアサーション
        createResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
        //    .body("data", equalTo(true));
            .body("data", equalTo(null));

        // Get all products to find the newly created one
        Response listResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl);

        // レスポンスボディを変数に格納
        ResponseBody listResponseBody = listResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品リスト取得レスポンス", listResponseBody);

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_list_after_create", listResponseBody);

        String productId = listResponse.path("data.find { it.productName == 'Test Product' }.id");
        System.out.println("作成された商品ID: " + productId);

        assertNotNull(productId, "Created product not found");

        // Update the product
        form.setName("Updated Test Product");
        form.setPrice(new BigDecimal("199.99"));

        // 商品更新 - レスポンスデータを変数に格納
        Response updateResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
            .body(form)
        .when()
            .put(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody updateResponseBody = updateResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品更新レスポンス", updateResponseBody);
        System.out.println("ステータスコード: " + updateResponse.getStatusCode());
        System.out.println("レスポンスコード: " + updateResponse.path("code"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_update_" + productId, updateResponseBody);

        // レスポンスに対してアサーション
        updateResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data", equalTo(null));

        // Get the updated product
        Response getUpdatedResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody getUpdatedResponseBody = getUpdatedResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("更新された商品取得レスポンス", getUpdatedResponseBody);
        System.out.println("更新された商品名: " + getUpdatedResponse.path("data.name"));
        System.out.println("更新された商品価格: " + getUpdatedResponse.path("data.price"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_get_updated_" + productId, getUpdatedResponseBody);

        // レスポンスに対してアサーション
        getUpdatedResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data.productName", equalTo("Updated Test Product"))
            .body("data.unitPrice", equalTo(199.99f));

        // Delete the product
        Response deleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .delete(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody deleteResponseBody = deleteResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("商品削除レスポンス", deleteResponseBody);
        System.out.println("ステータスコード: " + deleteResponse.getStatusCode());

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_delete_" + productId, deleteResponseBody);

        // レスポンスに対してアサーション
        deleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data", equalTo(null));

        // Verify the product is deleted
        Response verifyDeleteResponse = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}");

        // レスポンスボディを変数に格納
        ResponseBody verifyDeleteResponseBody = verifyDeleteResponse.getBody();

        // レスポンスデータをJSONフォーマットでログ出力
        prettyPrintJson("削除確認レスポンス", verifyDeleteResponseBody);
        System.out.println("削除確認データ: " + verifyDeleteResponse.path("data"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_verify_delete_" + productId, verifyDeleteResponseBody);

        // レスポンスに対してアサーション
        verifyDeleteResponse.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", anyOf(equalTo("Success"), equalTo("一切ok")))
            .body("data", nullValue());
    }
}
