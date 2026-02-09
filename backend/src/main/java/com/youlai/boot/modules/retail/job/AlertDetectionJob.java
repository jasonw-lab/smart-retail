package com.youlai.boot.modules.retail.job;

import com.xxl.job.core.handler.annotation.XxlJob;
import com.youlai.boot.modules.retail.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * アラート検出バッチジョブ
 *
 * @author wangjw
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class AlertDetectionJob {

    private final AlertService alertService;

    /**
     * 在庫切れアラート検出（1時間毎に実行を推奨）
     * 店舗×商品の有効在庫合計が発注点以下の場合にアラートを生成
     */
    @XxlJob("lowStockAlertJobHandler")
    public void detectLowStockAlerts() {
        log.info("在庫切れアラート検出バッチ開始");
        try {
            int count = alertService.detectLowStockAlerts();
            log.info("在庫切れアラート検出バッチ完了: {}件のアラートを生成", count);
        } catch (Exception e) {
            log.error("在庫切れアラート検出バッチ失敗", e);
            throw e;
        }
    }

    /**
     * 賞味期限接近アラート検出（毎日06:00に実行を推奨）
     * 有効在庫の賞味期限が7日以内の場合にアラートを生成
     */
    @XxlJob("expirySoonAlertJobHandler")
    public void detectExpirySoonAlerts() {
        log.info("賞味期限接近アラート検出バッチ開始");
        try {
            int count = alertService.detectExpirySoonAlerts();
            log.info("賞味期限接近アラート検出バッチ完了: {}件のアラートを生成", count);
        } catch (Exception e) {
            log.error("賞味期限接近アラート検出バッチ失敗", e);
            throw e;
        }
    }

    /**
     * 在庫過多アラート検出（毎週月曜09:00に実行を推奨）
     * 店舗×商品の有効在庫合計が適正在庫上限の1.5倍以上の場合にアラートを生成
     */
    @XxlJob("highStockAlertJobHandler")
    public void detectHighStockAlerts() {
        log.info("在庫過多アラート検出バッチ開始");
        try {
            int count = alertService.detectHighStockAlerts();
            log.info("在庫過多アラート検出バッチ完了: {}件のアラートを生成", count);
        } catch (Exception e) {
            log.error("在庫過多アラート検出バッチ失敗", e);
            throw e;
        }
    }

    /**
     * 全アラート検出（テスト用）
     * 全種類のアラートを一括で検出
     */
    @XxlJob("allAlertDetectionJobHandler")
    public void detectAllAlerts() {
        log.info("全アラート検出バッチ開始");
        try {
            int lowStockCount = alertService.detectLowStockAlerts();
            int expirySoonCount = alertService.detectExpirySoonAlerts();
            int highStockCount = alertService.detectHighStockAlerts();

            log.info("全アラート検出バッチ完了: LOW_STOCK={}件, EXPIRY_SOON={}件, HIGH_STOCK={}件",
                    lowStockCount, expirySoonCount, highStockCount);
        } catch (Exception e) {
            log.error("全アラート検出バッチ失敗", e);
            throw e;
        }
    }
}
