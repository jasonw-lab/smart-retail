package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.exception.BusinessException;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.vo.DashboardKpiVO;
import com.youlai.boot.modules.retail.model.vo.InventoryStatusVO;
import com.youlai.boot.modules.retail.model.vo.SalesTrendVO;
import com.youlai.boot.modules.retail.service.AlertService;
import com.youlai.boot.modules.retail.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * ダッシュボードコントローラー
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Tag(name = "ダッシュボードAPI")
@RestController
@RequestMapping("/api/v1/retail/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AlertService alertService;

    @Operation(summary = "KPI取得")
    @GetMapping("/kpi")
    public Result<DashboardKpiVO> getKpi() {
        DashboardKpiVO kpi = dashboardService.getKpi();
        return Result.success(kpi);
    }

    @Operation(summary = "売上推移取得")
    @GetMapping("/sales-trend")
    public Result<List<SalesTrendVO>> getSalesTrend(
            @Parameter(description = "開始日") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "終了日") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        // デフォルト: 過去7日間
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        // 入力検証
        if (startDate.isAfter(endDate)) {
            throw new BusinessException("開始日は終了日より前である必要があります");
        }
        
        if (startDate.isBefore(LocalDate.now().minusYears(1))) {
            throw new BusinessException("開始日は過去1年以内である必要があります");
        }
        
        if (endDate.isAfter(LocalDate.now())) {
            throw new BusinessException("終了日は未来の日付を指定できません");
        }

        List<SalesTrendVO> trend = dashboardService.getSalesTrend(startDate, endDate);
        return Result.success(trend);
    }

    @Operation(summary = "在庫状況取得")
    @GetMapping("/inventory-status")
    public Result<List<InventoryStatusVO>> getInventoryStatus(
            @Parameter(description = "取得件数") @RequestParam(defaultValue = "10") Integer limit
    ) {
        // 入力検証
        if (limit == null || limit < 1 || limit > 1000) {
            throw new BusinessException("limitは1から1000の範囲で指定してください");
        }
        
        List<InventoryStatusVO> inventoryStatus = dashboardService.getInventoryStatus(limit);
        return Result.success(inventoryStatus);
    }

    @Operation(summary = "アラート一覧取得")
    @GetMapping("/alerts")
    public Result<List<Alert>> getAlerts(
            @Parameter(description = "取得件数") @RequestParam(defaultValue = "10") Integer limit
    ) {
        // 入力検証
        if (limit == null || limit < 1 || limit > 1000) {
            throw new BusinessException("limitは1から1000の範囲で指定してください");
        }
        
        List<Alert> alerts = alertService.getRecentAlerts(limit);
        return Result.success(alerts);
    }
}
