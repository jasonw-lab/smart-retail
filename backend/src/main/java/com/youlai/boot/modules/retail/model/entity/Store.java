package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

/**
 * 店舗エンティティ
 *
 * @author jason.w
 */
@TableName("retail_store")
@Getter
@Setter
public class Store extends BaseEntity {
    /**
     * 店舗コード
     */
    private String storeCode;

    /**
     * 店舗名
     */
    private String storeName;

    /**
     * 住所
     */
    private String address;

    /**
     * 電話番号
     */
    private String phone;

    /**
     * 店長名
     */
    private String manager;

    /**
     * 状態（active, inactive）
     */
    private String status;

    /**
     * 営業時間
     */
    private String openingHours;
}
