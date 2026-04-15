package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

/**
 * カテゴリエンティティ
 *
 * @author jason.w
 */
@TableName("retail_category")
@Getter
@Setter
public class Category extends BaseEntity {

    /**
     * カテゴリコード（一意、例: CAT-001）
     */
    @TableField("category_code")
    private String code;

    /**
     * カテゴリ名（例: 飲料）
     */
    @TableField("category_name")
    private String name;

    /**
     * 親カテゴリID（NULLの場合はルートカテゴリ）
     */
    @TableField("parent_id")
    private Long parentId;

    /**
     * 表示順序（昇順）
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * カテゴリ説明
     */
    private String description;

    /**
     * 状態（active: 有効, inactive: 無効）
     */
    private String status;
}
