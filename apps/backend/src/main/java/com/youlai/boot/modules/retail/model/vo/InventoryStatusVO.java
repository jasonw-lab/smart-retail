package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 在庫状況 VO
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Data
@Schema(description = "在庫状況")
public class InventoryStatusVO implements Serializable {

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "現在在庫数")
    private Integer quantity;

    @Schema(description = "発注点")
    private Integer reorderPoint;

    @Schema(description = "在庫状態（NORMAL/LOW/OUT）")
    private String status;
}
