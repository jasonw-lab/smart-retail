package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlai.boot.modules.retail.mapper.AlertMapper;
import com.youlai.boot.modules.retail.mapper.DashboardMapper;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.vo.DashboardKpiVO;
import com.youlai.boot.modules.retail.model.vo.InventoryStatusVO;
import com.youlai.boot.modules.retail.model.vo.SalesTrendVO;
import com.youlai.boot.modules.retail.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * ダッシュボードサービス実装
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardMapper dashboardMapper;
    private final AlertMapper alertMapper;
    private final InventoryMapper inventoryMapper;

    @Override
    public DashboardKpiVO getKpi() {
        DashboardKpiVO kpi = new DashboardKpiVO();

        // 本日売上取得（モックデータ）
        // TODO: 実際の売上データから取得
        kpi.setTodaySales(new BigDecimal("2450000"));
        kpi.setSalesGrowthRate(new BigDecimal("15.5"));

        // 店舗数取得（モックデータ）
        // TODO: 実際の店舗データから取得
        kpi.setActiveStoreCount(8);
        kpi.setTotalStoreCount(10);

        // 未対応アラート数取得
        long pendingAlertCount = alertMapper.selectCount(new LambdaQueryWrapper<Alert>()
                .eq(Alert::getResolved, false));
        kpi.setPendingAlertCount((int) pendingAlertCount);

        // 在庫切れSKU数取得
        long outOfStockCount = inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .le(Inventory::getQuantity, 0));
        kpi.setOutOfStockSkuCount((int) outOfStockCount);

        return kpi;
    }

    @Override
    public List<SalesTrendVO> getSalesTrend(LocalDate startDate, LocalDate endDate) {
        // モックデータ生成
        // TODO: 実際の売上データから取得
        List<SalesTrendVO> trendList = new ArrayList<>();

        LocalDate currentDate = startDate;
        BigDecimal baseSales = new BigDecimal("300000");

        while (!currentDate.isAfter(endDate)) {
            SalesTrendVO trend = new SalesTrendVO();
            trend.setDate(currentDate);

            // ランダムな売上金額生成（デモ用）
            BigDecimal randomFactor = new BigDecimal(0.8 + Math.random() * 0.4);
            BigDecimal salesAmount = baseSales.multiply(randomFactor).setScale(0, RoundingMode.HALF_UP);
            trend.setSalesAmount(salesAmount);

            // 前日比計算（デモ用）
            BigDecimal growthRate = new BigDecimal(-10 + Math.random() * 30).setScale(1, RoundingMode.HALF_UP);
            trend.setGrowthRate(growthRate);

            trendList.add(trend);
            currentDate = currentDate.plusDays(1);
        }

        return trendList;
    }

    @Override
    public List<InventoryStatusVO> getInventoryStatus(Integer limit) {
        // 在庫状況取得（発注点以下の在庫）
        return dashboardMapper.getInventoryStatus(limit);
    }
}
