package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.InventoryTransaction;
import com.youlai.boot.modules.retail.model.form.InventoryTransactionForm;
import com.youlai.boot.modules.retail.model.query.InventoryTransactionPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryTransactionPageVO;
import com.youlai.boot.modules.retail.service.InventoryTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * 入出庫履歴コントローラー
 *
 * @author wangjw
 */
@Tag(name = "入出庫履歴API")
@RestController
@RequestMapping("/api/v1/retail/inventory-transactions")
@RequiredArgsConstructor
public class InventoryTransactionController {
    private final InventoryTransactionService inventoryTransactionService;

    @Operation(summary = "入出庫履歴一覧（ページング）")
    @GetMapping("/page")
    public PageResult<InventoryTransactionPageVO> getTransactionPage(@Valid InventoryTransactionPageQuery queryParams) {
        return inventoryTransactionService.getTransactionPage(queryParams);
    }

    @Operation(summary = "入庫履歴一覧（ページング）")
    @GetMapping("/inbound/page")
    public PageResult<InventoryTransactionPageVO> getInboundTransactionPage(@Valid InventoryTransactionPageQuery queryParams) {
        return inventoryTransactionService.getInboundTransactionPage(queryParams);
    }

    @Operation(summary = "出庫履歴一覧（ページング）")
    @GetMapping("/outbound/page")
    public PageResult<InventoryTransactionPageVO> getOutboundTransactionPage(@Valid InventoryTransactionPageQuery queryParams) {
        return inventoryTransactionService.getOutboundTransactionPage(queryParams);
    }

    @Operation(summary = "入出庫履歴一覧（全件）")
    @GetMapping
    public Result<List<InventoryTransaction>> listTransactions() {
        return Result.success(inventoryTransactionService.listTransactions());
    }

    @Operation(summary = "入出庫履歴新規作成")
    @PostMapping
    public Result<?> createTransaction(@RequestBody @Valid InventoryTransactionForm form) {
        return Result.judge(inventoryTransactionService.createTransaction(form));
    }

    @Operation(summary = "入庫履歴新規作成")
    @PostMapping("/inbound")
    public Result<?> createInboundTransaction(@RequestBody @Valid InventoryTransactionForm form) {
        return Result.judge(inventoryTransactionService.createInboundTransaction(form));
    }

    @Operation(summary = "出庫履歴新規作成")
    @PostMapping("/outbound")
    public Result<?> createOutboundTransaction(@RequestBody @Valid InventoryTransactionForm form) {
        return Result.judge(inventoryTransactionService.createOutboundTransaction(form));
    }

    @Operation(summary = "入出庫履歴更新")
    @PutMapping("/{id}")
    public Result<?> updateTransaction(@PathVariable Long id, @RequestBody @Valid InventoryTransactionForm form) {
        return Result.judge(inventoryTransactionService.updateTransaction(id, form));
    }

    @Operation(summary = "入出庫履歴削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteTransaction(@PathVariable Long id) {
        return Result.judge(inventoryTransactionService.deleteTransaction(id));
    }

    @Operation(summary = "入出庫履歴詳細取得")
    @GetMapping("/{id}")
    public Result<InventoryTransaction> getTransaction(@PathVariable Long id) {
        return Result.success(inventoryTransactionService.getTransactionById(id));
    }
}