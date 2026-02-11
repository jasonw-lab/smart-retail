package com.youlai.boot.modules.retail.service;

import com.youlai.boot.modules.retail.model.vo.DashboardKpiVO;
import com.youlai.boot.modules.retail.model.vo.InventoryStatusVO;
import com.youlai.boot.modules.retail.model.vo.SalesTrendVO;

import java.time.LocalDate;
import java.util.List;

/**
 * ダッシュボードサービス
 *
 * @author wangjw
 * @since 2026-01-29
 */
public interface DashboardService {

    /**
     * KPI取得
     *
     * @return KPI情報
     */
    DashboardKpiVO getKpi();

    /**
     * 売上推移取得
     *
     * @param startDate 開始日
     * @param endDate 終了日
     * @return 売上推移リスト
     */
    List<SalesTrendVO> getSalesTrend(LocalDate startDate, LocalDate endDate);

    /**
     * 在庫状況取得
     *
     * @param limit 取得件数
     * @return 在庫状況リスト
     */
    List<InventoryStatusVO> getInventoryStatus(Integer limit);
}
