package com.youlai.boot.modules.retail.model.query;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 入出庫情報のページング検索条件
 *
 * @author wangjw
 */
@Data
public class InventoryInOutPageQuery {
    /**
     * 店舗ID
     */
    private Long storeId;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品名
     */
    private String productName;

    /**
     * ロット番号
     */
    private String lotNumber;

    /**
     * 状態（出車処理中, 出車完了, 入庫処理中, 入庫完了）
     */
    private String status;

    /**
     * 出庫担当
     */
    private String outOperator;

    /**
     * 出庫日時（開始）
     */
    private LocalDateTime outTimeStart;

    /**
     * 出庫日時（終了）
     */
    private LocalDateTime outTimeEnd;

    /**
     * 出庫タイプ
     */
    private String outType;

    /**
     * 入庫担当
     */
    private String inOperator;

    /**
     * 入庫日時（開始）
     */
    private LocalDateTime inTimeStart;

    /**
     * 入庫日時（終了）
     */
    private LocalDateTime inTimeEnd;

    /**
     * 入庫タイプ
     */
    private String inType;

    /**
     * ページ番号
     */
    private Integer pageNum = 1;

    /**
     * ページサイズ
     */
    private Integer pageSize = 10;
}