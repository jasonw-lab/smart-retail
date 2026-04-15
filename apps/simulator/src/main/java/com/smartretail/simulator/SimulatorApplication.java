package com.smartretail.simulator;

import com.smartretail.simulator.util.DotenvUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

/**
 * Smart Retail Simulator Application
 *
 * PowerJob Worker として動作し、外部世界（店舗デバイス）をシミュレートする
 */
@Slf4j
@SpringBootApplication
public class SimulatorApplication {

    private final Environment env;

    public SimulatorApplication(Environment env) {
        this.env = env;
    }

    public static void main(String[] args) {
        // .env ファイルを読み込み
        DotenvUtils.loadIfPresent();
        SpringApplication.run(SimulatorApplication.class, args);
    }

    /**
     * アプリケーション起動完了後に環境変数をログ出力
     */
    @EventListener(ApplicationReadyEvent.class)
    public void logEnvironmentVariables() {
        log.info("=".repeat(80));
        log.info("Smart Retail Simulator - Environment Variables");
        log.info("=".repeat(80));
        
        // Application Basic Info
        log.info("Application Name: {}", env.getProperty("spring.application.name"));
        log.info("Server Port: {}", env.getProperty("server.port"));
        
        log.info("-".repeat(80));
        log.info("PowerJob Worker Configuration:");
        log.info("-".repeat(80));
        log.info("  Enabled: {}", env.getProperty("powerjob.worker.enabled"));
        log.info("  App Name: {}", env.getProperty("powerjob.worker.app-name"));
        log.info("  Server Address: {}", env.getProperty("powerjob.worker.server-address"));
        log.info("  Protocol: {}", env.getProperty("powerjob.worker.protocol"));
        log.info("  Allow Lazy Connect: {}", env.getProperty("powerjob.worker.allow-lazy-connect-server"));
        
        log.info("-".repeat(80));
        log.info("Retail Backend API Configuration:");
        log.info("-".repeat(80));
        log.info("  Base URL: {}", env.getProperty("retail.backend.base-url"));
        log.info("  Heartbeat Endpoint: {}", env.getProperty("retail.backend.heartbeat-endpoint"));
        log.info("  Payment Endpoint: {}", env.getProperty("retail.backend.payment-endpoint"));
        log.info("  Auth Token: {}", maskToken(env.getProperty("retail.backend.auth-token")));
        
        log.info("-".repeat(80));
        log.info("Simulator Configuration:");
        log.info("-".repeat(80));
        log.info("  Store IDs: {}", env.getProperty("simulator.store-ids"));
        log.info("  Heartbeat Interval (seconds): {}", env.getProperty("simulator.heartbeat-interval-seconds"));
        log.info("  Payment Interval (seconds): {}", env.getProperty("simulator.payment-interval-seconds"));
        
        log.info("=".repeat(80));
        log.info("Application started successfully!");
        log.info("=".repeat(80));
    }

    /**
     * トークンをマスク処理（セキュリティ対策）
     */
    private String maskToken(String token) {
        if (token == null || token.isEmpty()) {
            return "(not set)";
        }
        if (token.length() <= 8) {
            return "****";
        }
        return token.substring(0, 4) + "****" + token.substring(token.length() - 4);
    }
}
