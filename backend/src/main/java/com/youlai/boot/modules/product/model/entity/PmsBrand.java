package com.youlai.boot.modules.product.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.youlai.boot.common.base.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class PmsBrand extends BaseEntity {

    @TableId(type= IdType.AUTO)
    private Long id;

    @NotBlank
    private String name;

    private String logoUrl;

    private Integer sort;
}
