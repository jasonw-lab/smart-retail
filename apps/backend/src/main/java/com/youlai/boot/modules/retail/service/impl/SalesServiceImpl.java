package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.mapper.SalesDetailMapper;
import com.youlai.boot.modules.retail.mapper.SalesMapper;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.entity.Sales;
import com.youlai.boot.modules.retail.model.entity.SalesDetail;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.query.SalesPageQuery;
import com.youlai.boot.modules.retail.model.vo.SalesDetailVO;
import com.youlai.boot.modules.retail.model.vo.SalesPageVO;
import com.youlai.boot.modules.retail.model.vo.SalesSummaryVO;
import com.youlai.boot.modules.retail.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 決済履歴サービス実装クラス
 *
 * @author jason.w
 */
@Service
@RequiredArgsConstructor
public class SalesServiceImpl extends ServiceImpl<SalesMapper, Sales> implements SalesService {

    private final SalesDetailMapper salesDetailMapper;
    private final StoreMapper storeMapper;
    private final ProductMapper productMapper;

    @Override
    public PageResult<SalesPageVO> getSalesPage(SalesPageQuery queryParams) {
        Page<Sales> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        LambdaQueryWrapper<Sales> queryWrapper = buildQueryWrapper(queryParams);
        queryWrapper.orderByDesc(Sales::getSaleTimestamp);

        IPage<Sales> result = this.page(page, queryWrapper);

        // 店舗IDのリストを取得してバッチで店舗名を取得
        List<Long> storeIds = result.getRecords().stream()
                .map(Sales::getStoreId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> storeNameMap = getStoreNameMap(storeIds);

        List<SalesPageVO> list = result.getRecords().stream()
                .map(sales -> convertToPageVO(sales, storeNameMap))
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public SalesDetailVO getSalesDetail(Long id) {
        Sales sales = this.getById(id);
        if (sales == null) {
            return null;
        }

        SalesDetailVO vo = new SalesDetailVO();
        vo.setId(sales.getId());
        vo.setOrderNumber(sales.getOrderNumber());
        vo.setStoreId(sales.getStoreId());
        vo.setTotalAmount(sales.getTotalAmount());
        vo.setPaymentMethod(sales.getPaymentMethod());
        vo.setPaymentProvider(sales.getPaymentProvider());
        vo.setPaymentReferenceId(sales.getPaymentReferenceId());
        vo.setSaleTimestamp(sales.getSaleTimestamp());

        // 店舗名を取得
        Store store = storeMapper.selectById(sales.getStoreId());
        if (store != null) {
            vo.setStoreName(store.getStoreName());
        }

        // 明細を取得
        LambdaQueryWrapper<SalesDetail> detailWrapper = new LambdaQueryWrapper<>();
        detailWrapper.eq(SalesDetail::getSalesId, id);
        List<SalesDetail> details = salesDetailMapper.selectList(detailWrapper);

        // 商品IDのリストを取得してバッチで商品名を取得
        List<Long> productIds = details.stream()
                .map(SalesDetail::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> productNameMap = getProductNameMap(productIds);

        List<SalesDetailVO.SalesItemVO> items = details.stream()
                .map(detail -> {
                    SalesDetailVO.SalesItemVO item = new SalesDetailVO.SalesItemVO();
                    item.setProductId(detail.getProductId());
                    item.setProductName(productNameMap.getOrDefault(detail.getProductId(), ""));
                    item.setQuantity(detail.getQuantity());
                    item.setUnitPrice(detail.getUnitPrice());
                    item.setSubtotal(detail.getSubtotal());
                    return item;
                })
                .collect(Collectors.toList());

        vo.setItems(items);

        return vo;
    }

    @Override
    public SalesSummaryVO getSalesSummary(SalesPageQuery queryParams) {
        LambdaQueryWrapper<Sales> queryWrapper = buildQueryWrapper(queryParams);
        List<Sales> salesList = this.list(queryWrapper);

        SalesSummaryVO summary = new SalesSummaryVO();

        if (salesList.isEmpty()) {
            summary.setTotalAmount(BigDecimal.ZERO);
            summary.setTotalCount(0L);
            summary.setCardCount(0L);
            summary.setQrCount(0L);
            summary.setCashCount(0L);
            summary.setOtherCount(0L);
            summary.setCardRatio(BigDecimal.ZERO);
            summary.setQrRatio(BigDecimal.ZERO);
            summary.setCashRatio(BigDecimal.ZERO);
            summary.setOtherRatio(BigDecimal.ZERO);
            return summary;
        }

        BigDecimal totalAmount = salesList.stream()
                .map(Sales::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalCount = salesList.size();
        long cardCount = salesList.stream().filter(s -> "CARD".equals(s.getPaymentMethod())).count();
        long qrCount = salesList.stream().filter(s -> "QR".equals(s.getPaymentMethod())).count();
        long cashCount = salesList.stream().filter(s -> "CASH".equals(s.getPaymentMethod())).count();
        long otherCount = salesList.stream().filter(s -> "OTHER".equals(s.getPaymentMethod())).count();

        summary.setTotalAmount(totalAmount);
        summary.setTotalCount(totalCount);
        summary.setCardCount(cardCount);
        summary.setQrCount(qrCount);
        summary.setCashCount(cashCount);
        summary.setOtherCount(otherCount);

        // 比率を計算
        BigDecimal hundred = new BigDecimal("100");
        BigDecimal totalCountBd = new BigDecimal(totalCount);

        summary.setCardRatio(new BigDecimal(cardCount).multiply(hundred).divide(totalCountBd, 1, RoundingMode.HALF_UP));
        summary.setQrRatio(new BigDecimal(qrCount).multiply(hundred).divide(totalCountBd, 1, RoundingMode.HALF_UP));
        summary.setCashRatio(new BigDecimal(cashCount).multiply(hundred).divide(totalCountBd, 1, RoundingMode.HALF_UP));
        summary.setOtherRatio(new BigDecimal(otherCount).multiply(hundred).divide(totalCountBd, 1, RoundingMode.HALF_UP));

        return summary;
    }

    private LambdaQueryWrapper<Sales> buildQueryWrapper(SalesPageQuery queryParams) {
        LambdaQueryWrapper<Sales> queryWrapper = new LambdaQueryWrapper<>();

        queryWrapper.eq(queryParams.getStoreId() != null, Sales::getStoreId, queryParams.getStoreId())
                .eq(StringUtils.hasText(queryParams.getPaymentMethod()), Sales::getPaymentMethod, queryParams.getPaymentMethod())
                .like(StringUtils.hasText(queryParams.getOrderNumber()), Sales::getOrderNumber, queryParams.getOrderNumber());

        // 期間フィルタ
        if (queryParams.getStartDate() != null) {
            LocalDateTime startDateTime = queryParams.getStartDate().atStartOfDay();
            queryWrapper.ge(Sales::getSaleTimestamp, startDateTime);
        }
        if (queryParams.getEndDate() != null) {
            LocalDateTime endDateTime = queryParams.getEndDate().atTime(LocalTime.MAX);
            queryWrapper.le(Sales::getSaleTimestamp, endDateTime);
        }

        return queryWrapper;
    }

    private Map<Long, String> getStoreNameMap(List<Long> storeIds) {
        if (storeIds.isEmpty()) {
            return Map.of();
        }
        LambdaQueryWrapper<Store> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Store::getId, storeIds);
        List<Store> stores = storeMapper.selectList(wrapper);
        return stores.stream().collect(Collectors.toMap(Store::getId, Store::getStoreName));
    }

    private Map<Long, String> getProductNameMap(List<Long> productIds) {
        if (productIds.isEmpty()) {
            return Map.of();
        }
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Product::getId, productIds);
        List<Product> products = productMapper.selectList(wrapper);
        return products.stream().collect(Collectors.toMap(Product::getId, Product::getProductName));
    }

    private SalesPageVO convertToPageVO(Sales sales, Map<Long, String> storeNameMap) {
        SalesPageVO vo = new SalesPageVO();
        vo.setId(sales.getId());
        vo.setOrderNumber(sales.getOrderNumber());
        vo.setStoreId(sales.getStoreId());
        vo.setStoreName(storeNameMap.getOrDefault(sales.getStoreId(), ""));
        vo.setTotalAmount(sales.getTotalAmount());
        vo.setPaymentMethod(sales.getPaymentMethod());
        vo.setPaymentProvider(sales.getPaymentProvider());
        vo.setSaleTimestamp(sales.getSaleTimestamp());
        return vo;
    }
}
