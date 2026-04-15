package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 在庫フォーム
 *
 * @author jason.w
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

    @Schema(description = "賞味期限")
    private LocalDate expiryDate;

    @Schema(description = "入庫日時")
    private LocalDateTime receivedAt;

    @Schema(description = "保管場所")
    @Size(max = 50, message = "保管場所は50文字以内で入力してください")
    private String location;

    @Schema(description = "在庫状態（normal, low, high, expired, out_of_stock）")
    private String status;

    @Schema(description = "最終棚卸日時")
    private LocalDateTime lastCountDate;

    @Schema(description = "備考")
    @Size(max = 500, message = "備考は500文字以内で入力してください")
    private String remarks;
}
