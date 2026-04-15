package com.youlai.boot.modules.retail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.restassured.response.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;

/**
 * コントローラーテストの基底クラス
 * 共通機能を提供する
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseControllerTest {

    // ポートごとにBearerTokenを保存（テスト並列実行対応）
    private static final java.util.concurrent.ConcurrentHashMap<Integer, String> tokenByPort = new java.util.concurrent.ConcurrentHashMap<>();

    @LocalServerPort
    protected int port;

    @Autowired
    protected ObjectMapper objectMapper;

    protected String baseUrl;
    protected String bearerToken;

    /**
     * 認証トークンを取得する
     * ポートごとに保存されたトークンがある場合はそれを返す
     * @return Bearer トークン
     */
    protected String getBearerToken() {
        // ポートごとにトークンをキャッシュ
        String cachedToken = tokenByPort.get(port);
        if (cachedToken != null && !cachedToken.isEmpty()) {
            return cachedToken;
        }

        // ログイン情報
        String username = "admin";
        String password = "123456";

        // ログインリクエスト（AuthControllerのAPIに合わせてパラメータを使用）
        Response response = given()
                .contentType(ContentType.URLENC)
                .formParam("username", username)
                .formParam("password", password)
                .when()
                .post("http://localhost:" + port + "/api/v1/auth/login");

        // トークンを取得
        String token = response.path("data.accessToken");
        if (token == null || token.isEmpty()) {
            // If token is null or empty, log an error and the response body to help diagnose the issue
            System.out.println("Error: Failed to retrieve access token from response for port " + port);
            System.out.println("Response status code: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody().asString());
            return "";
        }
        String bearerTokenValue = "Bearer " + token;
        tokenByPort.put(port, bearerTokenValue);
        return bearerTokenValue;
    }

    /**
     * テスト前の準備
     * RestAssuredの設定とベースURLの初期化
     */
    @BeforeEach
    protected void setUp() {
        RestAssured.reset();
        RestAssured.port = port;
        RestAssured.basePath = "";
        // ポートに対応するBearerTokenを取得して設定する
        bearerToken = getBearerToken();
        if (bearerToken == null || bearerToken.isEmpty()) {
            System.out.println("Warning: Authentication failed for port " + port + ". Tests requiring authentication may fail.");
        }
        // baseUrlは各サブクラスで設定する
    }

    /**
     * JSONレスポンスを整形して出力する
     * @param title タイトル
     * @param body レスポンスボディ
     */
    protected void prettyPrintJson(String title, ResponseBody body) {
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
     * @param urlPath URLパス
     * @param body レスポンスボディ
     */
    protected void saveResponseBodyAsJson(String urlPath, ResponseBody body) {
        try {
            // コントローラー名を取得（baseUrlから抽出）
            String controllerName = getControllerNameFromBaseUrl();

            // ディレクトリ作成
            String dirPath = "src/test/java/com/youlai/boot/modules/retail/controller/" + controllerName;
            Path directory = Paths.get(dirPath);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

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

            // URLからファイル名を生成
            String fileName = "_" + cleanPath.replaceAll("[^a-zA-Z0-9]", "_") + ".json";
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

    /**
     * ベースURLからコントローラー名を抽出する
     * @return コントローラー名
     */
    private String getControllerNameFromBaseUrl() {
        if (baseUrl == null || baseUrl.isEmpty()) {
            return "unknown";
        }

        // URLの最後の部分を取得
        String[] parts = baseUrl.split("/");
        String lastPart = parts[parts.length - 1];

        // 先頭を大文字にする
        if (lastPart.length() > 0) {
            return lastPart.substring(0, 1).toUpperCase() + lastPart.substring(1);
        }

        return lastPart;
    }
}
