package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 売上明細エンティティ
 *
 * @author jason.w
 */
@TableName("retail_sales_detail")
@Getter
@Setter
public class SalesDetail extends BaseEntity {

    /**
     * 売上ID（retail_salesへの外部キー）
     */
    private Long salesId;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * ロット番号（在庫引当時のロット）
     */
    private String lotNumber;

    /**
     * 販売数量
     */
    private Integer quantity;

    /**
     * 単価（販売時の価格）
     */
    private BigDecimal unitPrice;

    /**
     * 小計（quantity × unitPrice）
     */
    private BigDecimal subtotal;
}
