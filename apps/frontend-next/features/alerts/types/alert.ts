/**
 * アラート種別
 */
export type AlertType =
  | 'LOW_STOCK'        // 在庫切れ
  | 'EXPIRING'         // 期限切れ間近
  | 'OVERSTOCK'        // 在庫過多
  | 'DEVICE_ERROR'     // 通信断
  | 'PAYMENT_ERROR';   // 決済端末異常

/**
 * アラートエンティティ
 */
export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  productId?: number;
  productName?: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
