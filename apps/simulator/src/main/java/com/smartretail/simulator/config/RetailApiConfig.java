package com.smartretail.simulator.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Retail Backend API 設定
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "retail.backend")
public class RetailApiConfig {

    /**
     * Backend APIのベースURL
     */
    private String baseUrl;

    /**
     * Heartbeatエンドポイント
     */
    private String heartbeatEndpoint;

    /**
     * 決済エンドポイント
     */
    private String paymentEndpoint;

    /**
     * 認証トークン
     */
    private String authToken;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Heartbeat APIのフルURLを取得
     */
    public String getHeartbeatUrl() {
        return baseUrl + heartbeatEndpoint;
    }

    /**
     * Payment APIのフルURLを取得
     */
    public String getPaymentUrl() {
        return baseUrl + paymentEndpoint;
    }
}
