package com.smartretail.simulator.model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Heartbeat送信ペイロード
 *
 * @author jason.w
 */
@Data
public class HeartbeatPayload {

    private Long storeId;
    private LocalDateTime timestamp;
    private DeviceStatsPayload deviceStats;

    /**
     * デバイス状態ペイロード
     */
    @Data
    public static class DeviceStatsPayload {

        private PaymentTerminalStats paymentTerminal;
        private PrinterStats printer;
        private NetworkStats network;

        /**
         * 決済端末状態
         */
        @Data
        public static class PaymentTerminalStats {
            private String status;
            private Boolean cardReaderConnected;
            private LocalDateTime lastSelfTestAt;
            private String errorCode;
        }

        /**
         * プリンター状態
         */
        @Data
        public static class PrinterStats {
            private String status;
            private String paperLevel;
        }

        /**
         * ネットワーク状態
         */
        @Data
        public static class NetworkStats {
            private Integer latencyMs;
            private String signalStrength;
        }
    }
}
