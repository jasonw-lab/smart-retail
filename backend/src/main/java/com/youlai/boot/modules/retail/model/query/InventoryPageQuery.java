package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 在庫ページングクエリ
 *
 * @author wangjw
 */
@Schema(description = "在庫ページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class InventoryPageQuery extends BasePageQuery {

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "在庫状態（low, normal, high, expired）")
    private String status;

    @Schema(description = "賞味期限（開始）")
    private LocalDate expiryDateStart;

    @Schema(description = "賞味期限（終了）")
    private LocalDate expiryDateEnd;

    @Schema(description = "保管場所")
    private String location;
}