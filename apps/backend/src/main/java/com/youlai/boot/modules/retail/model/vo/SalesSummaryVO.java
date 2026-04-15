package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 決済サマリVO
 *
 * @author jason.w
 */
@Schema(description = "決済サマリVO")
@Data
public class SalesSummaryVO {

    @Schema(description = "合計金額")
    private BigDecimal totalAmount;

    @Schema(description = "取引件数")
    private Long totalCount;

    @Schema(description = "カード決済件数")
    private Long cardCount;

    @Schema(description = "QR決済件数")
    private Long qrCount;

    @Schema(description = "現金決済件数")
    private Long cashCount;

    @Schema(description = "その他決済件数")
    private Long otherCount;

    @Schema(description = "カード決済比率（%）")
    private BigDecimal cardRatio;

    @Schema(description = "QR決済比率（%）")
    private BigDecimal qrRatio;

    @Schema(description = "現金決済比率（%）")
    private BigDecimal cashRatio;

    @Schema(description = "その他決済比率（%）")
    private BigDecimal otherRatio;
}
