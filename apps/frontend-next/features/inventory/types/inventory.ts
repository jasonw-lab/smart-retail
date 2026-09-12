import type { PageQuery, PageResult } from '@/types/api';

/**
 * 在庫状態
 */
export const InventoryStatus = {
  EXPIRED: 'EXPIRED',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  EXPIRING: 'EXPIRING',
  OVERSTOCK: 'OVERSTOCK',
  NORMAL: 'NORMAL',
} as const;

export type InventoryStatusType = (typeof InventoryStatus)[keyof typeof InventoryStatus];

export const InventoryStatusLabel: Record<InventoryStatusType, string> = {
  EXPIRED: '期限切れ',
  OUT_OF_STOCK: '在庫切れ',
  EXPIRING: '期限接近',
  OVERSTOCK: '在庫過多',
  NORMAL: '正常',
};

export const InventoryStatusColor: Record<
  InventoryStatusType,
  'error' | 'orange' | 'warning' | 'success'
> = {
  EXPIRED: 'error',
  OUT_OF_STOCK: 'error',
  EXPIRING: 'orange',
  OVERSTOCK: 'warning',
  NORMAL: 'success',
};

/**
 * ロットエンティティ
 */
export interface InventoryLot {
  id: number;
  lotNumber: string;
  quantity: number;
  expiryDate?: string;
}

/**
 * 在庫エンティティ(SKU集約)
 */
export interface Inventory {
  id: number;
  storeId: number;
  storeName?: string;
  productId: number;
  productCode: string;
  productName: string;
  /** 合計在庫数 */
  totalQuantity: number;
  /** 発注点 */
  reorderPoint: number;
  /** 適正上限 */
  upperLimit: number;
  /** 最古の賞味期限 */
  oldestExpiryDate?: string;
  /** 在庫状態 */
  status: InventoryStatusType;
  /** ロット別明細 */
  lots?: InventoryLot[];
  /** 在庫回転率 */
  turnoverRate?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 在庫検索クエリ
 */
export interface InventoryQuery extends PageQuery {
  storeId?: number;
  productName?: string;
  status?: InventoryStatusType | '';
}

/**
 * 在庫リスト取得クエリ（ページングなし）
 */
export interface InventoryListQuery {
  storeId?: number;
  productId?: number;
}

/**
 * Backendから返却される在庫ページ項目（ロット単位）
 */
export interface InventoryPageItem {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  productCode: string;
  lotNumber: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  location?: string;
  status: string;
  remarks?: string;
  /** 在庫回転率 */
  turnoverRate?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 在庫作成DTO
 */
export interface CreateInventoryDto {
  storeId: number;
  productId: number;
  lotNumber: string;
  quantity: number;
  expiryDate?: string;
  location?: string;
  status?: string;
  remarks?: string;
}

/**
 * 在庫更新DTO
 */
export type UpdateInventoryDto = Partial<CreateInventoryDto>;

/**
 * 補充DTO
 */
export interface ReplenishDto {
  inventoryId?: number;
  storeId: number;
  productId: number;
  quantity: number;
  lotNumber?: string;
  expiryDate?: string;
  note?: string;
}

/**
 * 廃棄DTO
 */
export interface DisposeDto {
  lotId: number;
  storeId: number;
  productId: number;
  lotNumber: string;
  quantity: number;
  reason: string;
  note?: string;
}

/**
 * 在庫トランザクションクエリ
 */
export interface InventoryTransactionQuery extends PageQuery {
  storeId?: number;
  productId?: number;
  lotNumber?: string;
  txnType?: string;
  sourceType?: string;
  referenceNo?: string;
}

/**
 * 在庫トランザクション（Backendレスポンス）
 */
export interface InventoryTransaction {
  id: number;
  inventoryId?: number;
  storeId: number;
  productId: number;
  lotNumber: string;
  txnType: string;
  quantityDelta: number;
  sourceType?: string;
  referenceNo?: string;
  reason?: string;
  note?: string;
  createTime?: string;
}

/**
 * 在庫トランザクション作成・更新DTO
 */
export interface InventoryTransactionForm {
  inventoryId?: number;
  storeId: number;
  productId: number;
  lotNumber: string;
  txnType: string;
  quantityDelta: number;
  sourceType?: string;
  referenceNo?: string;
  reason?: string;
  note?: string;
}

/**
 * 在庫履歴種別
 */
export const StockHistoryType = {
  IN: 'IN',
  OUT: 'OUT',
  DISPOSE: 'DISPOSE',
  SALE: 'SALE',
} as const;

export type StockHistoryTypeType = (typeof StockHistoryType)[keyof typeof StockHistoryType];

export const StockHistoryTypeLabel: Record<StockHistoryTypeType, string> = {
  IN: '入庫',
  OUT: '出庫',
  DISPOSE: '廃棄',
  SALE: '売上',
};

/**
 * 在庫履歴エンティティ
 */
export interface StockHistory {
  id: number;
  type: StockHistoryTypeType;
  quantity: number;
  lotNumber?: string;
  note?: string;
  createdAt: string;
}

export type InventoryPageResult = PageResult<Inventory>;
