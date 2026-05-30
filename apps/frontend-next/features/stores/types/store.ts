import type { PageQuery, PageResult } from '@/types/api';

/**
 * 店舗ステータス
 */
export const StoreStatus = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

export type StoreStatusType = (typeof StoreStatus)[keyof typeof StoreStatus];

export const StoreStatusLabel: Record<StoreStatusType, string> = {
  ACTIVE: '稼働中',
  MAINTENANCE: 'メンテナンス中',
  INACTIVE: '停止中',
};

export const StoreStatusColor: Record<StoreStatusType, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  MAINTENANCE: 'warning',
  INACTIVE: 'error',
};

/**
 * 店舗エンティティ
 */
export interface Store {
  id: number;
  storeCode: string;
  storeName: string;
  address?: string;
  phone?: string;
  email?: string;
  status: StoreStatusType;
  /** 本日売上 */
  todaySales?: number;
  /** アラート件数 */
  alertCount?: number;
  /** 最高優先度アラート */
  highestAlertPriority?: number;
  /** 営業時間 */
  businessHours?: string;
  /** 担当者 */
  manager?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 店舗検索クエリ
 */
export interface StoreQuery extends PageQuery {
  storeName?: string;
  address?: string;
  status?: StoreStatusType | '';
}

/**
 * 店舗作成DTO
 */
export interface CreateStoreDto {
  storeCode: string;
  storeName: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: StoreStatusType;
}

/**
 * 店舗更新DTO
 */
export interface UpdateStoreDto {
  storeName?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: StoreStatusType;
}

export type StorePageResult = PageResult<Store>;
