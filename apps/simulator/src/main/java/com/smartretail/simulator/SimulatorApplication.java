package com.smartretail.simulator;

import com.smartretail.simulator.util.DotenvUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Smart Retail Simulator Application
 *
 * PowerJob Worker として動作し、外部世界（店舗デバイス）をシミュレートする
 */
@SpringBootApplication
public class SimulatorApplication {

    public static void main(String[] args) {
        // .env ファイルを読み込み
        DotenvUtils.loadIfPresent();
        SpringApplication.run(SimulatorApplication.class, args);
    }
}
