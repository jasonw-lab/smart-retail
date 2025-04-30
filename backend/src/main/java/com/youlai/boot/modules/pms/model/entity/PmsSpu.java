package com.youlai.boot.modules.pms.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;

/**
 * 商品实体对象
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Getter
@Setter
@TableName("pms_spu")
public class PmsSpu extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 商品名称
     */
    private String name;
    /**
     * 商品类型ID
     */
    private Long categoryId;
    /**
     * 商品品牌ID
     */
    private Long brandId;
    /**
     * 原价【起】
     */
    private Long originPrice;
    /**
     * 现价【起】
     */
    private Long price;
    /**
     * 销量
     */
    private Integer sales;
    /**
     * 商品主图
     */
    private String picUrl;
    /**
     * 商品图册
     */
    private String[] album;
    /**
     * 单位
     */
    private String unit;
    /**
     * 商品简介
     */
    private String description;
    /**
     * 商品详情
     */
    private String detail;
    /**
     * 商品状态(0:下架 1:上架)
     */
    private Integer status;


    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String brandName;

    @TableField(exist = false)
    private List<PmsSku> skuList;
}
