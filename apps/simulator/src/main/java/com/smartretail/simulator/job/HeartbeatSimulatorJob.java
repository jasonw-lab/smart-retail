package com.smartretail.simulator.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartretail.simulator.config.RetailApiConfig;
import com.smartretail.simulator.config.SimulatorConfig;
import com.smartretail.simulator.model.HeartbeatPayload;
import com.smartretail.simulator.model.HeartbeatPayload.DeviceStatsPayload;
import com.smartretail.simulator.model.HeartbeatPayload.DeviceStatsPayload.NetworkStats;
import com.smartretail.simulator.model.HeartbeatPayload.DeviceStatsPayload.PaymentTerminalStats;
import com.smartretail.simulator.model.HeartbeatPayload.DeviceStatsPayload.PrinterStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tech.powerjob.worker.core.processor.ProcessResult;
import tech.powerjob.worker.core.processor.TaskContext;
import tech.powerjob.worker.core.processor.sdk.BasicProcessor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Heartbeatシミュレーションジョブ
 *
 * <p>店舗のデバイス状態を定期的にBackend APIに送信する</p>
 * <p>PowerJob管理UIから登録: com.smartretail.simulator.job.HeartbeatSimulatorJob</p>
 * <p>推奨CRON: {@code 0 *&#47;1 * * * ?} (1分毎)</p>
 *
 * @author jason.w
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HeartbeatSimulatorJob implements BasicProcessor {

    private final SimulatorConfig simulatorConfig;
    private final RetailApiConfig retailApiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final Random random = new Random();

    private static final String[] DEVICE_STATUSES = {"ONLINE", "OFFLINE", "ERROR"};
    private static final String[] PAPER_LEVELS = {"OK", "LOW", "EMPTY"};
    private static final String[] SIGNAL_STRENGTHS = {"EXCELLENT", "GOOD", "FAIR", "POOR"};

    @Override
    public ProcessResult process(TaskContext context) throws Exception {
        String jobParams = context.getJobParams();
        log.info("HeartbeatSimulatorJob started. instanceId={}, jobParams={}", context.getInstanceId(), jobParams);

        List<Long> storeIds = parseStoreIds(jobParams);
        int successCount = 0;
        int failCount = 0;

        for (Long storeId : storeIds) {
            try {
                HeartbeatPayload payload = generateHeartbeatPayload(storeId);
                sendHeartbeat(payload);
                successCount++;
                log.debug("Heartbeat sent for storeId={}", storeId);
            } catch (Exception e) {
                failCount++;
                log.error("Failed to send heartbeat for storeId={}: {}", storeId, e.getMessage());
            }
        }

        String resultMessage = String.format("Heartbeat completed. success=%d, failed=%d, total=%d",
                successCount, failCount, storeIds.size());
        log.info(resultMessage);

        return new ProcessResult(failCount == 0, resultMessage);
    }

    /**
     * ジョブパラメータから店舗IDリストを解析
     * パラメータが空の場合はSimulatorConfigのデフォルト値を使用
     */
    private List<Long> parseStoreIds(String jobParams) {
        if (jobParams != null && !jobParams.isBlank()) {
            try {
                return Arrays.stream(jobParams.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(Long::parseLong)
                        .collect(Collectors.toList());
            } catch (NumberFormatException e) {
                log.warn("Invalid jobParams format, using default storeIds: {}", jobParams);
            }
        }
        return simulatorConfig.getStoreIdList();
    }

    /**
     * Heartbeatペイロードを生成
     */
    private HeartbeatPayload generateHeartbeatPayload(Long storeId) {
        HeartbeatPayload payload = new HeartbeatPayload();
        payload.setStoreId(storeId);
        payload.setTimestamp(LocalDateTime.now());
        payload.setDeviceStats(generateDeviceStats());
        return payload;
    }

    /**
     * デバイス状態をランダム生成
     */
    private DeviceStatsPayload generateDeviceStats() {
        DeviceStatsPayload stats = new DeviceStatsPayload();

        // 決済端末状態
        PaymentTerminalStats terminal = new PaymentTerminalStats();
        terminal.setStatus(randomStatus(95)); // 95%の確率でONLINE
        terminal.setCardReaderConnected(random.nextInt(100) < 98); // 98%の確率で接続
        terminal.setLastSelfTestAt(LocalDateTime.now().minusMinutes(random.nextInt(60)));
        if ("ERROR".equals(terminal.getStatus())) {
            terminal.setErrorCode("E" + (1000 + random.nextInt(100)));
        }
        stats.setPaymentTerminal(terminal);

        // プリンター状態
        PrinterStats printer = new PrinterStats();
        printer.setStatus(randomStatus(90)); // 90%の確率でONLINE
        printer.setPaperLevel(PAPER_LEVELS[weightedRandom(new int[]{80, 15, 5})]); // OK:80%, LOW:15%, EMPTY:5%
        stats.setPrinter(printer);

        // ネットワーク状態
        NetworkStats network = new NetworkStats();
        network.setLatencyMs(10 + random.nextInt(200)); // 10-210ms
        network.setSignalStrength(SIGNAL_STRENGTHS[weightedRandom(new int[]{40, 35, 20, 5})]);
        stats.setNetwork(network);

        return stats;
    }

    /**
     * 重み付きランダムでステータスを選択
     */
    private String randomStatus(int onlineProbability) {
        int rand = random.nextInt(100);
        if (rand < onlineProbability) {
            return "ONLINE";
        } else if (rand < onlineProbability + (100 - onlineProbability) / 2) {
            return "OFFLINE";
        } else {
            return "ERROR";
        }
    }

    /**
     * 重み付きランダムインデックスを返す
     */
    private int weightedRandom(int[] weights) {
        int total = Arrays.stream(weights).sum();
        int rand = random.nextInt(total);
        int sum = 0;
        for (int i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (rand < sum) {
                return i;
            }
        }
        return weights.length - 1;
    }

    /**
     * HeartbeatをBackend APIに送信
     */
    private void sendHeartbeat(HeartbeatPayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (retailApiConfig.getAuthToken() != null && !retailApiConfig.getAuthToken().isBlank()) {
            headers.set("Authorization", "Bearer " + retailApiConfig.getAuthToken());
        }

        try {
            String json = objectMapper.writeValueAsString(payload);
            HttpEntity<String> request = new HttpEntity<>(json, headers);
            restTemplate.postForEntity(retailApiConfig.getHeartbeatUrl(), request, String.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Heartbeat API call failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize heartbeat payload: " + e.getMessage(), e);
        }
    }
}
