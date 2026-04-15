package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 在庫エンティティ
 *
 * @author jason.w
 */
@TableName("retail_inventory")
@Getter
@Setter
public class Inventory extends BaseEntity {

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
     * 在庫数量
     */
    private Integer quantity;

    /**
     * 賞味期限
     */
    private LocalDate expiryDate;

    /**
     * 入庫日時（FEFO同率時のFIFOフォールバック用）
     */
    private LocalDateTime receivedAt;

    /**
     * 保管場所
     */
    private String location;

    /**
     * 在庫状態（normal, low, high, expired, out_of_stock）
     */
    private String status;

    /**
     * 最終棚卸日時
     */
    private LocalDateTime lastCountDate;

    /**
     * 備考
     */
    private String remarks;
}
