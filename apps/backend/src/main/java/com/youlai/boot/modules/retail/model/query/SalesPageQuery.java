package com.youlai.boot.modules.retail.model.query;

import com.youlai.boot.common.base.BasePageQuery;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * 決済履歴ページングクエリ
 *
 * @author jason.w
 */
@Schema(description = "決済履歴ページングクエリ")
@Data
@EqualsAndHashCode(callSuper = true)
public class SalesPageQuery extends BasePageQuery {

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "決済方法（CASH, CARD, QR, OTHER）")
    private String paymentMethod;

    @Schema(description = "注文番号（部分一致）")
    private String orderNumber;

    @Schema(description = "期間開始日")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @Schema(description = "期間終了日")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
}
