package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 売上ヘッダエンティティ
 *
 * @author jason.w
 */
@TableName("retail_sales")
@Getter
@Setter
public class Sales extends BaseEntity {

    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 注文番号（一意）
     */
    private String orderNumber;

    /**
     * 合計金額（税込）
     */
    private BigDecimal totalAmount;

    /**
     * 支払方法（CASH, CARD, QR, OTHER）
     */
    private String paymentMethod;

    /**
     * 決済プロバイダ（PayPay, LINE Pay等）
     */
    private String paymentProvider;

    /**
     * 決済参照ID（決済システムの取引ID）
     */
    private String paymentReferenceId;

    /**
     * 売上日時
     */
    private LocalDateTime saleTimestamp;
}
