package com.youlai.boot.modules.retail.model.form;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

/**
 * 入庫情報のリクエストパラメータ
 *
 * @author wangjw
 */
@Data
public class InventoryInForm {
    /**
     * 店舗ID
     */
    @NotNull(message = "店舗IDは必須です")
    private Long storeId;

    /**
     * 商品ID
     */
    @NotNull(message = "商品IDは必須です")
    private Long productId;

    /**
     * 数量
     */
    @NotNull(message = "数量は必須です")
    @Positive(message = "数量は正の値である必要があります")
    private Integer quantity;

    /**
     * ロット番号
     */
    @NotBlank(message = "ロット番号は必須です")
    private String lotNumber;

    /**
     * 賞味期限
     */
    @NotBlank(message = "賞味期限は必須です")
    private String expiryDate;

    /**
     * 入庫タイプ（通常入庫, 返品入庫, 調整入庫）
     */
    @NotBlank(message = "入庫タイプは必須です")
    private String inType;

    /**
     * 入庫担当
     */
    @NotBlank(message = "入庫担当は必須です")
    private String inOperator;

    /**
     * 備考
     */
    private String remarks;
}