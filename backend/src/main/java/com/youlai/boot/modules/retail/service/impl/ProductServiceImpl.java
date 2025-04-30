package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.ProductConverter;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import com.youlai.boot.modules.retail.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductMapper productMapper;

    @Override
    public PageResult<ProductPageVO> getProductPage(ProductPageQuery queryParams) {
        Page<Product> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (queryParams.getProductName() != null && !queryParams.getProductName().isEmpty()) {
            wrapper.like(Product::getName, queryParams.getProductName());
        }
        if (queryParams.getCategoryId() != null) {
            wrapper.eq(Product::getCategoryId, queryParams.getCategoryId());
        }
        if (queryParams.getExpiryDate() != null && !queryParams.getExpiryDate().isEmpty()) {
            wrapper.eq(Product::getExpiryDate, queryParams.getExpiryDate());
        }
        if (queryParams.getPriceMin() != null) {
            wrapper.ge(Product::getPrice, queryParams.getPriceMin());
        }
        if (queryParams.getPriceMax() != null) {
            wrapper.le(Product::getPrice, queryParams.getPriceMax());
        }
        Page<Product> result = productMapper.selectPage(page, wrapper);
        Page<ProductPageVO> voPage = new Page<>();
        voPage.setRecords(result.getRecords().stream().map(ProductConverter.INSTANCE::entityToPageVO).collect(Collectors.toList()));
        voPage.setTotal(result.getTotal());
        voPage.setCurrent(result.getCurrent());
        voPage.setSize(result.getSize());
        return PageResult.success(voPage);
    }

    @Override
    public List<Product> listProducts() {
        return productMapper.selectList(null);
    }

    @Override
    public boolean createProduct(ProductForm form) {
        Product product = ProductConverter.INSTANCE.formToEntity(form);
        return productMapper.insert(product) > 0;
    }

    @Override
    public boolean updateProduct(Long id, ProductForm form) {
        Product product = ProductConverter.INSTANCE.formToEntity(form);
        product.setId(id);
        return productMapper.updateById(product) > 0;
    }

    @Override
    public boolean deleteProduct(Long id) {
        return productMapper.deleteById(id) > 0;
    }

    @Override
    public Product getProductById(Long id) {
        return productMapper.selectById(id);
    }
} 