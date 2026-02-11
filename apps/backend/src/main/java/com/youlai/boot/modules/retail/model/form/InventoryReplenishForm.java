package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 在庫補充フォーム
 *
 * @author jason.w
 */
@Schema(description = "在庫補充フォーム")
@Data
public class InventoryReplenishForm {

    @Schema(description = "補充数量")
    @NotNull(message = "補充数量は必須です")
    @Positive(message = "補充数量は正の数である必要があります")
    private Integer quantity;

    @Schema(description = "補充理由")
    @Size(max = 255, message = "補充理由は255文字以内で入力してください")
    private String reason;

    @Schema(description = "担当者")
    @Size(max = 50, message = "担当者名は50文字以内で入力してください")
    private String operator;
}
