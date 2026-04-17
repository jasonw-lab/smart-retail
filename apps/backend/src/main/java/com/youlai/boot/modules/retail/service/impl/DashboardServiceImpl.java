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
import java.time.temporal.ChronoUnit;
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
        if (trendList == null || trendList.isEmpty()) {
            trendList = generateDemoSalesTrend(startDate, endDate);
        }

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

    /**
     * デモ用売上推移を生成する（店舗ごと: 毎日10件）
     * 対象期間は 2026-01-01 から 2026-09-30 まで。
     */
    private List<SalesTrendVO> generateDemoSalesTrend(LocalDate startDate, LocalDate endDate) {
        LocalDate demoStart = LocalDate.of(2026, 1, 1);
        LocalDate demoEnd = LocalDate.of(2026, 9, 30);
        LocalDate from = startDate.isAfter(demoStart) ? startDate : demoStart;
        LocalDate to = endDate.isBefore(demoEnd) ? endDate : demoEnd;
        if (from.isAfter(to)) {
            return new ArrayList<>();
        }

        Integer stores = dashboardMapper.getTotalStoreCount();
        int storeCount = (stores == null || stores <= 0) ? 10 : stores;
        List<SalesTrendVO> result = new ArrayList<>();
        long totalDays = ChronoUnit.DAYS.between(demoStart, demoEnd) + 1L;

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            BigDecimal dayTotal = BigDecimal.ZERO;
            long dayIndex = ChronoUnit.DAYS.between(demoStart, date);
            // 期間中央が最も高くなる山型（0.75〜1.45倍）
            double x = (dayIndex / (double) (totalDays - 1)) * 2.0 - 1.0;
            double mountainFactor = 0.75 + (1.0 - x * x) * 0.70;
            for (int storeId = 1; storeId <= storeCount; storeId++) {
                for (int orderSeq = 1; orderSeq <= 10; orderSeq++) {
                    dayTotal = dayTotal.add(calculateDemoOrderAmount(date, storeId, orderSeq, mountainFactor));
                }
            }

            SalesTrendVO vo = new SalesTrendVO();
            vo.setDate(date);
            vo.setSalesAmount(dayTotal.setScale(2, RoundingMode.HALF_UP));
            vo.setGrowthRate(BigDecimal.ZERO);
            result.add(vo);
        }
        return result;
    }

    /**
     * デモ注文金額を日付・店舗・注文番号から決定的に算出する。
     */
    private BigDecimal calculateDemoOrderAmount(LocalDate date, int storeId, int orderSeq, double mountainFactor) {
        BigDecimal base = BigDecimal.valueOf(1800 + storeId * 120L);
        int dayOfWeekIndex = date.getDayOfWeek().getValue(); // 1(Mon) - 7(Sun)
        double wx = ((dayOfWeekIndex - 1) / 6.0) * 2.0 - 1.0;
        // 週内で両端が低く中央が高い山型カーブ（やや強め）
        double weeklyMountainFactor = 0.78 + (1.0 - wx * wx) * 0.44;
        double seasonal = mountainFactor * weeklyMountainFactor
                + Math.sin(date.getDayOfYear() / 9.0) * 0.06
                + Math.cos(storeId * 0.8) * 0.03;
        BigDecimal multiplier = BigDecimal.valueOf(0.78 + orderSeq * 0.05); // 10件で段階的に単価差をつける
        BigDecimal offset = BigDecimal.valueOf((date.getDayOfMonth() * 17 + storeId * 13 + orderSeq * 29) % 220);
        return base.multiply(BigDecimal.valueOf(seasonal))
                .multiply(multiplier)
                .add(offset)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public List<InventoryStatusVO> getInventoryStatus(Integer limit) {
        // 在庫状況取得（発注点以下の在庫）
        return dashboardMapper.getInventoryStatus(limit);
    }
}
