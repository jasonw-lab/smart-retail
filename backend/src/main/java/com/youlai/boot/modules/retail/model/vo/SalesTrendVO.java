package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 売上推移 VO
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Data
@Schema(description = "売上推移")
public class SalesTrendVO implements Serializable {

    @Schema(description = "日付")
    private LocalDate date;

    @Schema(description = "売上金額")
    private BigDecimal salesAmount;

    @Schema(description = "前日比（%）")
    private BigDecimal growthRate;
}
