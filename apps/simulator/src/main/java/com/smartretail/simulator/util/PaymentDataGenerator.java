package com.smartretail.simulator.util;

import com.smartretail.simulator.model.PaymentPayload;
import com.smartretail.simulator.model.PaymentPayload.PaymentItemPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 決済テストデータ生成ユーティリティ
 *
 * @author jason.w
 */
@Slf4j
@Component
public class PaymentDataGenerator {

    private final Random random = new Random();
    private final AtomicLong orderSequence = new AtomicLong(1);

    private static final String[] PAYMENT_METHODS = {"CASH", "CARD", "QR"};
    private static final String[] PAYMENT_PROVIDERS = {null, "VISA", "Mastercard", "PayPay", "LINE Pay", "楽天ペイ"};
    private static final int[] PAYMENT_METHOD_WEIGHTS = {30, 40, 30}; // CASH:30%, CARD:40%, QR:30%

    /**
     * サンプル商品データ（実際のDBから取得する想定だが、シミュレーション用に固定値）
     */
    private static final ProductData[] SAMPLE_PRODUCTS = {
            new ProductData(1L, "コーヒー豆 コロンビア", new BigDecimal("980")),
            new ProductData(2L, "コーヒー豆 エチオピア", new BigDecimal("1200")),
            new ProductData(3L, "コーヒー豆 ブラジル", new BigDecimal("880")),
            new ProductData(4L, "ドリップコーヒー アソート", new BigDecimal("480")),
            new ProductData(5L, "コーヒーミル 手動", new BigDecimal("3500")),
            new ProductData(6L, "コーヒーフィルター 100枚", new BigDecimal("320")),
            new ProductData(7L, "マグカップ 陶器", new BigDecimal("1500")),
            new ProductData(8L, "タンブラー ステンレス", new BigDecimal("2800")),
            new ProductData(9L, "コーヒーシュガー", new BigDecimal("280")),
            new ProductData(10L, "ミルクポーション 10個入", new BigDecimal("150")),
    };

    /**
     * 決済データを生成
     */
    public PaymentPayload generatePayment(Long storeId) {
        PaymentPayload payload = new PaymentPayload();
        payload.setStoreId(storeId);
        payload.setOrderNumber(generateOrderNumber());
        payload.setSaleTimestamp(LocalDateTime.now());

        // 決済手段を選択
        int methodIndex = weightedRandom(PAYMENT_METHOD_WEIGHTS);
        String paymentMethod = PAYMENT_METHODS[methodIndex];
        payload.setPaymentMethod(paymentMethod);

        // 決済プロバイダを設定
        if ("CARD".equals(paymentMethod)) {
            payload.setPaymentProvider(random.nextBoolean() ? "VISA" : "Mastercard");
        } else if ("QR".equals(paymentMethod)) {
            String[] qrProviders = {"PayPay", "LINE Pay", "楽天ペイ"};
            payload.setPaymentProvider(qrProviders[random.nextInt(qrProviders.length)]);
        }

        // 決済参照IDを生成
        payload.setPaymentReferenceId("TXN-" + System.currentTimeMillis() + "-" + random.nextInt(1000));

        // 明細を生成
        List<PaymentItemPayload> items = generateItems();
        payload.setItems(items);

        // 合計金額を計算
        BigDecimal totalAmount = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        payload.setTotalAmount(totalAmount);

        log.debug("Generated payment: orderNumber={}, totalAmount={}, items={}",
                payload.getOrderNumber(), totalAmount, items.size());

        return payload;
    }

    /**
     * 注文番号を生成
     */
    private String generateOrderNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long seq = orderSequence.getAndIncrement();
        return String.format("ORD-%s-%03d", date, seq % 1000);
    }

    /**
     * 明細を生成（1-4商品）
     */
    private List<PaymentItemPayload> generateItems() {
        int itemCount = 1 + random.nextInt(4); // 1-4商品
        List<PaymentItemPayload> items = new ArrayList<>();
        List<Integer> usedProductIndexes = new ArrayList<>();

        for (int i = 0; i < itemCount; i++) {
            int productIndex;
            do {
                productIndex = random.nextInt(SAMPLE_PRODUCTS.length);
            } while (usedProductIndexes.contains(productIndex) && usedProductIndexes.size() < SAMPLE_PRODUCTS.length);

            usedProductIndexes.add(productIndex);
            ProductData product = SAMPLE_PRODUCTS[productIndex];

            PaymentItemPayload item = new PaymentItemPayload();
            item.setProductId(product.id);
            item.setQuantity(1 + random.nextInt(3)); // 1-3個
            item.setUnitPrice(product.price);
            items.add(item);
        }

        return items;
    }

    /**
     * 重み付きランダムインデックスを返す
     */
    private int weightedRandom(int[] weights) {
        int total = 0;
        for (int w : weights) total += w;
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
     * 商品データ（内部クラス）
     */
    private static class ProductData {
        final Long id;
        final String name;
        final BigDecimal price;

        ProductData(Long id, String name, BigDecimal price) {
            this.id = id;
            this.name = name;
            this.price = price;
        }
    }
}
