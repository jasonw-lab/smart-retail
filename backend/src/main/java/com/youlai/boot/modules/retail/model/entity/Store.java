package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

/**
 * 店舗エンティティ
 *
 * @author wangjw
 */
@TableName("retail_store")
@Getter
@Setter
public class Store extends BaseEntity {
    /**
     * 店舗名
     */
    private String storeName;
}