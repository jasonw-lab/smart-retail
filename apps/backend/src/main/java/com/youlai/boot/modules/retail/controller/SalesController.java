package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.query.SalesPageQuery;
import com.youlai.boot.modules.retail.model.vo.SalesDetailVO;
import com.youlai.boot.modules.retail.model.vo.SalesPageVO;
import com.youlai.boot.modules.retail.model.vo.SalesSummaryVO;
import com.youlai.boot.modules.retail.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * 決済履歴API
 *
 * @author jason.w
 */
@Tag(name = "決済履歴API")
@RestController
@RequestMapping("/api/v1/retail/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @Operation(summary = "決済履歴一覧（ページング）")
    @GetMapping("/page")
    public PageResult<SalesPageVO> getSalesPage(@Valid SalesPageQuery queryParams) {
        return salesService.getSalesPage(queryParams);
    }

    @Operation(summary = "決済詳細取得")
    @GetMapping("/{id}")
    public Result<SalesDetailVO> getSalesDetail(@PathVariable Long id) {
        return Result.success(salesService.getSalesDetail(id));
    }

    @Operation(summary = "決済サマリ取得")
    @GetMapping("/summary")
    public Result<SalesSummaryVO> getSalesSummary(@Valid SalesPageQuery queryParams) {
        return Result.success(salesService.getSalesSummary(queryParams));
    }
}
