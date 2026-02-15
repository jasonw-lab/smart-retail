package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * デバイスページングVO
 *
 * @author jason.w
 */
@Schema(description = "デバイスページングVO")
@Data
public class DevicePageVO {

    @Schema(description = "デバイスID")
    private Long id;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "デバイスコード")
    private String deviceCode;

    @Schema(description = "デバイスタイプ（PAYMENT_TERMINAL, CAMERA, GATE, REFRIGERATOR_SENSOR, PRINTER, NETWORK_ROUTER）")
    private String deviceType;

    @Schema(description = "デバイス名")
    private String deviceName;

    @Schema(description = "ステータス（ONLINE, OFFLINE, ERROR, MAINTENANCE）")
    private String status;

    @Schema(description = "最終Heartbeat受信日時")
    private LocalDateTime lastHeartbeat;

    @Schema(description = "エラーコード")
    private String errorCode;

    @Schema(description = "デバイス固有情報（JSON）")
    private String metadata;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}
