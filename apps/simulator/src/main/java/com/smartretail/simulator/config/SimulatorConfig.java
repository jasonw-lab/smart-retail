package com.smartretail.simulator.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * シミュレーター設定
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "simulator")
public class SimulatorConfig {

    /**
     * 対象店舗ID一覧
     */
    private List<Long> storeIds;

    /**
     * Heartbeat送信間隔（秒）
     */
    private int heartbeatIntervalSeconds = 60;

    /**
     * 決済シミュレーション間隔（秒）
     */
    private int paymentIntervalSeconds = 300;
}
