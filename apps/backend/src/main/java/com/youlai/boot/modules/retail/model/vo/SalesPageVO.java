package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 決済履歴ページングVO
 *
 * @author jason.w
 */
@Schema(description = "決済履歴ページングVO")
@Data
public class SalesPageVO {

    @Schema(description = "売上ID")
    private Long id;

    @Schema(description = "注文番号")
    private String orderNumber;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "合計金額（税込）")
    private BigDecimal totalAmount;

    @Schema(description = "決済方法（CASH, CARD, QR, OTHER）")
    private String paymentMethod;

    @Schema(description = "決済プロバイダ")
    private String paymentProvider;

    @Schema(description = "決済日時")
    private LocalDateTime saleTimestamp;
}
