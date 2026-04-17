package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.ProductConverter;
import com.youlai.boot.modules.retail.mapper.AlertMapper;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
import com.youlai.boot.modules.retail.mapper.InventoryTransactionMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.mapper.SalesDetailMapper;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.entity.InventoryTransaction;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.entity.SalesDetail;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;
import com.youlai.boot.modules.retail.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品サービス実装クラス
 *
 * @author jason.w
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    private final ProductConverter productConverter;
    private final AlertMapper alertMapper;
    private final InventoryMapper inventoryMapper;
    private final InventoryTransactionMapper inventoryTransactionMapper;
    private final SalesDetailMapper salesDetailMapper;

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
        // Check if product with the same code already exists
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<Product>()
                .eq(Product::getProductCode, form.getCode());
        Product existingProduct = this.getOne(queryWrapper, false);

        if (existingProduct != null) {
            throw new IllegalArgumentException("商品コード「" + form.getCode() + "」は既に存在します");
        }

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
    @Transactional
    public boolean deleteProduct(Long id) {
        // 関連する売上明細を先に削除
        LambdaQueryWrapper<SalesDetail> salesDetailWrapper = new LambdaQueryWrapper<SalesDetail>()
                .eq(SalesDetail::getProductId, id);
        salesDetailMapper.delete(salesDetailWrapper);

        // 関連する入出庫履歴を削除
        LambdaQueryWrapper<InventoryTransaction> txnWrapper = new LambdaQueryWrapper<InventoryTransaction>()
                .eq(InventoryTransaction::getProductId, id);
        inventoryTransactionMapper.delete(txnWrapper);

        // 関連する在庫を削除
        LambdaQueryWrapper<Inventory> inventoryWrapper = new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getProductId, id);
        inventoryMapper.delete(inventoryWrapper);

        // 関連するアラートを削除
        LambdaQueryWrapper<Alert> alertWrapper = new LambdaQueryWrapper<Alert>()
                .eq(Alert::getProductId, id);
        alertMapper.delete(alertWrapper);

        return this.removeById(id);
    }
}
