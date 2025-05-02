package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.form.InventoryInForm;
import com.youlai.boot.modules.retail.model.query.InventoryInOutPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryInOutVO;
import com.youlai.boot.modules.retail.service.InventoryInOutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 入庫管理コントローラー
 *
 * @author wangjw
 */
@Tag(name = "入庫管理API")
@RestController
@RequestMapping("/api/v1/inventory/in")
@RequiredArgsConstructor
public class InventoryInController {

    private final InventoryInOutService inventoryInOutService;

    @Operation(summary = "入庫情報のページング検索")
    @GetMapping("/page")
    public PageResult<InventoryInOutVO> getInventoryInPage(
            @Parameter(description = "検索条件") InventoryInOutPageQuery query) {
        // 入庫情報のみを検索するための条件設定
        query.setStatus("入庫処理中,入庫完了");
        return inventoryInOutService.getInventoryInOutPage(query);
    }

    @Operation(summary = "入庫処理")
    @PostMapping
    public Result<Boolean> inventoryIn(@Valid @RequestBody InventoryInForm form) {
        boolean result = inventoryInOutService.inventoryIn(form);
        return Result.judge(result);
    }

    @Operation(summary = "入庫完了処理")
    @PutMapping("/{id}/complete")
    public Result<Boolean> completeInventoryIn(@PathVariable Long id) {
        boolean result = inventoryInOutService.completeInventoryIn(id);
        return Result.judge(result);
    }

    @Operation(summary = "入庫情報の詳細取得")
    @GetMapping("/{id}")
    public Result<InventoryInOutVO> getInventoryInDetail(@PathVariable Long id) {
        InventoryInOutVO vo = inventoryInOutService.getInventoryInOutDetail(id);
        return Result.success(vo);
    }
}