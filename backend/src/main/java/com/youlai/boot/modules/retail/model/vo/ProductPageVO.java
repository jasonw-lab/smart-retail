package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品ページングVO
 *
 * @author wangjw
 */
@Schema(description = "商品ページングVO")
@Data
public class ProductPageVO {

    @Schema(description = "商品ID")
    private Long id;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "バーコード")
    private String barcode;

    @Schema(description = "カテゴリID")
    private Long categoryId;

    @Schema(description = "カテゴリ名")
    private String categoryName;

    @Schema(description = "販売価格")
    private BigDecimal unitPrice;

    @Schema(description = "原価")
    private BigDecimal costPrice;

    @Schema(description = "単位（個、kg等）")
    private String unit;

    @Schema(description = "賞味期限（日数）")
    private Integer shelfLifeDays;

    @Schema(description = "仕入先ID")
    private Long supplierId;

    @Schema(description = "仕入先名")
    private String supplierName;

    @Schema(description = "商品説明")
    private String description;

    @Schema(description = "商品画像URL")
    private String imageUrl;

    @Schema(description = "状態（active, inactive）")
    private String status;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}