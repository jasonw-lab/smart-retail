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
     * ロット番号
     */
    private String lotNumber;

    /**
     * アラートタイプ（LOW_STOCK, EXPIRED）
     */
    private String alertType;

    /**
     * アラートメッセージ
     */
    private String alertMessage;

    /**
     * アラート日時
     */
    private LocalDateTime alertDate;

    /**
     * 解決フラグ
     */
    private Boolean resolved;
}