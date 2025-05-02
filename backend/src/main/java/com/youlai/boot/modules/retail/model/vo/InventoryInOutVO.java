package com.youlai.boot.modules.retail.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 入出庫情報のレスポンスデータ
 *
 * @author wangjw
 */
@Data
public class InventoryInOutVO {
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
     * 数量
     */
    private Integer quantity;

    /**
     * ロット番号
     */
    private String lotNumber;

    /**
     * 賞味期限
     */
    private String expiryDate;

    /**
     * 状態（出車処理中, 出車完了, 入庫処理中, 入庫完了）
     */
    private String status;

    /**
     * 出庫担当
     */
    private String outOperator;

    /**
     * 出庫日時
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime outTime;

    /**
     * 出庫タイプ（通常出庫, 返品出庫, 調整出庫）
     */
    private String outType;

    /**
     * 入庫担当
     */
    private String inOperator;

    /**
     * 入庫日時
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime inTime;

    /**
     * 入庫タイプ（通常入庫, 返品入庫, 調整入庫）
     */
    private String inType;

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