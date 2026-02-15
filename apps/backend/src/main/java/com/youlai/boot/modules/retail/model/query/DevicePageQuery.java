package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * デバイスページングクエリ
 *
 * @author jason.w
 */
@Schema(description = "デバイスページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class DevicePageQuery extends BasePageQuery {

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "デバイスタイプ（PAYMENT_TERMINAL, CAMERA, GATE, REFRIGERATOR_SENSOR, PRINTER, NETWORK_ROUTER）")
    private String deviceType;

    @Schema(description = "ステータス（ONLINE, OFFLINE, ERROR, MAINTENANCE）")
    private String status;

    @Schema(description = "デバイス名（部分一致）")
    private String deviceName;

    @Schema(description = "デバイスコード（部分一致）")
    private String deviceCode;
}
