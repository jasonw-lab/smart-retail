package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * デバイスフォーム
 *
 * @author jason.w
 */
@Schema(description = "デバイスフォーム")
@Data
public class DeviceForm {

    @Schema(description = "デバイスID（更新時にフロントが送る場合あり。サーバー側ではPathVariableのIDを優先）")
    private Long id;

    @Schema(description = "店舗ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "店舗IDは必須です")
    private Long storeId;

    @Schema(description = "デバイスコード（自動採番も可能）")
    @Size(max = 50, message = "デバイスコードは50文字以内で入力してください")
    private String deviceCode;

    @Schema(description = "デバイスタイプ", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "デバイスタイプは必須です")
    private String deviceType;

    @Schema(description = "デバイス名", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "デバイス名は必須です")
    @Size(max = 100, message = "デバイス名は100文字以内で入力してください")
    private String deviceName;

    @Schema(description = "ステータス（ONLINE, OFFLINE, ERROR, MAINTENANCE）")
    private String status;

    @Schema(description = "最終Heartbeat受信日時")
    private LocalDateTime lastHeartbeat;

    @Schema(description = "エラーコード")
    @Size(max = 50, message = "エラーコードは50文字以内で入力してください")
    private String errorCode;

    @Schema(description = "デバイス固有情報（JSON）")
    private String metadata;
}
