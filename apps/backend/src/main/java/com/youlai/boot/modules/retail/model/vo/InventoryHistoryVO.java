package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 在庫履歴VO
 *
 * @author jason.w
 */
@Schema(description = "在庫履歴VO")
@Data
public class InventoryHistoryVO {

    @Schema(description = "履歴ID")
    private Long id;

    @Schema(description = "在庫ID")
    private Long inventoryId;

    @Schema(description = "操作タイプ（replenish: 補充, adjust: 調整, sale: 販売, return: 返品）")
    private String type;

    @Schema(description = "数量（入庫はプラス、出庫はマイナス）")
    private Integer quantity;

    @Schema(description = "操作日時")
    private LocalDateTime date;

    @Schema(description = "理由")
    private String reason;

    @Schema(description = "担当者")
    private String operator;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;
}
