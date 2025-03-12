package com.youlai.boot.modules.product.model.form;

import java.io.Serial;
import java.io.Serializable;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

/**
 * 商品表单对象
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Getter
@Setter
@Schema(description = "商品表单对象")
public class PmsSpuForm implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "主键")
    @NotNull(message = "主键不能为空")
    private Long id;

    @Schema(description = "商品名称")
    @NotBlank(message = "商品名称不能为空")
    @Size(max=64, message="商品名称长度不能超过64个字符")
    private String name;

    @Schema(description = "商品类型ID")
    @NotNull(message = "商品类型ID不能为空")
    private Long categoryId;

    @Schema(description = "商品品牌ID")
    private Long brandId;

    @Schema(description = "原价【起】")
    @NotNull(message = "原价【起】不能为空")
    private Long originPrice;

    @Schema(description = "现价【起】")
    @NotNull(message = "现价【起】不能为空")
    private Long price;

    @Schema(description = "销量")
    private Integer sales;

    @Schema(description = "商品主图")
    @Size(max=255, message="商品主图长度不能超过255个字符")
    private String picUrl;

    @Schema(description = "商品图册")
    private String album;

    @Schema(description = "单位")
    @Size(max=16, message="单位长度不能超过16个字符")
    private String unit;

    @Schema(description = "商品简介")
    @Size(max=255, message="商品简介长度不能超过255个字符")
    private String description;

    @Schema(description = "商品详情")
    @Size(max=65535, message="商品详情长度不能超过65535个字符")
    private String detail;

    @Schema(description = "商品状态(0:下架 1:上架)")
    private Integer status;

    @Schema(description = "创建时间")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;


}
