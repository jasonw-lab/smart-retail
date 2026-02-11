package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 店舗ページングクエリ
 *
 * @author jason.w
 */
@Schema(description = "店舗ページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class StorePageQuery extends BasePageQuery {

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "店長")
    private String manager;

    @Schema(description = "店舗コード")
    private String storeCode;

    @Schema(description = "状態（active, inactive）")
    private String status;
}
