package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.form.DiscardForm;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;
import com.youlai.boot.modules.retail.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * 在庫管理コントローラー
 *
 * @author jason.w
 */
@Tag(name = "在庫管理API")
@RestController
@RequestMapping("/api/v1/retail/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @Operation(summary = "在庫一覧（ページング）")
    @GetMapping("/page")
    public PageResult<InventoryPageVO> getInventoryPage(@Valid InventoryPageQuery queryParams) {
        return inventoryService.getInventoryPage(queryParams);
    }

    @Operation(summary = "在庫一覧（全件）")
    @GetMapping
    public Result<List<Inventory>> listInventories() {
        return Result.success(inventoryService.listInventories());
    }

    @Operation(summary = "在庫新規作成")
    @PostMapping
    public Result<?> createInventory(@RequestBody @Valid InventoryForm form) {
        return Result.judge(inventoryService.createInventory(form));
    }

    @Operation(summary = "在庫更新")
    @PutMapping("/{id}")
    public Result<?> updateInventory(@PathVariable Long id, @RequestBody @Valid InventoryForm form) {
        return Result.judge(inventoryService.updateInventory(id, form));
    }

    @Operation(summary = "在庫削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteInventory(@PathVariable Long id) {
        return Result.judge(inventoryService.deleteInventory(id));
    }

    @Operation(summary = "在庫詳細取得")
    @GetMapping("/{id}")
    public Result<Inventory> getInventory(@PathVariable Long id) {
        return Result.success(inventoryService.getInventoryById(id));
    }

    @Operation(summary = "在庫廃棄（v1.1対応）")
    @PostMapping("/{id}/discard")
    public Result<?> discardInventory(
            @Parameter(description = "在庫ID（ロットID）") @PathVariable Long id,
            @RequestBody @Valid DiscardForm form) {
        return Result.judge(inventoryService.discardInventory(id, form));
    }
}