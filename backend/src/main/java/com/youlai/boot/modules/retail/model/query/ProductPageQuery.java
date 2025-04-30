package com.youlai.boot.modules.retail.model.query;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductPageQuery {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private Long categoryId;
    private String expiryDate;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
} 