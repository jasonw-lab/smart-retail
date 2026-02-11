package com.youlai.boot.modules.retail.enums;

import com.youlai.boot.common.util.MessageUtils;
import lombok.Getter;

/**
 * Inventory Status Enum (v1.1)
 *
 * Status Priority:
 * 1. EXPIRED - Highest priority
 * 2. LOW_STOCK
 * 3. EXPIRY_SOON
 * 4. HIGH_STOCK
 * 5. NORMAL
 *
 * @author jason.w
 */
@Getter
public enum InventoryStatus {

    EXPIRED("#F56C6C", 1),
    LOW_STOCK("#F56C6C", 2),
    EXPIRY_SOON("#E6A23C", 3),
    HIGH_STOCK("#E6A23C", 4),
    NORMAL("#67C23A", 5);

    /**
     * Display color (HEX color code)
     */
    private final String color;

    /**
     * Priority (lower value = higher priority)
     */
    private final int priority;

    InventoryStatus(String color, int priority) {
        this.color = color;
        this.priority = priority;
    }

    /**
     * Get localized label
     *
     * @return localized label
     */
    public String getLabel() {
        return MessageUtils.getMessage("inventory.status." + this.name());
    }

    /**
     * Get enum from code value
     *
     * @param code code value
     * @return enum (returns NORMAL if not found)
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
