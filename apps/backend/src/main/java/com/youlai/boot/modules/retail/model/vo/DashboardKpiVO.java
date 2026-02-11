package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * ダッシュボードKPI VO
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Data
@Schema(description = "ダッシュボードKPI")
public class DashboardKpiVO implements Serializable {

    @Schema(description = "本日売上")
    private BigDecimal todaySales;

    @Schema(description = "前日比（%）")
    private BigDecimal salesGrowthRate;

    @Schema(description = "稼働中店舗数")
    private Integer activeStoreCount;

    @Schema(description = "総店舗数")
    private Integer totalStoreCount;

    @Schema(description = "未対応アラート数")
    private Integer pendingAlertCount;

    @Schema(description = "在庫切れSKU数")
    private Integer outOfStockSkuCount;
}
