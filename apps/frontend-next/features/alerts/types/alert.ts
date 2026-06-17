/**
 * アラート種別
 */
export type AlertType =
  | 'LOW_STOCK' // 在庫切れ
  | 'EXPIRING' // 期限切れ間近
  | 'OVERSTOCK' // 在庫過多
  | 'DEVICE_ERROR' // 通信断
  | 'PAYMENT_ERROR'; // 決済端末異常

/**
 * 優先度レベル
 */
export type AlertPriority = 1 | 2 | 3 | 4;

export const AlertPriorityLabel: Record<AlertPriority, string> = {
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
};

export const AlertPriorityColor: Record<AlertPriority, string> = {
  1: 'bg-destructive text-destructive-foreground',
  2: 'bg-orange-500 text-white',
  3: 'bg-warning text-warning-foreground',
  4: 'bg-info text-info-foreground',
};

/**
 * アラートカテゴリ
 */
export type AlertCategory =
  | '通信障害'
  | '冷蔵異常'
  | '在庫異常'
  | '決済異常'
  | 'その他';

/**
 * アラートエンティティ
 */
export interface Alert {
  id: string;
  type: AlertType;
  category?: AlertCategory;
  message: string;
  productId?: number;
  productName?: string;
  deviceId?: string;
  deviceName?: string;
  storeId?: number;
  storeName?: string;
  severity: 'info' | 'warning' | 'error';
  priority: AlertPriority;
  status: 'unread' | 'acknowledged' | 'resolved';
  read: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}
