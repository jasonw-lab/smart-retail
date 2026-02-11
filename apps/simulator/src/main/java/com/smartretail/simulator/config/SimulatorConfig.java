package com.smartretail.simulator.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * シミュレーター設定
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "simulator")
public class SimulatorConfig {

    /**
     * 対象店舗ID一覧（カンマ区切り文字列）
     */
    private String storeIds;

    /**
     * Heartbeat送信間隔（秒）
     */
    private int heartbeatIntervalSeconds = 60;

    /**
     * 決済シミュレーション間隔（秒）
     */
    private int paymentIntervalSeconds = 300;

    /**
     * 店舗ID一覧をリストで取得
     */
    public List<Long> getStoreIdList() {
        if (storeIds == null || storeIds.isBlank()) {
            return List.of(1L, 2L);
        }
        return Arrays.stream(storeIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
