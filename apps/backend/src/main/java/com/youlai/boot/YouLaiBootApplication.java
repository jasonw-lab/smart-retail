package com.youlai.boot;

import com.youlai.boot.common.util.DotenvUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.sql.DataSource;

/**
 * SpringBootApplication
 */
@Slf4j
@SpringBootApplication
@ConfigurationPropertiesScan // 开启配置属性绑定
@EnableScheduling // スケジューラー有効化（DeviceMonitorScheduler等）
public class YouLaiBootApplication {

    public static void main(String[] args) {
        DotenvUtils.loadIfPresent();
        SpringApplication.run(YouLaiBootApplication.class, args);
    }

    @Bean
    public CommandLineRunner logStartupInfo(Environment env, DataSource dataSource) {
        return args -> {
            log.info("========================================");
            log.info("アプリケーション起動情報");
            log.info("========================================");
            
            // 環境変数のログ出力
            log.info("環境変数:");
            log.info("  MYSQL_HOST: {}", env.getProperty("MYSQL_HOST"));
            log.info("  MYSQL_PORT: {}", env.getProperty("MYSQL_PORT"));
            log.info("  MYSQL_DATABASE: {}", env.getProperty("MYSQL_DATABASE"));
            log.info("  MYSQL_USERNAME: {}", env.getProperty("MYSQL_USERNAME"));
            log.info("  REDIS_PASSWORD: {}", env.getProperty("REDIS_PASSWORD") != null ? "******" : null);
            
            // データベース接続情報
            log.info("データベース接続情報:");
            log.info("  DB URL: {}", env.getProperty("spring.datasource.url"));
            log.info("  DB Username: {}", env.getProperty("spring.datasource.username"));
            log.info("  Driver: {}", env.getProperty("spring.datasource.driver-class-name"));
            
            // Redis接続情報
            log.info("Redis接続情報:");
            log.info("  Redis Host: {}", env.getProperty("spring.data.redis.host"));
            log.info("  Redis Port: {}", env.getProperty("spring.data.redis.port"));
            
            log.info("========================================");
        };
    }

}
