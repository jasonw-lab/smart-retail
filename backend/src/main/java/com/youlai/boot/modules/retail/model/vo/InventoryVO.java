package com.youlai.boot.modules.retail.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 在庫情報のレスポンスデータ
 *
 * @author wangjw
 */
@Data
public class InventoryVO {
    /**
     * ID
     */
    private Long id;

    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 店舗名
     */
    private String storeName;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品名
     */
    private String productName;

    /**
     * 在庫数
     */
    private Integer stock;

    /**
     * 賞味期限
     */
    private String expiryDate;

    /**
     * 在庫状態（low, normal, high）
     */
    private String status;

    /**
     * ロット番号
     */
    private String lotNumber;

    /**
     * 備考
     */
    private String remarks;

    /**
     * 作成時間
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /**
     * 更新時間
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}