package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlai.boot.modules.retail.mapper.AlertMapper;
import com.youlai.boot.modules.retail.mapper.DashboardMapper;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
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

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // 本日売上取得
        BigDecimal todaySales = dashboardMapper.getTodaySales(today);
        kpi.setTodaySales(todaySales != null ? todaySales : BigDecimal.ZERO);

        // 前日売上取得して前日比計算
        BigDecimal yesterdaySales = dashboardMapper.getYesterdaySales(yesterday);
        if (yesterdaySales != null && yesterdaySales.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal growthRate = todaySales.subtract(yesterdaySales)
                    .divide(yesterdaySales, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(1, RoundingMode.HALF_UP);
            kpi.setSalesGrowthRate(growthRate);
        } else {
            kpi.setSalesGrowthRate(BigDecimal.ZERO);
        }

        // 店舗数取得
        Integer activeStoreCount = dashboardMapper.getActiveStoreCount();
        Integer totalStoreCount = dashboardMapper.getTotalStoreCount();
        kpi.setActiveStoreCount(activeStoreCount != null ? activeStoreCount : 0);
        kpi.setTotalStoreCount(totalStoreCount != null ? totalStoreCount : 0);

        // 未対応アラート数取得（スキーマ差異: status / resolved の両方に対応）
        long pendingAlertCount = 0L;
        if (Boolean.TRUE.equals(alertMapper.hasColumn("status"))) {
            pendingAlertCount = alertMapper.countPendingAlertsByStatus();
        } else if (Boolean.TRUE.equals(alertMapper.hasColumn("resolved"))) {
            pendingAlertCount = alertMapper.countPendingAlertsByResolved();
        }
        kpi.setPendingAlertCount((int) pendingAlertCount);

        // 在庫切れSKU数取得
        long outOfStockCount = inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .le(Inventory::getQuantity, 0));
        kpi.setOutOfStockSkuCount((int) outOfStockCount);

        return kpi;
    }

    @Override
    public List<SalesTrendVO> getSalesTrend(LocalDate startDate, LocalDate endDate) {
        // データベースから売上推移取得
        List<SalesTrendVO> trendList = dashboardMapper.getSalesTrend(startDate, endDate);

        // 前日比計算
        for (int i = 0; i < trendList.size(); i++) {
            SalesTrendVO current = trendList.get(i);
            if (i > 0) {
                SalesTrendVO previous = trendList.get(i - 1);
                BigDecimal previousAmount = previous.getSalesAmount();
                if (previousAmount != null && previousAmount.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal growthRate = current.getSalesAmount().subtract(previousAmount)
                            .divide(previousAmount, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"))
                            .setScale(1, RoundingMode.HALF_UP);
                    current.setGrowthRate(growthRate);
                } else {
                    current.setGrowthRate(BigDecimal.ZERO);
                }
            } else {
                current.setGrowthRate(BigDecimal.ZERO);
            }
        }

        return trendList;
    }

    @Override
    public List<InventoryStatusVO> getInventoryStatus(Integer limit) {
        // 在庫状況取得（発注点以下の在庫）
        return dashboardMapper.getInventoryStatus(limit);
    }
}
