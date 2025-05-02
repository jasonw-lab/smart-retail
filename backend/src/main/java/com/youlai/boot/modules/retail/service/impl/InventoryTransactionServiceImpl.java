package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.InventoryTransactionConverter;
import com.youlai.boot.modules.retail.mapper.InventoryTransactionMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryTransaction;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.InventoryTransactionForm;
import com.youlai.boot.modules.retail.model.query.InventoryTransactionPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryTransactionPageVO;
import com.youlai.boot.modules.retail.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 入出庫履歴サービス実装クラス
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class InventoryTransactionServiceImpl extends ServiceImpl<InventoryTransactionMapper, InventoryTransaction> implements InventoryTransactionService {

    private final InventoryTransactionConverter inventoryTransactionConverter;
    private final ProductMapper productMapper;

    @Override
    public PageResult<InventoryTransactionPageVO> getTransactionPage(InventoryTransactionPageQuery queryParams) {
        return getTransactionPageInternal(queryParams, null);
    }

    @Override
    public PageResult<InventoryTransactionPageVO> getInboundTransactionPage(InventoryTransactionPageQuery queryParams) {
        return getTransactionPageInternal(queryParams, "IN");
    }

    @Override
    public PageResult<InventoryTransactionPageVO> getOutboundTransactionPage(InventoryTransactionPageQuery queryParams) {
        return getTransactionPageInternal(queryParams, "OUT");
    }

    /**
     * 入出庫履歴一覧（ページング）取得の内部実装
     *
     * @param queryParams クエリパラメータ
     * @param transactionType 操作タイプ（指定しない場合は全て）
     * @return ページング結果
     */
    private PageResult<InventoryTransactionPageVO> getTransactionPageInternal(InventoryTransactionPageQuery queryParams, String transactionType) {
        // ページングパラメータ
        Page<InventoryTransaction> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        // クエリ条件
        LambdaQueryWrapper<InventoryTransaction> queryWrapper = new LambdaQueryWrapper<InventoryTransaction>()
                .eq(queryParams.getStoreId() != null, InventoryTransaction::getStoreId, queryParams.getStoreId())
                .eq(queryParams.getProductId() != null, InventoryTransaction::getProductId, queryParams.getProductId())
                .like(StringUtils.hasText(queryParams.getLotNumber()), InventoryTransaction::getLotNumber, queryParams.getLotNumber())
                .eq(StringUtils.hasText(transactionType), InventoryTransaction::getTransactionType, transactionType)
                .eq(StringUtils.hasText(queryParams.getTransactionType()) && transactionType == null, InventoryTransaction::getTransactionType, queryParams.getTransactionType())
                .eq(StringUtils.hasText(queryParams.getStatus()), InventoryTransaction::getStatus, queryParams.getStatus())
                .ge(queryParams.getTransactionDateStart() != null, InventoryTransaction::getTransactionDate, queryParams.getTransactionDateStart())
                .le(queryParams.getTransactionDateEnd() != null, InventoryTransaction::getTransactionDate, queryParams.getTransactionDateEnd())
                .like(StringUtils.hasText(queryParams.getReason()), InventoryTransaction::getReason, queryParams.getReason())
                .like(StringUtils.hasText(queryParams.getReferenceNo()), InventoryTransaction::getReferenceNo, queryParams.getReferenceNo())
                .like(StringUtils.hasText(queryParams.getOperator()), InventoryTransaction::getOperator, queryParams.getOperator())
                .orderByDesc(InventoryTransaction::getTransactionDate);

        // クエリ実行
        IPage<InventoryTransaction> result = this.page(page, queryWrapper);

        // 商品情報取得
        List<Long> productIds = result.getRecords().stream()
                .map(InventoryTransaction::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        // 結果変換
        List<InventoryTransactionPageVO> list = result.getRecords().stream()
                .map(transaction -> {
                    InventoryTransactionPageVO vo = inventoryTransactionConverter.entity2Vo(transaction);
                    Product product = productMap.get(transaction.getProductId());
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
    public List<InventoryTransaction> listTransactions() {
        // 全入出庫履歴取得
        LambdaQueryWrapper<InventoryTransaction> queryWrapper = new LambdaQueryWrapper<InventoryTransaction>()
                .orderByDesc(InventoryTransaction::getTransactionDate);
        return this.list(queryWrapper);
    }

    @Override
    public InventoryTransaction getTransactionById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createTransaction(InventoryTransactionForm form) {
        InventoryTransaction transaction = inventoryTransactionConverter.form2Entity(form);
        return this.save(transaction);
    }

    @Override
    public boolean createInboundTransaction(InventoryTransactionForm form) {
        form.setTransactionType("IN");
        return createTransaction(form);
    }

    @Override
    public boolean createOutboundTransaction(InventoryTransactionForm form) {
        form.setTransactionType("OUT");
        return createTransaction(form);
    }

    @Override
    public boolean updateTransaction(Long id, InventoryTransactionForm form) {
        InventoryTransaction transaction = inventoryTransactionConverter.form2Entity(form);
        transaction.setId(id);
        return this.updateById(transaction);
    }

    @Override
    public boolean deleteTransaction(Long id) {
        return this.removeById(id);
    }
}