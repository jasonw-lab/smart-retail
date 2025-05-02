package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * アラートページングVO
 *
 * @author wangjw
 */
@Schema(description = "アラートページングVO")
@Data
public class AlertPageVO {

    @Schema(description = "アラートID")
    private Long id;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRED）")
    private String alertType;

    @Schema(description = "アラートメッセージ")
    private String alertMessage;

    @Schema(description = "アラート日時")
    private LocalDateTime alertDate;

    @Schema(description = "解決フラグ")
    private Boolean resolved;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}