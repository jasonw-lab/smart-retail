package com.youlai.boot.modules.product.model.vo;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import com.youlai.boot.modules.product.model.entity.PmsSku;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 商品视图对象
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Getter
@Setter
@Schema( description = "商品视图对象")
public class PmsSpuPageVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "主键")
    private Long id;
    @Schema(description = "商品名称")
    private String name;
    @Schema(description = "商品类型ID")
    private Long categoryId;
    @Schema(description = "商品品牌ID")
    private Long brandId;
    @Schema(description = "原价【起】")
    private Long originPrice;
    @Schema(description = "现价【起】")
    private Long price;
    @Schema(description = "销量")
    private Integer sales;
    @Schema(description = "商品主图")
    private String picUrl;
    @Schema(description = "商品图册")
    private String[] album;
    @Schema(description = "单位")
    private String unit;
    @Schema(description = "商品简介")
    private String description;
    @Schema(description = "商品详情")
    private String detail;
    @Schema(description = "商品状态(0:下架 1:上架)")
    private Integer status;
//    @Schema(description = "创建时间")
//    private LocalDateTime createTime;
//    @Schema(description = "更新时间")
//    private LocalDateTime updateTime;
    private String categoryName;

    private String brandName;

    private List<PmsSku> skuList;
}
