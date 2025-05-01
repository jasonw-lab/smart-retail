package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import com.youlai.boot.modules.retail.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * @author wangjw
 */
@Tag(name = "商品管理API")
@RestController
@RequestMapping("/api/v1/retail/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @Operation(summary = "商品一覧（ページング）")
    @GetMapping("/page")
    public PageResult<ProductPageVO> getProductPage(@Valid ProductPageQuery queryParams) {
        return productService.getProductPage(queryParams);
    }

    @Operation(summary = "商品一覧（全件）")
    @GetMapping
    public Result<List<Product>> listProducts() {
        return Result.success(productService.listProducts());
    }

    @Operation(summary = "商品新規作成")
    @PostMapping
    public Result<?> createProduct(@RequestBody @Valid ProductForm form) {
        return Result.judge(productService.createProduct(form));
    }

    @Operation(summary = "商品更新")
    @PutMapping("/{id}")
    public Result<?> updateProduct(@PathVariable Long id, @RequestBody @Valid ProductForm form) {
        return Result.judge(productService.updateProduct(id, form));
    }

    @Operation(summary = "商品削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteProduct(@PathVariable Long id) {
        return Result.judge(productService.deleteProduct(id));
    }

    @Operation(summary = "商品詳細取得")
    @GetMapping("/{id}")
    public Result<Product> getProduct(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }
} 