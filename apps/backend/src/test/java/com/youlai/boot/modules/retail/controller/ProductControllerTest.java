package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.http.Header;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class ProductControllerTest {

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>(DockerImageName.parse("mysql:8.0"))
            .withDatabaseName("youlai_boot")
            .withUsername("root")
            .withPassword("123456")
            .withInitScript("mysql/retail/retail_product.sql");

    @LocalServerPort
    private int port;

    private String baseUrl;
    private String bearerToken;

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
    }

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
        baseUrl = "/api/v1/retail/products";

        // Get a valid Bearer token before running tests
        bearerToken = getBearerToken();
    }

    @Test
    void testGetProductPage() {
        ProductPageQuery query = new ProductPageQuery();
        query.setPageNum(1);
        query.setPageSize(5);

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .queryParam("pageNum", query.getPageNum())
            .queryParam("pageSize", query.getPageSize())
        .when()
            .get(baseUrl + "/page")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.list", not(empty()))
            .body("data.total", greaterThan(0));
    }

    @Test
    void testListProducts() {
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl)
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", not(empty()));
    }

    @Test
    void testGetProductById() {
        Long productId = 1L;

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.id", equalTo(productId.toString()));
    }

    @Test
    void testCreateAndUpdateAndDeleteProduct() {
        // Create a new product
        ProductForm form = new ProductForm();
        form.setName("Test Product");
        form.setCode("TP001");
        form.setPrice(new BigDecimal("99.99"));
        form.setReorderPoint(10);
        form.setMaxStockLevel(100);
        form.setCategoryId(1L);
        form.setCategoryName("Test Category");
        form.setDescription("Test Description");

        // Create product
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .body(form)
        .when()
            .post(baseUrl)
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));

        // Get all products to find the newly created one
        String productId = given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
        .when()
            .get(baseUrl)
        .then()
            .statusCode(HttpStatus.OK.value())
            .extract()
            .path("data.find { it.name == 'Test Product' }.id");

        assertNotNull(productId, "Created product not found");

        // Update the product
        form.setName("Updated Test Product");
        form.setPrice(new BigDecimal("199.99"));

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
            .body(form)
        .when()
            .put(baseUrl + "/{id}")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));

        // Get the updated product
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data.name", equalTo("Updated Test Product"))
            .body("data.price", equalTo(199.99f));

        // Delete the product
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .delete(baseUrl + "/{id}")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", equalTo(true));

        // Verify the product is deleted
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", bearerToken)
            .pathParam("id", productId)
        .when()
            .get(baseUrl + "/{id}")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("code", equalTo("00000"))
            .body("msg", equalTo("一切ok"))
            .body("data", nullValue());
    }
}
