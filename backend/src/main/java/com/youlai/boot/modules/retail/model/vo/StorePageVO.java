package com.youlai.boot.modules.retail.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 店舗ページングVO
 *
 * @author wangjw
 */
@Schema(description = "店舗ページングVO")
@Data
public class StorePageVO {

    @Schema(description = "店舗ID")
    private Long id;

    @Schema(description = "店舗コード")
    private String storeCode;

    @Schema(description = "店舗名")
    private String storeName;

    @Schema(description = "住所")
    private String address;

    @Schema(description = "電話番号")
    private String phone;

    @Schema(description = "店長名")
    private String manager;

    @Schema(description = "状態（active, inactive）")
    private String status;

    @Schema(description = "営業時間")
    private String openingHours;

    @Schema(description = "作成時間")
    private LocalDateTime createTime;

    @Schema(description = "更新時間")
    private LocalDateTime updateTime;
}
