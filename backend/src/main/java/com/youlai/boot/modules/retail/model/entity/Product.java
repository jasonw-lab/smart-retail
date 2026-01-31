package com.youlai.boot.modules.retail.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.youlai.boot.common.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 商品エンティティ
 *
 * @author jason.w
 */
@TableName("retail_product")
@Getter
@Setter
public class Product extends BaseEntity {
    /**
     * 商品コード
     */
    private String productCode;

    /**
     * 商品名
     */
    private String productName;

    /**
     * バーコード
     */
    private String barcode;

    /**
     * カテゴリID
     */
    private Long categoryId;

    /**
     * カテゴリ名
     */
    private String categoryName;

    /**
     * 販売価格
     */
    private BigDecimal unitPrice;

    /**
     * 原価
     */
    private BigDecimal costPrice;

    /**
     * 単位（個、kg等）
     */
    private String unit;

    /**
     * 賞味期限（日数）
     */
    private Integer shelfLifeDays;

    /**
     * 仕入先ID
     */
    private Long supplierId;

    /**
     * 仕入先名
     */
    private String supplierName;

    /**
     * 商品説明
     */
    private String description;

    /**
     * 商品画像URL
     */
    private String imageUrl;

    /**
     * 状態（active, inactive）
     */
    private String status;

    /**
     * 発注点（この在庫数以下でアラート発生）
     */
    private Integer reorderPoint;

    /**
     * 適正在庫上限（この在庫数以上でアラート発生）
     */
    private Integer maxStockLevel;
}
