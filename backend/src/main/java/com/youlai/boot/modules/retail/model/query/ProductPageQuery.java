package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 商品ページングクエリ
 *
 * @author wangjw
 */
@Schema(description = "商品ページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class ProductPageQuery extends BasePageQuery {

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "カテゴリID")
    private Long categoryId;

    @Schema(description = "状態（active, inactive）")
    private String status;
}