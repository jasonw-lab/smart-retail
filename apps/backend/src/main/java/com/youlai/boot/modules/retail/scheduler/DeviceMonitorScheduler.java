package com.youlai.boot.modules.retail.scheduler;

import com.youlai.boot.modules.retail.service.DeviceMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * デバイス監視スケジューラー
 * 沈黙監視（Silent Monitoring）を定期実行
 *
 * 検知項目:
 * - COMMUNICATION_DOWN: Heartbeat未受信（5分超過）
 * - PAYMENT_TERMINAL_DOWN: 決済端末停止（status = OFFLINE/ERROR）
 * - CARD_READER_ERROR: カードリーダー異常（cardReaderConnected = false）
 * - PRINTER_PAPER_EMPTY: プリンター用紙切れ（paperLevel = EMPTY）
 *
 * @author jason.w
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceMonitorScheduler {

    private final DeviceMonitorService deviceMonitorService;

    /**
     * デバイス監視処理を5分毎に実行
     * cron: 毎時 0, 5, 10, 15, ... 分に実行
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void runDeviceMonitoring() {
        log.info("DeviceMonitorScheduler: Starting scheduled device monitoring...");

        try {
            int totalAlerts = deviceMonitorService.runAllDeviceMonitoring();
            log.info("DeviceMonitorScheduler: Completed. Generated {} alerts.", totalAlerts);
        } catch (Exception e) {
            log.error("DeviceMonitorScheduler: Error during device monitoring", e);
        }
    }

    /**
     * 手動実行用メソッド（テスト・デバッグ用）
     *
     * @return 生成されたアラート数
     */
    public int runManually() {
        log.info("DeviceMonitorScheduler: Manual execution started...");
        int totalAlerts = deviceMonitorService.runAllDeviceMonitoring();
        log.info("DeviceMonitorScheduler: Manual execution completed. Generated {} alerts.", totalAlerts);
        return totalAlerts;
    }
}
