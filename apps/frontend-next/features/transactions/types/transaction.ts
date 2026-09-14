import type { PageQuery, PageResult } from '@/types/api';

/**
 * 決済方法
 */
export const PaymentMethod = {
  CARD: 'CARD',
  QR: 'QR',
  CASH: 'CASH',
  OTHER: 'OTHER',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentMethodLabel: Record<PaymentMethodType, string> = {
  CARD: 'カード',
  QR: 'QR決済',
  CASH: '現金',
  OTHER: 'その他',
};

export const PaymentMethodIcon: Record<PaymentMethodType, string> = {
  CARD: '💳',
  QR: '📱',
  CASH: '💴',
  OTHER: '🔖',
};

export const DEFAULT_PAYMENT_CONFIG = {
  method: PaymentMethod.OTHER,
  label: 'その他',
  icon: '🔖',
  color: '#909399',
} as const;

export const PaymentMethodColor: Record<PaymentMethodType, string> = {
  CARD: '#409EFF',
  QR: '#67C23A',
  CASH: '#E6A23C',
  OTHER: '#909399',
};

export function getPaymentMethodLabel(method?: string | null): string {
  if (!method) return DEFAULT_PAYMENT_CONFIG.label;
  return (PaymentMethodLabel as Record<string, string>)[method] ?? DEFAULT_PAYMENT_CONFIG.label;
}

export function getPaymentMethodIcon(method?: string | null): string {
  if (!method) return DEFAULT_PAYMENT_CONFIG.icon;
  return (PaymentMethodIcon as Record<string, string>)[method] ?? DEFAULT_PAYMENT_CONFIG.icon;
}

export function getPaymentMethodColor(method?: string | null): string {
  if (!method) return DEFAULT_PAYMENT_CONFIG.color;
  return (PaymentMethodColor as Record<string, string>)[method] ?? DEFAULT_PAYMENT_CONFIG.color;
}

/**
 * 決済明細
 */
export interface TransactionDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * 決済履歴エンティティ
 */
export interface Transaction {
  id: number;
  orderNumber: string;
  storeId: number;
  storeName?: string;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentProvider?: string;
  referenceId?: string;
  transactionTime: string;
  details?: TransactionDetail[];
  createTime?: string;
}

/**
 * 決済履歴検索クエリ
 */
export interface TransactionQuery extends PageQuery {
  orderNumber?: string;
  storeId?: number;
  paymentMethod?: PaymentMethodType | '';
  /** 期間プリセット: today, yesterday, 7days, 30days, custom */
  period?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 売上作成DTO
 */
export interface CreateSalesDto {
  storeId: number;
  orderNumber?: string;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentProvider?: string;
  referenceId?: string;
  transactionTime?: string;
  details?: TransactionDetail[];
}

/**
 * 決済サマリ
 */
export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  byPaymentMethod: {
    method: PaymentMethodType;
    amount: number;
    count: number;
    ratio: number;
  }[];
}

export type TransactionPageResult = PageResult<Transaction> & {
  summary?: TransactionSummary;
};
