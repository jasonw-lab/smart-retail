package com.youlai.boot.modules.retail.mapper;

import com.youlai.boot.modules.retail.model.vo.InventoryStatusVO;
import com.youlai.boot.modules.retail.model.vo.SalesTrendVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * ダッシュボードマッパー
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Mapper
public interface DashboardMapper {

    /**
     * 在庫状況取得
     *
     * @param limit 取得件数
     * @return 在庫状況リスト
     */
    List<InventoryStatusVO> getInventoryStatus(@Param("limit") Integer limit);

    /**
     * 本日売上取得
     *
     * @param date 日付
     * @return 売上金額
     */
    BigDecimal getTodaySales(@Param("date") LocalDate date);

    /**
     * 前日売上取得
     *
     * @param date 日付
     * @return 売上金額
     */
    BigDecimal getYesterdaySales(@Param("date") LocalDate date);

    /**
     * 稼働中店舗数取得
     *
     * @return 稼働中店舗数
     */
    Integer getActiveStoreCount();

    /**
     * 総店舗数取得
     *
     * @return 総店舗数
     */
    Integer getTotalStoreCount();

    /**
     * 売上推移取得
     *
     * @param startDate 開始日
     * @param endDate 終了日
     * @return 売上推移リスト
     */
    List<SalesTrendVO> getSalesTrend(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
