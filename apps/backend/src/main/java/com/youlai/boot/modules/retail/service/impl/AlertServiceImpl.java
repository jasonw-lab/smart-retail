package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.AlertConverter;
import com.youlai.boot.modules.retail.mapper.AlertMapper;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.form.AlertStatusForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import com.youlai.boot.modules.retail.model.vo.AlertVO;
import com.youlai.boot.modules.retail.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * アラートサービス実装クラス
 *
 * @author wangjw
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertServiceImpl extends ServiceImpl<AlertMapper, Alert> implements AlertService {

    private final AlertConverter alertConverter;

    @Override
    public PageResult<AlertPageVO> getAlertPage(AlertPageQuery queryParams) {
        Page<AlertPageVO> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());
        IPage<AlertPageVO> result = baseMapper.getAlertPage(page, queryParams);
        return PageResult.success(result.getRecords(), result.getTotal());
    }

    @Override
    public List<Alert> listAlerts() {
        LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
                .orderByDesc(Alert::getDetectedAt);
        return this.list(queryWrapper);
    }

    @Override
    public AlertVO getAlertById(Long id) {
        return baseMapper.getAlertDetail(id);
    }

    @Override
    public boolean createAlert(AlertForm form) {
        Alert alert = alertConverter.form2Entity(form);
        alert.setStatus("NEW");
        if (alert.getDetectedAt() == null) {
            alert.setDetectedAt(LocalDateTime.now());
        }
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
    @Transactional
    public boolean updateAlertStatus(Long id, AlertStatusForm form) {
        Alert alert = this.getById(id);
        if (alert == null) {
            return false;
        }

        String newStatus = form.getStatus();
        LocalDateTime now = LocalDateTime.now();

        // 状態遷移に応じた日時更新
        switch (newStatus) {
            case "ACK":
                alert.setAcknowledgedAt(now);
                break;
            case "RESOLVED":
                alert.setResolvedAt(now);
                break;
            case "CLOSED":
                alert.setClosedAt(now);
                break;
        }

        // 対応メモは常に更新可能
        if (form.getResolutionNote() != null) {
            alert.setResolutionNote(form.getResolutionNote());
        }

        alert.setStatus(newStatus);
        return this.updateById(alert);
    }

    @Override
    public List<Alert> getRecentAlerts(Integer limit) {
        if (limit == null || limit <= 0 || limit > 1000) {
            limit = 10;
        }

        LambdaQueryWrapper<Alert> queryWrapper = new LambdaQueryWrapper<Alert>()
                .orderByDesc(Alert::getDetectedAt)
                .last("LIMIT " + limit);
        return this.list(queryWrapper);
    }

    @Override
    @Transactional
    public int detectLowStockAlerts() {
        List<Map<String, Object>> targets = baseMapper.findLowStockTargets();
        int count = 0;

        for (Map<String, Object> target : targets) {
            Long storeId = ((Number) target.get("storeId")).longValue();
            Long productId = ((Number) target.get("productId")).longValue();
            Integer totalQuantity = ((Number) target.get("totalQuantity")).intValue();
            Integer reorderPoint = ((Number) target.get("reorderPoint")).intValue();
            String productName = (String) target.get("productName");
            String storeName = (String) target.get("storeName");

            // 未解決アラートが存在する場合はスキップ
            if (baseMapper.existsUnresolvedAlert(storeId, productId, null, "LOW_STOCK")) {
                continue;
            }

            Alert alert = new Alert();
            alert.setStoreId(storeId);
            alert.setProductId(productId);
            alert.setAlertType("LOW_STOCK");
            alert.setPriority("P2");
            alert.setStatus("NEW");
            alert.setMessage(String.format("[在庫切れ警告] 店舗: %s, 商品: %s, 現在在庫: %d個, 発注点: %d個",
                    storeName, productName, totalQuantity, reorderPoint));
            alert.setThresholdValue(String.valueOf(reorderPoint));
            alert.setCurrentValue(String.valueOf(totalQuantity));
            alert.setDetectedAt(LocalDateTime.now());

            this.save(alert);
            count++;
        }

        log.info("LOW_STOCK alerts detected: {}", count);
        return count;
    }

    @Override
    @Transactional
    public int detectExpirySoonAlerts() {
        List<Map<String, Object>> targets = baseMapper.findExpirySoonTargets();
        int count = 0;

        for (Map<String, Object> target : targets) {
            Long storeId = ((Number) target.get("storeId")).longValue();
            Long productId = ((Number) target.get("productId")).longValue();
            String lotNumber = (String) target.get("lotNumber");
            LocalDate expiryDate = target.get("expiryDate") instanceof LocalDate
                    ? (LocalDate) target.get("expiryDate")
                    : LocalDate.parse(target.get("expiryDate").toString());
            Integer quantity = ((Number) target.get("quantity")).intValue();
            Integer daysUntilExpiry = ((Number) target.get("daysUntilExpiry")).intValue();
            String productName = (String) target.get("productName");
            String storeName = (String) target.get("storeName");

            // 未解決アラートが存在する場合はスキップ
            if (baseMapper.existsUnresolvedAlert(storeId, productId, lotNumber, "EXPIRY_SOON")) {
                continue;
            }

            // 優先度判定
            String priority;
            if (daysUntilExpiry <= 1) {
                priority = "P1";
            } else if (daysUntilExpiry <= 3) {
                priority = "P2";
            } else {
                priority = "P3";
            }

            Alert alert = new Alert();
            alert.setStoreId(storeId);
            alert.setProductId(productId);
            alert.setLotNumber(lotNumber);
            alert.setAlertType("EXPIRY_SOON");
            alert.setPriority(priority);
            alert.setStatus("NEW");
            alert.setMessage(String.format("[賞味期限接近] 店舗: %s, 商品: %s, ロット: %s, 賞味期限: %s, 残日数: %d日, 在庫数: %d個",
                    storeName, productName, lotNumber, expiryDate, daysUntilExpiry, quantity));
            alert.setThresholdValue("7");
            alert.setCurrentValue(String.valueOf(daysUntilExpiry));
            alert.setDetectedAt(LocalDateTime.now());

            this.save(alert);
            count++;
        }

        log.info("EXPIRY_SOON alerts detected: {}", count);
        return count;
    }

    @Override
    @Transactional
    public int detectHighStockAlerts() {
        List<Map<String, Object>> targets = baseMapper.findHighStockTargets();
        int count = 0;

        for (Map<String, Object> target : targets) {
            Long storeId = ((Number) target.get("storeId")).longValue();
            Long productId = ((Number) target.get("productId")).longValue();
            Integer totalQuantity = ((Number) target.get("totalQuantity")).intValue();
            Integer maxStock = ((Number) target.get("maxStock")).intValue();
            String productName = (String) target.get("productName");
            String storeName = (String) target.get("storeName");

            // 未解決アラートが存在する場合はスキップ
            if (baseMapper.existsUnresolvedAlert(storeId, productId, null, "HIGH_STOCK")) {
                continue;
            }

            Alert alert = new Alert();
            alert.setStoreId(storeId);
            alert.setProductId(productId);
            alert.setAlertType("HIGH_STOCK");
            alert.setPriority("P3");
            alert.setStatus("NEW");
            alert.setMessage(String.format("[在庫過多] 店舗: %s, 商品: %s, 現在在庫: %d個, 適正上限: %d個, 超過率: %.0f%%",
                    storeName, productName, totalQuantity, maxStock, (double) (totalQuantity - maxStock) / maxStock * 100));
            alert.setThresholdValue(String.valueOf((int) (maxStock * 1.5)));
            alert.setCurrentValue(String.valueOf(totalQuantity));
            alert.setDetectedAt(LocalDateTime.now());

            this.save(alert);
            count++;
        }

        log.info("HIGH_STOCK alerts detected: {}", count);
        return count;
    }
}