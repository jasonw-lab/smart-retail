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
import java.time.LocalDate;
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
public class InventoryControllerRestAssuredTest extends BaseControllerTest {

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        baseUrl = "http://localhost:" + port + "/api/v1/inventory";
    }

    /**
     * GET /api/v1/inventory/list - 在庫一覧を取得するAPIのテスト
     */
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
        // Check if data exists before trying to get its size
        Object data = response.path("data");
        System.out.println("データ件数: " + (data != null ? response.path("data.size()") : "0"));

        // レスポンスボディをJSONファイルとして保存
        saveResponseBodyAsJson(baseUrl + "_list", responseBody);

        // レスポンスに対してアサーション
        response.then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"));
    }

    /**
     * GET /api/v1/inventory/page - 在庫情報をページング検索するAPIのテスト
     */
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

    /**
     * GET /api/v1/inventory/{id} - 在庫情報の詳細を取得するAPIのテスト
     */
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

    /**
     * GET /api/v1/inventory/product/{productId} - 商品IDによる在庫情報を取得するAPIのテスト
     */
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

    /**
     * GET /api/v1/inventory/store/{storeId} - 店舗IDによる在庫情報を取得するAPIのテスト
     */
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

    /**
     * POST /api/v1/inventory - 在庫情報を登録するAPIのテスト
     */
    @Test
    void testAddInventory() {
        // 在庫情報の作成
        InventoryForm form = new InventoryForm();
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setQuantity(10);
        form.setExpiryDate(LocalDate.parse("2024-12-31"));
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

    /**
     * PUT /api/v1/inventory - 在庫情報を更新するAPIのテスト
     */
    @Test
    void testUpdateInventory() {
        // 在庫情報の更新
        InventoryForm form = new InventoryForm();
        // ID is not part of the form, it's used in the URL path
        form.setStoreId(1L);
        form.setProductId(1L);
        form.setQuantity(20);
        form.setExpiryDate(LocalDate.parse("2024-12-31"));
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

    /**
     * DELETE /api/v1/inventory/{id} - 在庫情報を削除するAPIのテスト
     */
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

    /**
     * PUT /api/v1/inventory/restock - 在庫を補充するAPIのテスト
     */
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

    /**
     * GET /api/v1/inventory/history/{id} - 在庫履歴を取得するAPIのテスト
     */
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
