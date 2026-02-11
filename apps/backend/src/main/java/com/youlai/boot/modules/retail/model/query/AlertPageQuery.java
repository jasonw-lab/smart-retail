package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * アラートページングクエリ
 *
 * @author wangjw
 */
@Schema(description = "アラートページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class AlertPageQuery extends BasePageQuery {

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRY_SOON, HIGH_STOCK）")
    private String alertType;

    @Schema(description = "優先度（P1, P2, P3, P4）")
    private String priority;

    @Schema(description = "ステータス（NEW, ACK, IN_PROGRESS, RESOLVED, CLOSED）")
    private String status;

    @Schema(description = "検知日時（開始）")
    private LocalDateTime detectedAtStart;

    @Schema(description = "検知日時（終了）")
    private LocalDateTime detectedAtEnd;
}