package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 出庫管理エンティティ
 *
 * @author wangjw
 */
@TableName("retail_inventory_out")
@Getter
@Setter
public class InventoryOut extends BaseEntity {
    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 店舗名
     */
    private String storeName;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品名
     */
    private String productName;

    /**
     * 出庫数量
     */
    private Integer quantity;

    /**
     * ロット番号
     */
    private String lotNumber;

    /**
     * 賞味期限
     */
    private String expiryDate;

    /**
     * 出庫タイプ（通常出庫, 返品出庫, 調整出庫）
     */
    private String outboundType;

    /**
     * 状態（処理中, 完了）
     */
    private String status;

    /**
     * 出荷時間
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime shippingTime;

    /**
     * 担当者
     */
    private String operator;

    /**
     * 備考
     */
    private String remarks;
}