package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 入出庫履歴ページングVO
 *
 * @author wangjw
 */
@Schema(description = "入出庫履歴ページングVO")
@Data
public class InventoryTransactionPageVO {

    @Schema(description = "入出庫ID")
    private Long id;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "操作タイプ（IN, OUT, SALE, ADJUST）")
    private String transactionType;

    @Schema(description = "数量")
    private Integer quantity;

    @Schema(description = "操作日時")
    private LocalDateTime transactionDate;

    @Schema(description = "賞味期限")
    private LocalDate expiryDate;

    @Schema(description = "状態（処理中, 完了）")
    private String status;

    @Schema(description = "理由（仕入れ, 返品, 廃棄, 販売, 移動等）")
    private String reason;

    @Schema(description = "参照番号（発注番号, 販売番号等）")
    private String referenceNo;

    @Schema(description = "移動元/移動先")
    private String sourceDest;

    @Schema(description = "担当者")
    private String operator;

    @Schema(description = "備考")
    private String remarks;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}