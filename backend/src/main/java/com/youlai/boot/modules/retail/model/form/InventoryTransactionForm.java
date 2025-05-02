package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 入出庫履歴フォーム
 *
 * @author wangjw
 */
@Schema(description = "入出庫履歴フォーム")
@Data
public class InventoryTransactionForm {

    @Schema(description = "店舗ID")
    @NotNull(message = "店舗IDは必須です")
    private Long storeId;

    @Schema(description = "商品ID")
    @NotNull(message = "商品IDは必須です")
    private Long productId;

    @Schema(description = "ロット番号")
    @NotBlank(message = "ロット番号は必須です")
    @Size(max = 50, message = "ロット番号は50文字以内で入力してください")
    private String lotNumber;

    @Schema(description = "操作タイプ（IN, OUT, SALE, ADJUST）")
    @NotBlank(message = "操作タイプは必須です")
    private String transactionType;

    @Schema(description = "数量")
    @NotNull(message = "数量は必須です")
    private Integer quantity;

    @Schema(description = "操作日時")
    @NotNull(message = "操作日時は必須です")
    private LocalDateTime transactionDate;

    @Schema(description = "賞味期限")
    private LocalDate expiryDate;

    @Schema(description = "状態（処理中, 完了）")
    @NotBlank(message = "状態は必須です")
    private String status;

    @Schema(description = "理由（仕入れ, 返品, 廃棄, 販売, 移動等）")
    private String reason;

    @Schema(description = "参照番号（発注番号, 販売番号等）")
    @Size(max = 50, message = "参照番号は50文字以内で入力してください")
    private String referenceNo;

    @Schema(description = "移動元/移動先")
    @Size(max = 100, message = "移動元/移動先は100文字以内で入力してください")
    private String sourceDest;

    @Schema(description = "担当者")
    @Size(max = 50, message = "担当者は50文字以内で入力してください")
    private String operator;

    @Schema(description = "備考")
    @Size(max = 500, message = "備考は500文字以内で入力してください")
    private String remarks;
}