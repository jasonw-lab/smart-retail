package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    private Long productId;

    @Schema(description = "デバイスID")
    private Long deviceId;

    @Schema(description = "ロット番号")
    @Size(max = 50, message = "ロット番号は50文字以内で入力してください")
    private String lotNumber;

    @Schema(description = "アラートタイプ（LOW_STOCK, EXPIRY_SOON, HIGH_STOCK, COMMUNICATION_DOWN, PAYMENT_TERMINAL_DOWN）")
    @NotBlank(message = "アラートタイプは必須です")
    @Pattern(regexp = "^(LOW_STOCK|EXPIRY_SOON|HIGH_STOCK|COMMUNICATION_DOWN|PAYMENT_TERMINAL_DOWN)$", message = "アラートタイプが不正です")
    private String alertType;

    @Schema(description = "優先度（P1, P2, P3, P4）")
    @NotBlank(message = "優先度は必須です")
    @Pattern(regexp = "^(P1|P2|P3|P4)$", message = "優先度は P1, P2, P3, P4 のいずれかを指定してください")
    private String priority;

    @Schema(description = "アラートメッセージ")
    @Size(max = 500, message = "アラートメッセージは500文字以内で入力してください")
    private String message;

    @Schema(description = "しきい値")
    @Size(max = 50, message = "しきい値は50文字以内で入力してください")
    private String thresholdValue;

    @Schema(description = "現在値")
    @Size(max = 50, message = "現在値は50文字以内で入力してください")
    private String currentValue;

    @Schema(description = "検知日時")
    private LocalDateTime detectedAt;
}