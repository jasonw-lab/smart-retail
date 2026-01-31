package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.InventoryConverter;
import com.youlai.boot.modules.retail.mapper.InventoryHistoryMapper;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.entity.InventoryHistory;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.form.InventoryReplenishForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryHistoryVO;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;
import com.youlai.boot.modules.retail.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 在庫サービス実装クラス
 *
 * @author jason.w
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl extends ServiceImpl<InventoryMapper, Inventory> implements InventoryService {

    private final InventoryConverter inventoryConverter;
    private final ProductMapper productMapper;
    private final StoreMapper storeMapper;
    private final InventoryHistoryMapper inventoryHistoryMapper;

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

        // 店舗情報取得
        List<Long> storeIds = result.getRecords().stream()
                .map(Inventory::getStoreId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Store> storeMap = storeMapper.selectBatchIds(storeIds).stream()
                .collect(Collectors.toMap(Store::getId, store -> store));

        // 結果変換
        List<InventoryPageVO> list = result.getRecords().stream()
                .map(inventory -> {
                    InventoryPageVO vo = inventoryConverter.entity2Vo(inventory);
                    Product product = productMap.get(inventory.getProductId());
                    if (product != null) {
                        vo.setProductName(product.getProductName());
                        vo.setProductCode(product.getProductCode());
                    }
                    Store store = storeMap.get(inventory.getStoreId());
                    if (store != null) {
                        vo.setStoreName(store.getStoreName());
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
        // 在庫状態を自動設定
        updateInventoryStatus(inventory);
        return this.save(inventory);
    }

    @Override
    public boolean updateInventory(Long id, InventoryForm form) {
        Inventory inventory = inventoryConverter.form2Entity(form);
        inventory.setId(id);
        // 在庫状態を自動設定
        updateInventoryStatus(inventory);
        return this.updateById(inventory);
    }

    @Override
    public boolean deleteInventory(Long id) {
        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean replenishInventory(Long id, InventoryReplenishForm form) {
        // 在庫情報取得
        Inventory inventory = this.getById(id);
        if (inventory == null) {
            log.error("在庫が見つかりません。ID: {}", id);
            return false;
        }

        // 在庫数量を更新
        int newQuantity = inventory.getQuantity() + form.getQuantity();
        inventory.setQuantity(newQuantity);

        // 在庫状態を更新
        updateInventoryStatus(inventory);

        boolean updateResult = this.updateById(inventory);
        if (!updateResult) {
            log.error("在庫更新に失敗しました。ID: {}", id);
            return false;
        }

        // 在庫履歴を記録
        InventoryHistory history = new InventoryHistory();
        history.setInventoryId(id);
        history.setType("replenish");
        history.setQuantity(form.getQuantity());
        history.setDate(LocalDateTime.now());
        history.setReason(form.getReason());
        history.setOperator(form.getOperator());

        int insertResult = inventoryHistoryMapper.insert(history);
        if (insertResult <= 0) {
            log.error("在庫履歴の記録に失敗しました。在庫ID: {}", id);
            throw new RuntimeException("在庫履歴の記録に失敗しました");
        }

        log.info("在庫補充完了。在庫ID: {}, 補充数量: {}, 新在庫数: {}", id, form.getQuantity(), newQuantity);
        return true;
    }

    @Override
    public List<InventoryHistoryVO> getInventoryHistory(Long id) {
        LambdaQueryWrapper<InventoryHistory> queryWrapper = new LambdaQueryWrapper<InventoryHistory>()
                .eq(InventoryHistory::getInventoryId, id)
                .orderByDesc(InventoryHistory::getDate);

        List<InventoryHistory> histories = inventoryHistoryMapper.selectList(queryWrapper);

        return histories.stream()
                .map(inventoryConverter::historyEntity2Vo)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void detectInventoryAlerts() {
        log.info("在庫アラート検出を開始します");

        // 全在庫を取得
        List<Inventory> inventories = this.list();

        int updatedCount = 0;
        for (Inventory inventory : inventories) {
            String oldStatus = inventory.getStatus();
            updateInventoryStatus(inventory);

            // ステータスが変更された場合のみ更新
            if (!oldStatus.equals(inventory.getStatus())) {
                this.updateById(inventory);
                updatedCount++;
                log.debug("在庫状態を更新しました。ID: {}, 旧状態: {}, 新状態: {}",
                    inventory.getId(), oldStatus, inventory.getStatus());
            }
        }

        log.info("在庫アラート検出が完了しました。更新件数: {}", updatedCount);
    }

    /**
     * 在庫状態を更新する
     *
     * @param inventory 在庫エンティティ
     */
    private void updateInventoryStatus(Inventory inventory) {
        LocalDate today = LocalDate.now();

        // 賞味期限切れチェック
        if (inventory.getExpiryDate() != null && inventory.getExpiryDate().isBefore(today)) {
            inventory.setStatus("expired");
            return;
        }

        // 在庫数量チェック
        Integer quantity = inventory.getQuantity();
        Integer minStock = inventory.getMinStock();
        Integer maxStock = inventory.getMaxStock();

        if (minStock != null && quantity < minStock) {
            inventory.setStatus("low");
        } else if (maxStock != null && quantity > maxStock) {
            inventory.setStatus("high");
        } else {
            inventory.setStatus("normal");
        }
    }
}
