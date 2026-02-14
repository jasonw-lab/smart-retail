package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 入出庫履歴エンティティ
 *
 * @author jason.w
 */
@TableName("retail_inventory_transaction")
@Getter
@Setter
public class InventoryTransaction extends BaseEntity {

    /**
     * 在庫ID（retail_inventoryへの外部キー）
     */
    private Long inventoryId;

    /**
     * 店舗ID（非正規化）
     */
    private Long storeId;

    /**
     * 商品ID（非正規化）
     */
    private Long productId;

    /**
     * ロット番号（非正規化）
     */
    private String lotNumber;

    /**
     * 操作タイプ（INBOUND, SALE, ADJUSTMENT, DISPOSAL, TRANSFER_IN, TRANSFER_OUT）
     */
    private String txnType;

    /**
     * 数量変動（正=増加, 負=減少）
     */
    private Integer quantityDelta;

    /**
     * 操作元（MANUAL, POS, BATCH）
     */
    private String sourceType;

    /**
     * 参照番号（売上ID、発注番号等）
     */
    private String referenceNo;

    /**
     * 操作日時
     */
    private LocalDateTime occurredAt;

    /**
     * 備考（理由、移動先等）
     */
    private String note;
}
