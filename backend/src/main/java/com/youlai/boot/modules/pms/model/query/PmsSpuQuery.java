package com.youlai.boot.modules.pms.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 商品分页查询对象
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Schema(description ="商品查询对象")
@Getter
@Setter
public class PmsSpuQuery extends BasePageQuery {

    @Schema(description="关键字")
    private String keywords;

    @Schema(description="商品分类ID")
    private Long categoryId;

    @Schema(description="排序字段名")
    private String sortField;

    @Schema(description="排序规则(asc:升序;desc:降序)")
    private String sort;
}
