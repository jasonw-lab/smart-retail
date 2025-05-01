package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

/**
 * カテゴリエンティティ
 */
@TableName("retail_category")
@Getter
@Setter
public class Category extends BaseEntity {
    /**
     * カテゴリ名
     */
    private String name;
}