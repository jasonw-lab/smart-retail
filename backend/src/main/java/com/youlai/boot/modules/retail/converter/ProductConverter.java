package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * 商品コンバーター
 *
 * @author jason.w
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductConverter {

    /**
     * ProductForm から Product エンティティへの変換
     *
     * @param form 商品フォーム
     * @return 商品エンティティ
     */
    @Mapping(source = "code", target = "productCode")
    @Mapping(source = "name", target = "productName")
    @Mapping(source = "price", target = "unitPrice")
    Product form2Entity(ProductForm form);

    /**
     * Product エンティティから ProductPageVO への変換
     *
     * @param entity 商品エンティティ
     * @return 商品ページングVO
     */
    ProductPageVO entity2Vo(Product entity);
}