package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * 在庫フォーム
 *
 * @author wangjw
 */
@Schema(description = "在庫フォーム")
@Data
public class InventoryForm {

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

    @Schema(description = "在庫数量")
    @NotNull(message = "在庫数量は必須です")
    private Integer quantity;

    @Schema(description = "最小在庫数")
    private Integer minStock;

    @Schema(description = "最大在庫数")
    private Integer maxStock;

    @Schema(description = "賞味期限")
    private LocalDate expiryDate;

    @Schema(description = "保管場所")
    @Size(max = 50, message = "保管場所は50文字以内で入力してください")
    private String location;

    @Schema(description = "在庫状態（low, normal, high, expired）")
    private String status;

    @Schema(description = "最終棚卸日")
    private LocalDate lastCountDate;

    @Schema(description = "備考")
    @Size(max = 500, message = "備考は500文字以内で入力してください")
    private String remarks;
}