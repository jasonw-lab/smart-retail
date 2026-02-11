package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * デバイスエンティティ
 *
 * @author jason.w
 */
@TableName("retail_device")
@Getter
@Setter
public class Device extends BaseEntity {

    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * デバイスコード（一意）
     */
    private String deviceCode;

    /**
     * デバイスタイプ（PAYMENT_TERMINAL, CAMERA, GATE, REFRIGERATOR_SENSOR, PRINTER, NETWORK_ROUTER）
     */
    private String deviceType;

    /**
     * デバイス名
     */
    private String deviceName;

    /**
     * ステータス（ONLINE, OFFLINE, ERROR, MAINTENANCE）
     */
    private String status;

    /**
     * 最終Heartbeat受信日時
     */
    private LocalDateTime lastHeartbeat;

    /**
     * エラーコード
     */
    private String errorCode;

    /**
     * デバイス固有情報（JSON）
     */
    private String metadata;
}
