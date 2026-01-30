package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.StoreForm;
import com.youlai.boot.modules.retail.model.query.StorePageQuery;
import com.youlai.boot.modules.retail.model.vo.StorePageVO;
import com.youlai.boot.modules.retail.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * 店舗管理API
 *
 * @author wangjw
 */
@Tag(name = "店舗管理API")
@RestController
@RequestMapping("/api/v1/retail/stores")
@RequiredArgsConstructor
public class StoreController {
    private final StoreService storeService;

    @Operation(summary = "店舗一覧（ページング）")
    @GetMapping("/page")
    public PageResult<StorePageVO> getStorePage(@Valid StorePageQuery queryParams) {
        return storeService.getStorePage(queryParams);
    }

    @Operation(summary = "店舗一覧（全件）")
    @GetMapping
    public Result<List<Store>> listStores() {
        return Result.success(storeService.listStores());
    }

    @Operation(summary = "店舗詳細取得")
    @GetMapping("/{id}")
    public Result<Store> getStore(@PathVariable Long id) {
        return Result.success(storeService.getStoreById(id));
    }

    @Operation(summary = "店舗新規作成")
    @PostMapping
    public Result<?> createStore(@RequestBody @Valid StoreForm form) {
        return Result.judge(storeService.createStore(form));
    }

    @Operation(summary = "店舗更新")
    @PutMapping("/{id}")
    public Result<?> updateStore(@PathVariable Long id, @RequestBody @Valid StoreForm form) {
        return Result.judge(storeService.updateStore(id, form));
    }

    @Operation(summary = "店舗削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteStore(@PathVariable Long id) {
        return Result.judge(storeService.deleteStore(id));
    }
}
