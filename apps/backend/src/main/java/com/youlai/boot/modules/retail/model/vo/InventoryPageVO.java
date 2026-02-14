package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 在庫ページングVO
 *
 * @author jason.w
 */
@Schema(description = "在庫ページングVO")
@Data
public class InventoryPageVO {

    @Schema(description = "在庫ID")
    private Long id;

    @Schema(description = "店舗ID")
    private Long storeId;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "商品ID")
    private Long productId;

    @Schema(description = "商品名")
    private String productName;

    @Schema(description = "商品コード")
    private String productCode;

    @Schema(description = "ロット番号")
    private String lotNumber;

    @Schema(description = "在庫数量")
    private Integer quantity;

    @Schema(description = "賞味期限")
    private LocalDate expiryDate;

    @Schema(description = "入庫日時")
    private LocalDateTime receivedAt;

    @Schema(description = "保管場所")
    private String location;

    @Schema(description = "在庫状態コード（EXPIRED, LOW_STOCK, EXPIRY_SOON, HIGH_STOCK, NORMAL）")
    private String status;

    @Schema(description = "在庫状態ラベル")
    private String statusLabel;

    @Schema(description = "在庫状態カラー（HEXカラーコード）")
    private String statusColor;

    @Schema(description = "期限切れロットの有無")
    private Boolean hasExpiredLot;

    @Schema(description = "賞味期限までの残日数")
    private Integer daysUntilExpiry;

    @Schema(description = "最終棚卸日時")
    private LocalDateTime lastCountDate;

    @Schema(description = "備考")
    private String remarks;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}
