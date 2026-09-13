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

/**
 * @deprecated i18n messages (devices.typePaymentTerminal, etc.) を使用してください
 */
export const DeviceTypeLabel: Record<DeviceTypeType, string> = {
  PAYMENT_TERMINAL: 'Payment Terminal',
  CAMERA: 'Camera',
  GATE: 'Gate',
  REFRIGERATOR_SENSOR: 'Refrigerator Sensor',
  PRINTER: 'Printer',
  NETWORK_ROUTER: 'Network Router',
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

/**
 * @deprecated i18n messages (devices.statusOnline, etc.) を使用してください
 */
export const DeviceStatusLabel: Record<DeviceStatusType, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  ERROR: 'Error',
  MAINTENANCE: 'Maintenance',
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
