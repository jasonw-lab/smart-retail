package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.InventoryConverter;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;
import com.youlai.boot.modules.retail.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 在庫サービス実装クラス
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl extends ServiceImpl<InventoryMapper, Inventory> implements InventoryService {

    private final InventoryConverter inventoryConverter;
    private final ProductMapper productMapper;

    @Override
    public PageResult<InventoryPageVO> getInventoryPage(InventoryPageQuery queryParams) {
        // ページングパラメータ
        Page<Inventory> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        // クエリ条件
        LambdaQueryWrapper<Inventory> queryWrapper = new LambdaQueryWrapper<Inventory>()
                .eq(queryParams.getStoreId() != null, Inventory::getStoreId, queryParams.getStoreId())
                .eq(queryParams.getProductId() != null, Inventory::getProductId, queryParams.getProductId())
                .like(StringUtils.hasText(queryParams.getLotNumber()), Inventory::getLotNumber, queryParams.getLotNumber())
                .eq(StringUtils.hasText(queryParams.getStatus()), Inventory::getStatus, queryParams.getStatus())
                .ge(queryParams.getExpiryDateStart() != null, Inventory::getExpiryDate, queryParams.getExpiryDateStart())
                .le(queryParams.getExpiryDateEnd() != null, Inventory::getExpiryDate, queryParams.getExpiryDateEnd())
                .like(StringUtils.hasText(queryParams.getLocation()), Inventory::getLocation, queryParams.getLocation())
                .orderByDesc(Inventory::getCreateTime);

        // クエリ実行
        IPage<Inventory> result = this.page(page, queryWrapper);

        // 商品情報取得
        List<Long> productIds = result.getRecords().stream()
                .map(Inventory::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        // 結果変換
        List<InventoryPageVO> list = result.getRecords().stream()
                .map(inventory -> {
                    InventoryPageVO vo = inventoryConverter.entity2Vo(inventory);
                    Product product = productMap.get(inventory.getProductId());
                    if (product != null) {
                        vo.setProductName(product.getProductName());
                        vo.setProductCode(product.getProductCode());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public List<Inventory> listInventories() {
        // 全在庫取得
        LambdaQueryWrapper<Inventory> queryWrapper = new LambdaQueryWrapper<Inventory>()
                .orderByDesc(Inventory::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public Inventory getInventoryById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createInventory(InventoryForm form) {
        Inventory inventory = inventoryConverter.form2Entity(form);
        return this.save(inventory);
    }

    @Override
    public boolean updateInventory(Long id, InventoryForm form) {
        Inventory inventory = inventoryConverter.form2Entity(form);
        inventory.setId(id);
        return this.updateById(inventory);
    }

    @Override
    public boolean deleteInventory(Long id) {
        return this.removeById(id);
    }
}