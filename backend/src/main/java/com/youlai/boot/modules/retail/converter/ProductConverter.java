package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProductConverter {
    ProductConverter INSTANCE = Mappers.getMapper(ProductConverter.class);
    Product formToEntity(ProductForm form);
    ProductPageVO entityToPageVO(Product entity);
} 