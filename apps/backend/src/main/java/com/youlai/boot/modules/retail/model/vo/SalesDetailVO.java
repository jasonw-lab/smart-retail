package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 決済詳細VO（明細含む）
 *
 * @author jason.w
 */
@Schema(description = "決済詳細VO")
@Data
public class SalesDetailVO {

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

    @Schema(description = "決済参照ID")
    private String paymentReferenceId;

    @Schema(description = "決済日時")
    private LocalDateTime saleTimestamp;

    @Schema(description = "購入商品リスト")
    private List<SalesItemVO> items;

    /**
     * 購入商品明細VO
     */
    @Schema(description = "購入商品明細VO")
    @Data
    public static class SalesItemVO {

        @Schema(description = "商品ID")
        private Long productId;

        @Schema(description = "商品名")
        private String productName;

        @Schema(description = "数量")
        private Integer quantity;

        @Schema(description = "単価")
        private BigDecimal unitPrice;

        @Schema(description = "小計")
        private BigDecimal subtotal;
    }
}
