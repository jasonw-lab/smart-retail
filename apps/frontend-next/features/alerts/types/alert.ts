import type { PageQuery, PageResult } from '@/types/api';

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
export type AlertCategory = '通信障害' | '冷蔵異常' | '在庫異常' | '決済異常' | 'その他';

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

/**
 * Backend から返却されるアラートVO
 */
export interface BackendAlertVO {
  id: number;
  storeId?: number;
  storeName?: string;
  productId?: number;
  productName?: string;
  productCode?: string;
  lotNumber?: string;
  deviceId?: number;
  deviceName?: string;
  alertType: string;
  /** Backend が category を返す場合はそれを優先 */
  category?: string;
  priority: string;
  status: string;
  message: string;
  thresholdValue?: string;
  currentValue?: string;
  detectedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionNote?: string;
  /** Backend が既読フラグを返す場合 */
  read?: boolean;
  createTime?: string;
  updateTime?: string;
}

/**
 * アラート検索クエリ
 */
export interface AlertQuery extends PageQuery {
  priority?: string;
  status?: 'unread' | 'acknowledged' | 'resolved';
  category?: string;
  storeId?: string;
}

export type AlertPageResult = PageResult<Alert>;

/**
 * アラート作成DTO
 */
export interface CreateAlertDto {
  storeId: number;
  alertType: AlertType;
  priority: AlertPriority;
  message: string;
  productId?: number;
  deviceId?: number;
  lotNumber?: string;
  thresholdValue?: string;
  currentValue?: string;
}

/**
 * アラート状態更新DTO
 */
export interface UpdateAlertStatusDto {
  status: 'unread' | 'acknowledged' | 'resolved';
  resolutionNote?: string;
}

/**
 * Backend アラート種別 -> Frontend アラート種別
 */
export function mapBackendAlertType(alertType: string): AlertType {
  switch (alertType) {
    case 'LOW_STOCK':
      return 'LOW_STOCK';
    case 'EXPIRY_SOON':
      return 'EXPIRING';
    case 'HIGH_STOCK':
      return 'OVERSTOCK';
    case 'COMMUNICATION_DOWN':
    case 'DEVICE_ERROR':
      return 'DEVICE_ERROR';
    case 'PAYMENT_TERMINAL_DOWN':
    case 'CARD_READER_ERROR':
    case 'PRINTER_PAPER_EMPTY':
      return 'PAYMENT_ERROR';
    default:
      return 'DEVICE_ERROR';
  }
}

/**
 * Backend 優先度 -> Frontend 優先度
 */
export function mapBackendPriority(priority: string): AlertPriority {
  switch (priority) {
    case 'P1':
      return 1;
    case 'P2':
      return 2;
    case 'P3':
      return 3;
    case 'P4':
      return 4;
    default:
      return 2;
  }
}

/**
 * Frontend 優先度 -> Backend 優先度
 */
export function mapFrontendPriorityToBackend(priority: AlertPriority): string {
  return `P${priority}`;
}

/**
 * Backend ステータス -> Frontend ステータス
 */
export function mapBackendStatus(status: string): Alert['status'] {
  switch (status) {
    case 'NEW':
      return 'unread';
    case 'ACK':
    case 'IN_PROGRESS':
      return 'acknowledged';
    case 'RESOLVED':
    case 'CLOSED':
      return 'resolved';
    default:
      return 'unread';
  }
}

/**
 * Frontend ステータス -> Backend ステータス
 */
export function mapFrontendStatusToBackend(status: Alert['status']): string {
  switch (status) {
    case 'unread':
      return 'NEW';
    case 'acknowledged':
      return 'ACK';
    case 'resolved':
      return 'RESOLVED';
    default:
      return 'NEW';
  }
}

/**
 * Backend アラート種別 -> カテゴリ
 */
export function getCategoryFromAlertType(type: AlertType): AlertCategory {
  switch (type) {
    case 'DEVICE_ERROR':
      return '通信障害';
    case 'PAYMENT_ERROR':
      return '決済異常';
    case 'LOW_STOCK':
    case 'OVERSTOCK':
    case 'EXPIRING':
      return '在庫異常';
    default:
      return 'その他';
  }
}

/**
 * Backend VO -> Frontend Alert
 */
export function normalizeBackendAlert(vo: BackendAlertVO): Alert {
  const type = mapBackendAlertType(vo.alertType);
  const status = mapBackendStatus(vo.status);
  const priority = mapBackendPriority(vo.priority);

  return {
    id: String(vo.id),
    type,
    category: (vo.category as AlertCategory) || getCategoryFromAlertType(type),
    message: vo.message,
    productId: vo.productId,
    productName: vo.productName,
    deviceId: vo.deviceId !== undefined ? String(vo.deviceId) : undefined,
    deviceName: vo.deviceName,
    storeId: vo.storeId,
    storeName: vo.storeName,
    severity: priority <= 2 ? 'error' : priority === 3 ? 'warning' : 'info',
    priority,
    status,
    read: vo.read ?? status !== 'unread',
    createdAt: vo.detectedAt || vo.createTime || new Date().toISOString(),
    acknowledgedAt: vo.acknowledgedAt,
    resolvedAt: vo.resolvedAt,
  };
}

export interface AlertMonitoringSummary {
  networkStability?: number;
  incidentStores?: {
    name: string;
    issues: number;
  }[];
}
