package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Category;
import com.youlai.boot.modules.retail.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * カテゴリ管理API
 */
@Tag(name = "カテゴリ管理API")
@RestController
@RequestMapping("/api/v1/retail/categories")
@RequiredArgsConstructor
public class    CategoryController {
    private final CategoryService categoryService;

    @Operation(summary = "カテゴリ一覧")
    @GetMapping
    public Result<List<Category>> listCategories() {
        return Result.success(categoryService.listCategories());
    }

    @Operation(summary = "カテゴリ詳細取得")
    @GetMapping("/{id}")
    public Result<Category> getCategory(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @Operation(summary = "カテゴリ新規作成")
    @PostMapping
    public Result<?> createCategory(@RequestBody @Valid Category category) {
        return Result.judge(categoryService.createCategory(category));
    }

    @Operation(summary = "カテゴリ更新")
    @PutMapping("/{id}")
    public Result<?> updateCategory(@PathVariable Long id, @RequestBody @Valid Category category) {
        return Result.judge(categoryService.updateCategory(id, category));
    }

    @Operation(summary = "カテゴリ削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteCategory(@PathVariable Long id) {
        return Result.judge(categoryService.deleteCategory(id));
    }
}