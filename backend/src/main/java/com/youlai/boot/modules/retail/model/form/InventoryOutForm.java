package com.youlai.boot.modules.retail.model.form;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

/**
 * 出庫情報のリクエストパラメータ
 *
 * @author wangjw
 */
@Data
public class InventoryOutForm {
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
     * 出庫タイプ（通常出庫, 返品出庫, 調整出庫）
     */
    @NotBlank(message = "出庫タイプは必須です")
    private String outType;

    /**
     * 出庫担当
     */
    @NotBlank(message = "出庫担当は必須です")
    private String outOperator;

    /**
     * 備考
     */
    private String remarks;
}