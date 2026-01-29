package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.AlertConverter;
import com.youlai.boot.modules.retail.mapper.AlertMapper;
import com.youlai.boot.modules.retail.mapper.ProductMapper;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import com.youlai.boot.modules.retail.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * アラートサービス実装クラス
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class AlertServiceImpl extends ServiceImpl<AlertMapper, Alert> implements AlertService {

    private final AlertConverter alertConverter;
    private final ProductMapper productMapper;

    @Override
    public PageResult<AlertPageVO> getAlertPage(AlertPageQuery queryParams) {
        // ページングパラメータ
        Page<Alert> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        // クエリ条件
        LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
                .eq(queryParams.getStoreId() != null, Alert::getStoreId, queryParams.getStoreId())
                .eq(queryParams.getProductId() != null, Alert::getProductId, queryParams.getProductId())
                .like(StringUtils.hasText(queryParams.getLotNumber()), Alert::getLotNumber, queryParams.getLotNumber())
                .eq(StringUtils.hasText(queryParams.getAlertType()), Alert::getAlertType, queryParams.getAlertType())
                .ge(queryParams.getAlertDateStart() != null, Alert::getAlertDate, queryParams.getAlertDateStart())
                .le(queryParams.getAlertDateEnd() != null, Alert::getAlertDate, queryParams.getAlertDateEnd())
                .eq(queryParams.getResolved() != null, Alert::getResolved, queryParams.getResolved())
                .orderByDesc(Alert::getAlertDate);

        // クエリ実行
        IPage<Alert> result = this.page(page, queryWrapper);

        // 商品情報取得
        List<Long> productIds = result.getRecords().stream()
                .map(Alert::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        // 結果変換
        List<AlertPageVO> list = result.getRecords().stream()
                .map(alert -> {
                    AlertPageVO vo = alertConverter.entity2Vo(alert);
                    Product product = productMap.get(alert.getProductId());
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
    public List<Alert> listAlerts() {
        // 全アラート取得
        LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
                .orderByDesc(Alert::getAlertDate);
        return this.list(queryWrapper);
    }

    @Override
    public Alert getAlertById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createAlert(AlertForm form) {
        Alert alert = alertConverter.form2Entity(form);
        return this.save(alert);
    }

    @Override
    public boolean updateAlert(Long id, AlertForm form) {
        Alert alert = alertConverter.form2Entity(form);
        alert.setId(id);
        return this.updateById(alert);
    }

    @Override
    public boolean deleteAlert(Long id) {
        return this.removeById(id);
    }

    @Override
    public boolean resolveAlert(Long id) {
        Alert alert = this.getById(id);
        if (alert == null) {
            return false;
        }
        alert.setResolved(true);
        return this.updateById(alert);
    }

    @Override
    public List<Alert> getRecentAlerts(Integer limit) {
        LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
                .orderByDesc(Alert::getAlertDate)
                .last("LIMIT " + limit);
        return this.list(queryWrapper);
    }
}