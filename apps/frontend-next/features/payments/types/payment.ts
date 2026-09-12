import type { PaymentMethodType } from '@/features/transactions/types/transaction';

/**
 * 決済結果受信ペイロード
 */
export interface PaymentPayload {
  storeId: number;
  orderNumber?: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  paymentProvider?: string;
  referenceId?: string;
  transactionTime?: string;
  details?: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

/**
 * 決済登録結果
 */
export type PaymentResult = number;
