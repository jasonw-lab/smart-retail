package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@TableName("retail_product")
@Getter
@Setter
public class Product extends BaseEntity {
    private String name;
    private String code;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Integer sales;
    private String imageUrl;
    private String expiryDate;
} 