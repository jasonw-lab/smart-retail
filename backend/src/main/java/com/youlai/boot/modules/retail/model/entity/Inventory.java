package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 在庫エンティティ
 *
 * @author wangjw
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
     * 最小在庫数
     */
    private Integer minStock;

    /**
     * 最大在庫数
     */
    private Integer maxStock;

    /**
     * 賞味期限
     */
    private LocalDate expiryDate;

    /**
     * 保管場所
     */
    private String location;

    /**
     * 在庫状態（low, normal, high, expired）
     */
    private String status;

    /**
     * 最終棚卸日
     */
    private LocalDate lastCountDate;

    /**
     * 備考
     */
    private String remarks;
}