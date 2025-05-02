package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 入出庫管理エンティティ
 *
 * @author wangjw
 */
@TableName("retail_inventory_in_out")
@Getter
@Setter
public class InventoryInOut extends BaseEntity {
    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 数量
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
     * 状態（出車処理中, 出車完了, 入庫処理中, 入庫完了）
     */
    private String status;

    /**
     * 出庫担当
     */
    private String outOperator;

    /**
     * 出庫日時
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime outTime;

    /**
     * 出庫タイプ（通常出庫, 返品出庫, 調整出庫）
     */
    private String outType;

    /**
     * 入庫担当
     */
    private String inOperator;

    /**
     * 入庫日時
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime inTime;

    /**
     * 入庫タイプ（通常入庫, 返品入庫, 調整入庫）
     */
    private String inType;

    /**
     * 備考
     */
    private String remarks;
}