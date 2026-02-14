package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品フォーム
 *
 * @author jason.w
 */
@Schema(description = "商品フォーム")
@Data
public class ProductForm {

    @Schema(description = "商品名")
    @NotBlank(message = "商品名は必須です")
    @Size(max = 100, message = "商品名は100文字以内で入力してください")
    private String name;

    @Schema(description = "商品コード")
    @NotBlank(message = "商品コードは必須です")
    @Size(max = 30, message = "商品コードは30文字以内で入力してください")
    private String code;

    @Schema(description = "バーコード")
    @Size(max = 50, message = "バーコードは50文字以内で入力してください")
    private String barcode;

    @Schema(description = "カテゴリID")
    private Long categoryId;

    @Schema(description = "カテゴリ名")
    private String categoryName;

    @Schema(description = "販売価格")
    @NotNull(message = "販売価格は必須です")
    private BigDecimal price;

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
    @Size(max = 500, message = "商品説明は500文字以内で入力してください")
    private String description;

    @Schema(description = "商品画像URL")
    private String imageUrl;

    @Schema(description = "状態（active, inactive）")
    private String status;

    @Schema(description = "発注点（SKU集約在庫がこの値以下でLOW_STOCKアラート）")
    private Integer reorderPoint;

    @Schema(description = "適正在庫上限（SKU集約在庫がこの値×1.5以上でHIGH_STOCKアラート）")
    private Integer maxStock;
}