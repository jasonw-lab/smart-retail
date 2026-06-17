import type { PageQuery, PageResult } from '@/types/api';
import {
  CreditCard,
  Camera,
  DoorOpen,
  Thermometer,
  Printer,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

/**
 * デバイス種別
 */
export const DeviceType = {
  PAYMENT_TERMINAL: 'PAYMENT_TERMINAL',
  CAMERA: 'CAMERA',
  GATE: 'GATE',
  REFRIGERATOR_SENSOR: 'REFRIGERATOR_SENSOR',
  PRINTER: 'PRINTER',
  NETWORK_ROUTER: 'NETWORK_ROUTER',
} as const;

export type DeviceTypeType = (typeof DeviceType)[keyof typeof DeviceType];

export const DeviceTypeLabel: Record<DeviceTypeType, string> = {
  PAYMENT_TERMINAL: '決済端末',
  CAMERA: 'カメラ',
  GATE: 'ゲート',
  REFRIGERATOR_SENSOR: '冷蔵庫センサー',
  PRINTER: 'プリンター',
  NETWORK_ROUTER: 'ネットワーク機器',
};

export const DeviceTypeIcon: Record<DeviceTypeType, LucideIcon> = {
  PAYMENT_TERMINAL: CreditCard,
  CAMERA: Camera,
  GATE: DoorOpen,
  REFRIGERATOR_SENSOR: Thermometer,
  PRINTER: Printer,
  NETWORK_ROUTER: Wifi,
};

/**
 * デバイスステータス
 */
export const DeviceStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  ERROR: 'ERROR',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type DeviceStatusType = (typeof DeviceStatus)[keyof typeof DeviceStatus];

export const DeviceStatusLabel: Record<DeviceStatusType, string> = {
  ONLINE: 'オンライン',
  OFFLINE: 'オフライン',
  ERROR: 'エラー',
  MAINTENANCE: 'メンテナンス',
};

export const DeviceStatusColor: Record<
  DeviceStatusType,
  'success' | 'error' | 'warning' | 'muted'
> = {
  ONLINE: 'success',
  OFFLINE: 'error',
  ERROR: 'warning',
  MAINTENANCE: 'muted',
};

/**
 * デバイスエンティティ
 */
export interface Device {
  id: number;
  deviceCode: string;
  deviceName: string;
  storeId: number;
  storeName?: string;
  deviceType: DeviceTypeType;
  status: DeviceStatusType;
  lastHeartbeat?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
  createTime?: string;
  updateTime?: string;
}

/**
 * デバイス検索クエリ
 */
export interface DeviceQuery extends PageQuery {
  deviceName?: string;
  storeId?: number;
  deviceType?: DeviceTypeType | '';
  status?: DeviceStatusType | '';
}

/**
 * デバイス作成DTO
 */
export interface CreateDeviceDto {
  deviceCode?: string;
  deviceName: string;
  storeId: number;
  deviceType: DeviceTypeType;
  status?: DeviceStatusType;
  metadata?: Record<string, unknown>;
}

/**
 * デバイス更新DTO
 */
export interface UpdateDeviceDto {
  deviceName?: string;
  storeId?: number;
  deviceType?: DeviceTypeType;
  status?: DeviceStatusType;
  lastHeartbeat?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export type DevicePageResult = PageResult<Device>;
