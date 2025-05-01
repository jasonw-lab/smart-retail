package com.youlai.boot.modules.retail.model.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductPageVO {
    private Long id;
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