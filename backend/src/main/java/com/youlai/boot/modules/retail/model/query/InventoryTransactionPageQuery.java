package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 入出庫履歴ページングクエリ
 *
 * @author wangjw
 */
@Schema(description = "入出庫履歴ページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class InventoryTransactionPageQuery extends BasePageQuery {

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "操作タイプ（IN, OUT, SALE, ADJUST）")
    private String transactionType;

    @Schema(description = "状態（処理中, 完了）")
    private String status;

    @Schema(description = "操作日時（開始）")
    private LocalDateTime transactionDateStart;

    @Schema(description = "操作日時（終了）")
    private LocalDateTime transactionDateEnd;

    @Schema(description = "理由（仕入れ, 返品, 廃棄, 販売, 移動等）")
    private String reason;

    @Schema(description = "参照番号（発注番号, 販売番号等）")
    private String referenceNo;

    @Schema(description = "担当者")
    private String operator;
}