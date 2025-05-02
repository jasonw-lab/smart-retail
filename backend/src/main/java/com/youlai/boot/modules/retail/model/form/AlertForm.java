package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * アラートフォーム
 *
 * @author wangjw
 */
@Schema(description = "アラートフォーム")
@Data
public class AlertForm {

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

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRED）")
    @NotBlank(message = "アラートタイプは必須です")
    private String alertType;

    @Schema(description = "アラートメッセージ")
    @Size(max = 255, message = "アラートメッセージは255文字以内で入力してください")
    private String alertMessage;

    @Schema(description = "アラート日時")
    private LocalDateTime alertDate;

    @Schema(description = "解決フラグ")
    private Boolean resolved;
}