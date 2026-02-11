package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 廃棄（在庫調整）フォーム（v1.1対応）
 *
 * @author jason.w
 */
@Schema(description = "廃棄（在庫調整）フォーム")
@Data
public class DiscardForm {

    @Schema(description = "廃棄数量", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "廃棄数量は必須です")
    @Min(value = 1, message = "廃棄数量は1以上を指定してください")
    private Integer quantity;

    @Schema(description = "廃棄理由", requiredMode = Schema.RequiredMode.REQUIRED, example = "期限切れ")
    @NotBlank(message = "廃棄理由は必須です")
    @Size(max = 100, message = "廃棄理由は100文字以内で入力してください")
    private String reason;

    @Schema(description = "備考")
    @Size(max = 500, message = "備考は500文字以内で入力してください")
    private String remarks;
}
