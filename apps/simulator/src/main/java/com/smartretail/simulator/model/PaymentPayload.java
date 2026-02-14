package com.smartretail.simulator.model;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 決済結果送信ペイロード
 *
 * @author jason.w
 */
@Data
public class PaymentPayload {

    private Long storeId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentProvider;
    private String paymentReferenceId;
    private LocalDateTime saleTimestamp;
    private List<PaymentItemPayload> items;

    /**
     * 決済明細ペイロード
     */
    @Data
    public static class PaymentItemPayload {
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}
