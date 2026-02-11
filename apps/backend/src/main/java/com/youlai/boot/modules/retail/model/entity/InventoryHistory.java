package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 在庫履歴エンティティ
 *
 * @author wangjw
 */
@TableName("retail_inventory_history")
@Getter
@Setter
public class InventoryHistory extends BaseEntity {
    /**
     * 在庫ID
     */
    private Long inventoryId;

    /**
     * 操作タイプ（入庫, 出庫）
     */
    private String type;

    /**
     * 数量（入庫はプラス、出庫はマイナス）
     */
    private Integer quantity;

    /**
     * 操作日時
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime date;

    /**
     * 理由
     */
    private String reason;

    /**
     * 担当者
     */
    private String operator;
}