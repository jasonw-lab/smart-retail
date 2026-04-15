package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * アラートエンティティ
 *
 * @author wangjw
 */
@TableName("retail_alert")
@Getter
@Setter
public class Alert extends BaseEntity {

    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * デバイスID
     */
    private Long deviceId;

    /**
     * ロット番号
     */
    private String lotNumber;

    /**
     * アラートタイプ（LOW_STOCK, EXPIRY_SOON, HIGH_STOCK, COMMUNICATION_DOWN, PAYMENT_TERMINAL_DOWN）
     */
    private String alertType;

    /**
     * 優先度（P1, P2, P3, P4）
     */
    private String priority;

    /**
     * ステータス（NEW, ACK, IN_PROGRESS, RESOLVED, CLOSED）
     */
    private String status;

    /**
     * アラートメッセージ
     */
    private String message;

    /**
     * しきい値
     */
    private String thresholdValue;

    /**
     * 現在値
     */
    private String currentValue;

    /**
     * 検知日時
     */
    private LocalDateTime detectedAt;

    /**
     * 確認日時
     */
    private LocalDateTime acknowledgedAt;

    /**
     * 解決日時
     */
    private LocalDateTime resolvedAt;

    /**
     * クローズ日時
     */
    private LocalDateTime closedAt;

    /**
     * 解決メモ
     */
    private String resolutionNote;
}