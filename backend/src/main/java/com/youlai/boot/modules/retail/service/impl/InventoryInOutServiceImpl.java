package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.mapper.InventoryInOutMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryInOut;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.InventoryInForm;
import com.youlai.boot.modules.retail.model.form.InventoryOutForm;
import com.youlai.boot.modules.retail.model.query.InventoryInOutPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryInOutVO;
import com.youlai.boot.modules.retail.service.InventoryInOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 入出庫管理サービス実装
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class InventoryInOutServiceImpl implements InventoryInOutService {

    private final InventoryInOutMapper inventoryInOutMapper;
    private final StoreMapper storeMapper;
    private final ProductMapper productMapper;

    @Override
    public PageResult<InventoryInOutVO> getInventoryInOutPage(InventoryInOutPageQuery query) {
        Page<InventoryInOutVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        Page<InventoryInOutVO> result = inventoryInOutMapper.getInventoryInOutPage(page, query);
        return PageResult.success(result.getRecords(), result.getTotal());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean inventoryIn(InventoryInForm form) {
        // 店舗と商品の存在チェック
        Store store = storeMapper.selectById(form.getStoreId());
        if (store == null) {
            throw new IllegalArgumentException("指定された店舗が存在しません");
        }

        Product product = productMapper.selectById(form.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("指定された商品が存在しません");
        }

        // 入庫情報の登録
        InventoryInOut inventoryInOut = new InventoryInOut();
        inventoryInOut.setStoreId(form.getStoreId());
        inventoryInOut.setProductId(form.getProductId());
        inventoryInOut.setQuantity(form.getQuantity());
        inventoryInOut.setLotNumber(form.getLotNumber());
        inventoryInOut.setExpiryDate(form.getExpiryDate());
        inventoryInOut.setInType(form.getInType());
        inventoryInOut.setInOperator(form.getInOperator());
        inventoryInOut.setInTime(LocalDateTime.now());
        inventoryInOut.setStatus("入庫処理中");
        inventoryInOut.setRemarks(form.getRemarks());

        return inventoryInOutMapper.insert(inventoryInOut) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean inventoryOut(InventoryOutForm form) {
        // 店舗と商品の存在チェック
        Store store = storeMapper.selectById(form.getStoreId());
        if (store == null) {
            throw new IllegalArgumentException("指定された店舗が存在しません");
        }

        Product product = productMapper.selectById(form.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("指定された商品が存在しません");
        }

        // 出庫情報の登録
        InventoryInOut inventoryInOut = new InventoryInOut();
        inventoryInOut.setStoreId(form.getStoreId());
        inventoryInOut.setProductId(form.getProductId());
        inventoryInOut.setQuantity(form.getQuantity());
        inventoryInOut.setLotNumber(form.getLotNumber());
        inventoryInOut.setExpiryDate(form.getExpiryDate());
        inventoryInOut.setOutType(form.getOutType());
        inventoryInOut.setOutOperator(form.getOutOperator());
        inventoryInOut.setOutTime(LocalDateTime.now());
        inventoryInOut.setStatus("出車処理中");
        inventoryInOut.setRemarks(form.getRemarks());

        return inventoryInOutMapper.insert(inventoryInOut) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeInventoryIn(Long id) {
        InventoryInOut inventoryInOut = inventoryInOutMapper.selectById(id);
        if (inventoryInOut == null) {
            throw new IllegalArgumentException("指定された入出庫情報が存在しません");
        }

        if (!"入庫処理中".equals(inventoryInOut.getStatus())) {
            throw new IllegalArgumentException("入庫処理中の状態ではありません");
        }

        inventoryInOut.setStatus("入庫完了");
        return inventoryInOutMapper.updateById(inventoryInOut) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeInventoryOut(Long id) {
        InventoryInOut inventoryInOut = inventoryInOutMapper.selectById(id);
        if (inventoryInOut == null) {
            throw new IllegalArgumentException("指定された入出庫情報が存在しません");
        }

        if (!"出車処理中".equals(inventoryInOut.getStatus())) {
            throw new IllegalArgumentException("出車処理中の状態ではありません");
        }

        inventoryInOut.setStatus("出車完了");
        return inventoryInOutMapper.updateById(inventoryInOut) > 0;
    }

    @Override
    public InventoryInOutVO getInventoryInOutDetail(Long id) {
        // 入出庫情報の取得
        InventoryInOut inventoryInOut = inventoryInOutMapper.selectById(id);
        if (inventoryInOut == null) {
            return null;
        }

        // 店舗情報の取得
        Store store = storeMapper.selectById(inventoryInOut.getStoreId());
        
        // 商品情報の取得
        Product product = productMapper.selectById(inventoryInOut.getProductId());

        // レスポンスデータの作成
        InventoryInOutVO vo = new InventoryInOutVO();
        vo.setId(inventoryInOut.getId());
        vo.setStoreId(inventoryInOut.getStoreId());
        vo.setStoreName(store != null ? store.getStoreName() : null);
        vo.setProductId(inventoryInOut.getProductId());
        vo.setProductName(product != null ? product.getProductName() : null);
        vo.setQuantity(inventoryInOut.getQuantity());
        vo.setLotNumber(inventoryInOut.getLotNumber());
        vo.setExpiryDate(inventoryInOut.getExpiryDate());
        vo.setStatus(inventoryInOut.getStatus());
        vo.setOutOperator(inventoryInOut.getOutOperator());
        vo.setOutTime(inventoryInOut.getOutTime());
        vo.setOutType(inventoryInOut.getOutType());
        vo.setInOperator(inventoryInOut.getInOperator());
        vo.setInTime(inventoryInOut.getInTime());
        vo.setInType(inventoryInOut.getInType());
        vo.setRemarks(inventoryInOut.getRemarks());
        vo.setCreateTime(inventoryInOut.getCreateTime());
        vo.setUpdateTime(inventoryInOut.getUpdateTime());

        return vo;
    }
}