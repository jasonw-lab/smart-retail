package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.form.InventoryOutForm;
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
 * 出庫管理コントローラー
 *
 * @author wangjw
 */
@Tag(name = "出庫管理API")
@RestController
@RequestMapping("/api/v1/inventory/out")
@RequiredArgsConstructor
public class InventoryOutController {

    private final InventoryInOutService inventoryInOutService;

    @Operation(summary = "出庫情報のページング検索")
    @GetMapping("/page")
    public PageResult<InventoryInOutVO> getInventoryOutPage(
            @Parameter(description = "検索条件") InventoryInOutPageQuery query) {
        // 出庫情報のみを検索するための条件設定
        query.setStatus("出車処理中,出車完了");
        return inventoryInOutService.getInventoryInOutPage(query);
    }

    @Operation(summary = "出庫処理")
    @PostMapping
    public Result<Boolean> inventoryOut(@Valid @RequestBody InventoryOutForm form) {
        boolean result = inventoryInOutService.inventoryOut(form);
        return Result.judge(result);
    }

    @Operation(summary = "出庫完了処理")
    @PutMapping("/{id}/complete")
    public Result<Boolean> completeInventoryOut(@PathVariable Long id) {
        boolean result = inventoryInOutService.completeInventoryOut(id);
        return Result.judge(result);
    }

    @Operation(summary = "出庫情報の詳細取得")
    @GetMapping("/{id}")
    public Result<InventoryInOutVO> getInventoryOutDetail(@PathVariable Long id) {
        InventoryInOutVO vo = inventoryInOutService.getInventoryInOutDetail(id);
        return Result.success(vo);
    }
}