/**
 * 簡易ハートビートペイロード
 */
export interface SimpleHeartbeatPayload {
  deviceId?: number;
  storeId?: number;
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * 店舗統計付きハートビートペイロード
 */
export interface HeartbeatPayload {
  storeId: number;
  deviceStatuses?: {
    deviceId: number;
    status: string;
    lastHeartbeat?: string;
  }[];
  salesSummary?: {
    totalAmount?: number;
    transactionCount?: number;
  };
  inventorySummary?: {
    lowStockCount?: number;
    expiringCount?: number;
  };
  alertSummary?: {
    unreadCount?: number;
    criticalCount?: number;
  };
  timestamp?: string;
}
