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

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRED）")
    private String alertType;

    @Schema(description = "アラート日時（開始）")
    private LocalDateTime alertDateStart;

    @Schema(description = "アラート日時（終了）")
    private LocalDateTime alertDateEnd;

    @Schema(description = "解決フラグ")
    private Boolean resolved;
}