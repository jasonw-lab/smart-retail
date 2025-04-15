package com.youlai.boot.modules.product.converter;

import com.youlai.boot.modules.product.model.entity.PmsSpu;
import com.youlai.boot.modules.product.model.form.PmsSpuForm;
import org.mapstruct.Mapper;

/**
 * 商品对象转换器
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Mapper(componentModel = "spring")
public interface PmsSpuConverter{

    PmsSpuForm toForm(PmsSpu entity);

    PmsSpu toEntity(PmsSpuForm formData);
}