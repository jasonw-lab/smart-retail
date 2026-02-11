package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 入出庫履歴エンティティ
 *
 * @author wangjw
 */
@TableName("retail_inventory_transaction")
@Getter
@Setter
public class InventoryTransaction extends BaseEntity {

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
     * 操作タイプ（IN, OUT, SALE, ADJUST）
     */
    private String transactionType;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 操作日時
     */
    private LocalDateTime transactionDate;

    /**
     * 賞味期限
     */
    private LocalDate expiryDate;

    /**
     * 状態（処理中, 完了）
     */
    private String status;

    /**
     * 理由（仕入れ, 返品, 廃棄, 販売, 移動等）
     */
    private String reason;

    /**
     * 参照番号（発注番号, 販売番号等）
     */
    private String referenceNo;

    /**
     * 移動元/移動先
     */
    private String sourceDest;

    /**
     * 担当者
     */
    private String operator;

    /**
     * 備考
     */
    private String remarks;
}