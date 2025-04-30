package com.youlai.boot.modules.retail.model.form;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class ProductForm {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    @NotNull
    private BigDecimal price;
    @NotNull
    private Integer stock;
    private String description;
    @NotNull
    private Long categoryId;
    private String categoryName;
    private Integer sales;
    private String imageUrl;
    private String expiryDate;
} 