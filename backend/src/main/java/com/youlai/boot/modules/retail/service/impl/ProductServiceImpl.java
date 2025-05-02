package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
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
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品サービス実装クラス
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    private final ProductConverter productConverter;

    @Override
    public PageResult<ProductPageVO> getProductPage(ProductPageQuery queryParams) {
        // ページングパラメータ
        Page<Product> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        // クエリ条件
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<Product>()
                .like(StringUtils.hasText(queryParams.getProductName()), Product::getProductName, queryParams.getProductName())
                .like(StringUtils.hasText(queryParams.getProductCode()), Product::getProductCode, queryParams.getProductCode())
                .eq(queryParams.getCategoryId() != null, Product::getCategoryId, queryParams.getCategoryId())
                .eq(StringUtils.hasText(queryParams.getStatus()), Product::getStatus, queryParams.getStatus())
                .orderByDesc(Product::getCreateTime);

        // クエリ実行
        IPage<Product> result = this.page(page, queryWrapper);

        // 結果変換
        List<ProductPageVO> list = result.getRecords().stream()
                .map(productConverter::entity2Vo)
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public List<Product> listProducts() {
        // 全商品取得
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<Product>()
                .orderByDesc(Product::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public Product getProductById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createProduct(ProductForm form) {
        Product product = productConverter.form2Entity(form);
        return this.save(product);
    }

    @Override
    public boolean updateProduct(Long id, ProductForm form) {
        Product product = productConverter.form2Entity(form);
        product.setId(id);
        return this.updateById(product);
    }

    @Override
    public boolean deleteProduct(Long id) {
        return this.removeById(id);
    }
}