package com.youlai.boot.modules.retail.model.form;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 店舗フォーム
 *
 * @author jason.w
 */
@Schema(description = "店舗フォーム")
@Data
public class StoreForm {

    @Schema(description = "店舗コード")
    @NotBlank(message = "店舗コードは必須です")
    @Size(max = 20, message = "店舗コードは20文字以内で入力してください")
    private String storeCode;

    @Schema(description = "店舗名")
    @NotBlank(message = "店舗名は必須です")
    @Size(max = 100, message = "店舗名は100文字以内で入力してください")
    private String storeName;

    @Schema(description = "住所")
    @Size(max = 255, message = "住所は255文字以内で入力してください")
    private String address;

    @Schema(description = "電話番号")
    @Size(max = 20, message = "電話番号は20文字以内で入力してください")
    private String phone;

    @Schema(description = "店長名")
    @Size(max = 50, message = "店長名は50文字以内で入力してください")
    private String manager;

    @Schema(description = "状態（active, inactive）")
    private String status;

    @Schema(description = "営業時間")
    @Size(max = 100, message = "営業時間は100文字以内で入力してください")
    private String openingHours;
}
