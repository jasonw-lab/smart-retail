package com.smartretail.simulator.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartretail.simulator.config.RetailApiConfig;
import com.smartretail.simulator.config.SimulatorConfig;
import com.smartretail.simulator.model.PaymentPayload;
import com.smartretail.simulator.util.PaymentDataGenerator;
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

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * 決済シミュレーションジョブ
 *
 * <p>ランダムな商品・数量・決済手段での売上データを生成しBackend APIに送信する</p>
 * <p>PowerJob管理UIから登録: com.smartretail.simulator.job.PaymentSimulatorJob</p>
 * <p>推奨CRON: {@code 0 *&#47;5 * * * ?} (5分毎)</p>
 *
 * @author jason.w
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSimulatorJob implements BasicProcessor {

    private final SimulatorConfig simulatorConfig;
    private final RetailApiConfig retailApiConfig;
    private final RestTemplate restTemplate;
    private final PaymentDataGenerator paymentDataGenerator;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final Random random = new Random();

    @Override
    public ProcessResult process(TaskContext context) throws Exception {
        String jobParams = context.getJobParams();
        log.info("PaymentSimulatorJob started. instanceId={}, jobParams={}", context.getInstanceId(), jobParams);

        List<Long> storeIds = parseStoreIds(jobParams);
        int transactionsToGenerate = calculateTransactionCount();

        int successCount = 0;
        int failCount = 0;

        for (int i = 0; i < transactionsToGenerate; i++) {
            Long storeId = storeIds.get(random.nextInt(storeIds.size()));
            try {
                PaymentPayload payload = paymentDataGenerator.generatePayment(storeId);
                Long salesId = sendPayment(payload);
                successCount++;
                log.debug("Payment sent for storeId={}, salesId={}", storeId, salesId);
            } catch (Exception e) {
                failCount++;
                log.error("Failed to send payment for storeId={}: {}", storeId, e.getMessage());
            }
        }

        String resultMessage = String.format("Payment simulation completed. success=%d, failed=%d, total=%d",
                successCount, failCount, transactionsToGenerate);
        log.info(resultMessage);

        return new ProcessResult(failCount == 0 || successCount > 0, resultMessage);
    }

    /**
     * ジョブパラメータから店舗IDリストを解析
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
     * 営業時間を考慮したトランザクション数を計算
     * 昼ピーク(11-14時): 多め、夜間(22-8時): 少なめ
     */
    private int calculateTransactionCount() {
        LocalTime now = LocalTime.now();
        int hour = now.getHour();

        if (hour >= 11 && hour < 14) {
            // ランチピーク: 2-5件
            return 2 + random.nextInt(4);
        } else if (hour >= 17 && hour < 20) {
            // ディナーピーク: 2-4件
            return 2 + random.nextInt(3);
        } else if (hour >= 22 || hour < 8) {
            // 夜間/早朝: 0-1件
            return random.nextInt(2);
        } else {
            // 通常時間帯: 1-2件
            return 1 + random.nextInt(2);
        }
    }

    /**
     * PaymentをBackend APIに送信
     */
    private Long sendPayment(PaymentPayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (retailApiConfig.getAuthToken() != null && !retailApiConfig.getAuthToken().isBlank()) {
            headers.set("Authorization", "Bearer " + retailApiConfig.getAuthToken());
        }

        try {
            String json = objectMapper.writeValueAsString(payload);
            HttpEntity<String> request = new HttpEntity<>(json, headers);
            var response = restTemplate.postForEntity(retailApiConfig.getPaymentUrl(), request, PaymentResponse.class);
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
            return null;
        } catch (RestClientException e) {
            throw new RuntimeException("Payment API call failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize payment payload: " + e.getMessage(), e);
        }
    }

    /**
     * Payment API レスポンス
     */
    @lombok.Data
    private static class PaymentResponse {
        private String code;
        private String msg;
        private Long data;
    }
}
