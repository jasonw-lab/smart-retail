package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * アラート状態更新フォーム
 *
 * @author wangjw
 */
@Schema(description = "アラート状態更新フォーム")
@Data
public class AlertStatusForm {

    @Schema(description = "ステータス（NEW, ACK, IN_PROGRESS, RESOLVED, CLOSED）")
    @NotBlank(message = "ステータスは必須です")
    @Pattern(regexp = "^(NEW|ACK|IN_PROGRESS|RESOLVED|CLOSED)$", message = "ステータスは NEW, ACK, IN_PROGRESS, RESOLVED, CLOSED のいずれかを指定してください")
    private String status;

    @Schema(description = "解決メモ（RESOLVED/CLOSED時のみ）")
    @Size(max = 2000, message = "解決メモは2000文字以内で入力してください")
    private String resolutionNote;
}
