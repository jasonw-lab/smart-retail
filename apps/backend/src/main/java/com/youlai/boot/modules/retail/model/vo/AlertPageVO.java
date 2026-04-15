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

    @Schema(description = "デバイスID")
    private Long deviceId;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRY_SOON, HIGH_STOCK, COMMUNICATION_DOWN, PAYMENT_TERMINAL_DOWN）")
    private String alertType;

    @Schema(description = "優先度（P1, P2, P3, P4）")
    private String priority;

    @Schema(description = "ステータス（NEW, ACK, IN_PROGRESS, RESOLVED, CLOSED）")
    private String status;

    @Schema(description = "アラートメッセージ")
    private String message;

    @Schema(description = "しきい値")
    private String thresholdValue;

    @Schema(description = "現在値")
    private String currentValue;

    @Schema(description = "検知日時")
    private LocalDateTime detectedAt;

    @Schema(description = "確認日時")
    private LocalDateTime acknowledgedAt;

    @Schema(description = "解決日時")
    private LocalDateTime resolvedAt;

    @Schema(description = "クローズ日時")
    private LocalDateTime closedAt;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}