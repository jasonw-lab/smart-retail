package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.InventoryConverter;
import com.youlai.boot.modules.retail.enums.InventoryStatus;
import com.youlai.boot.modules.retail.mapper.InventoryMapper;
import com.youlai.boot.modules.retail.mapper.InventoryTransactionMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.entity.InventoryTransaction;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.DiscardForm;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;
import com.youlai.boot.modules.retail.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 在庫サービス実装クラス
 *
 * @author jason.w
 */
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl extends ServiceImpl<InventoryMapper, Inventory> implements InventoryService {

    private final InventoryConverter inventoryConverter;
    private final ProductMapper productMapper;
    private final StoreMapper storeMapper;
    private final InventoryTransactionMapper inventoryTransactionMapper;

    /** 期限接近の閾値（日数） */
    private static final int EXPIRY_SOON_THRESHOLD_DAYS = 3;

    @Override
    public PageResult<InventoryPageVO> getInventoryPage(InventoryPageQuery queryParams) {
        // ページングパラメータ
        Page<Inventory> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        LocalDate today = LocalDate.now();

        List<Long> productIdsByName = Collections.emptyList();
        if (StringUtils.hasText(queryParams.getProductName())) {
            productIdsByName = productMapper.selectList(new LambdaQueryWrapper<Product>()
                            .like(Product::getProductName, queryParams.getProductName())
                            .select(Product::getId))
                    .stream()
                    .map(Product::getId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());
            if (productIdsByName.isEmpty()) {
                return PageResult.success(Collections.emptyList(), 0);
            }
        }

        // クエリ条件
        LambdaQueryWrapper<Inventory> queryWrapper = new LambdaQueryWrapper<Inventory>()
                .eq(queryParams.getStoreId() != null, Inventory::getStoreId, queryParams.getStoreId())
                .eq(queryParams.getProductId() != null, Inventory::getProductId, queryParams.getProductId())
                .in(!productIdsByName.isEmpty(), Inventory::getProductId, productIdsByName)
                .like(StringUtils.hasText(queryParams.getLotNumber()), Inventory::getLotNumber, queryParams.getLotNumber())
                .ge(queryParams.getExpiryDateStart() != null, Inventory::getExpiryDate, queryParams.getExpiryDateStart())
                .le(queryParams.getExpiryDateEnd() != null, Inventory::getExpiryDate, queryParams.getExpiryDateEnd())
                .like(StringUtils.hasText(queryParams.getLocation()), Inventory::getLocation, queryParams.getLocation());

        // v1.1対応: 期限切れフィルタ
        if (Boolean.TRUE.equals(queryParams.getExpiredOnly())) {
            queryWrapper.lt(Inventory::getExpiryDate, today)
                    .gt(Inventory::getQuantity, 0);
        }

        // v1.1対応: 状態フィルタ（EXPIREDの場合は期限切れ条件を追加）
        if (StringUtils.hasText(queryParams.getStatus())) {
            String statusCode = queryParams.getStatus().toUpperCase();
            if ("EXPIRED".equals(statusCode)) {
                queryWrapper.lt(Inventory::getExpiryDate, today)
                        .gt(Inventory::getQuantity, 0);
            }
            // 他の状態は後処理でフィルタリング（DBでの直接フィルタは複雑なため）
        }

        queryWrapper.orderByDesc(Inventory::getCreateTime);

        // クエリ実行
        IPage<Inventory> result = this.page(page, queryWrapper);

        if (result.getRecords().isEmpty()) {
            return PageResult.success(Collections.emptyList(), result.getTotal());
        }

        // 店舗情報取得
        List<Long> storeIds = result.getRecords().stream()
                .map(Inventory::getStoreId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Store> storeMap = storeIds.isEmpty()
                ? Collections.emptyMap()
                : storeMapper.selectBatchIds(storeIds).stream()
                .collect(Collectors.toMap(Store::getId, store -> store));

        // 商品情報取得
        List<Long> productIds = result.getRecords().stream()
                .map(Inventory::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productIds.isEmpty()
                ? Collections.emptyMap()
                : productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        // 結果変換
        List<InventoryPageVO> list = result.getRecords().stream()
                .map(inventory -> {
                    InventoryPageVO vo = inventoryConverter.entity2Vo(inventory);
                    Store store = storeMap.get(inventory.getStoreId());
                    if (store != null) {
                        vo.setStoreName(store.getStoreName());
                    }
                    Product product = productMap.get(inventory.getProductId());
                    if (product != null) {
                        vo.setProductName(product.getProductName());
                        vo.setProductCode(product.getProductCode());
                    }
                    // v1.1対応: 状態判定
                    applyInventoryStatus(vo, inventory, product);
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean discardInventory(Long id, DiscardForm form) {
        // 在庫取得
        Inventory inventory = this.getById(id);
        if (inventory == null) {
            throw new IllegalArgumentException("在庫が見つかりません: ID=" + id);
        }

        // 廃棄数量チェック
        if (form.getQuantity() > inventory.getQuantity()) {
            throw new IllegalArgumentException(
                    "廃棄数量が現在在庫数を超えています: 現在在庫=" + inventory.getQuantity() + ", 廃棄数量=" + form.getQuantity());
        }

        // 在庫減算
        int newQuantity = inventory.getQuantity() - form.getQuantity();
        inventory.setQuantity(newQuantity);

        // 在庫が0になった場合は状態を更新
        if (newQuantity == 0) {
            inventory.setStatus(InventoryStatus.NORMAL.name());
        }

        boolean inventoryUpdated = this.updateById(inventory);

        // 廃棄履歴を登録（v0.5: 新スキーマ対応）
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setInventoryId(inventory.getId());
        transaction.setStoreId(inventory.getStoreId());
        transaction.setProductId(inventory.getProductId());
        transaction.setLotNumber(inventory.getLotNumber());
        transaction.setTxnType("DISPOSAL");
        transaction.setQuantityDelta(-form.getQuantity()); // マイナス値で記録
        transaction.setSourceType("MANUAL");
        transaction.setOccurredAt(LocalDateTime.now());
        transaction.setNote(form.getReason() + (form.getRemarks() != null ? " - " + form.getRemarks() : ""));

        int insertResult = inventoryTransactionMapper.insert(transaction);

        return inventoryUpdated && insertResult > 0;
    }

    /**
     * 在庫状態を判定してVOに設定（v1.1対応）
     *
     * 優先順位：
     * 1. EXPIRED（期限切れ）
     * 2. LOW_STOCK（在庫切れ）
     * 3. EXPIRY_SOON（期限接近）
     * 4. HIGH_STOCK（在庫過多）
     * 5. NORMAL（正常）
     *
     * @param vo        在庫ページングVO
     * @param inventory 在庫エンティティ
     * @param product   商品エンティティ（nullable）
     */
    private void applyInventoryStatus(InventoryPageVO vo, Inventory inventory, Product product) {
        LocalDate today = LocalDate.now();
        LocalDate expiryDate = inventory.getExpiryDate();
        Integer quantity = inventory.getQuantity();
        // v0.5: min_stock/max_stockはProductに移動
        Integer reorderPoint = product != null ? product.getReorderPoint() : null;
        Integer maxStock = product != null ? product.getMaxStock() : null;

        // デフォルト値
        InventoryStatus status = InventoryStatus.NORMAL;
        boolean hasExpiredLot = false;
        Integer daysUntilExpiry = null;

        // 賞味期限までの残日数を計算
        if (expiryDate != null) {
            daysUntilExpiry = (int) ChronoUnit.DAYS.between(today, expiryDate);
        }

        // 1. 期限切れチェック（最優先）
        if (expiryDate != null && expiryDate.isBefore(today) && quantity != null && quantity > 0) {
            status = InventoryStatus.EXPIRED;
            hasExpiredLot = true;
        }
        // 2. 在庫切れチェック（SKU集約在庫がreorderPoint以下でLOW_STOCK）
        else if (quantity != null && reorderPoint != null && quantity <= reorderPoint) {
            status = InventoryStatus.LOW_STOCK;
        }
        // 3. 期限接近チェック
        else if (daysUntilExpiry != null && daysUntilExpiry <= EXPIRY_SOON_THRESHOLD_DAYS && daysUntilExpiry >= 0) {
            status = InventoryStatus.EXPIRY_SOON;
        }
        // 4. 在庫過多チェック（SKU集約在庫がmaxStock×1.5以上でHIGH_STOCK）
        else if (quantity != null && maxStock != null && maxStock > 0 && quantity >= (int) (maxStock * 1.5)) {
            status = InventoryStatus.HIGH_STOCK;
        }

        // VOに設定
        vo.setStatus(status.name());
        vo.setStatusLabel(status.getLabel());
        vo.setStatusColor(status.getColor());
        vo.setHasExpiredLot(hasExpiredLot);
        vo.setDaysUntilExpiry(daysUntilExpiry);
    }
}
