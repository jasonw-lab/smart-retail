package com.youlai.boot.modules.retail.enums;

import lombok.Getter;

/**
 * 在庫状態列挙型（v1.1対応）
 *
 * 状態判定の優先順位：
 * 1. EXPIRED（期限切れ）- 最優先
 * 2. LOW_STOCK（在庫切れ）
 * 3. EXPIRY_SOON（期限接近）
 * 4. HIGH_STOCK（在庫過多）
 * 5. NORMAL（正常）
 *
 * @author jason.w
 */
@Getter
public enum InventoryStatus {

    EXPIRED("期限切れ", "#F56C6C", 1),
    LOW_STOCK("在庫切れ", "#F56C6C", 2),
    EXPIRY_SOON("期限接近", "#E6A23C", 3),
    HIGH_STOCK("在庫過多", "#E6A23C", 4),
    NORMAL("正常", "#67C23A", 5);

    /**
     * 表示名
     */
    private final String label;

    /**
     * 表示色（HEXカラーコード）
     */
    private final String color;

    /**
     * 優先度（小さいほど優先）
     */
    private final int priority;

    InventoryStatus(String label, String color, int priority) {
        this.label = label;
        this.color = color;
        this.priority = priority;
    }

    /**
     * コード値から列挙型を取得
     *
     * @param code コード値
     * @return 列挙型（見つからない場合はNORMAL）
     */
    public static InventoryStatus fromCode(String code) {
        if (code == null) {
            return NORMAL;
        }
        for (InventoryStatus status : values()) {
            if (status.name().equalsIgnoreCase(code)) {
                return status;
            }
        }
        return NORMAL;
    }
}
