package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import java.util.List;

public interface ProductService {
    PageResult<ProductPageVO> getProductPage(ProductPageQuery queryParams);
    List<Product> listProducts();
    boolean createProduct(ProductForm form);
    boolean updateProduct(Long id, ProductForm form);
    boolean deleteProduct(Long id);
    Product getProductById(Long id);
} 