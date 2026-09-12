import { fetchApi } from '@/lib/api/client';
import type { PaymentPayload, PaymentResult } from '../types/payment';

const BASE_URL = '/api/proxy/api/v1/retail/payments';

/**
 * Client Component専用のPayment API
 * Route Handler経由でBackendにアクセス
 */
export const paymentApiClient = {
  /**
   * 決済結果受信
   * Backend: POST /api/v1/retail/payments
   */
  receive: async (data: PaymentPayload): Promise<PaymentResult> => {
    return fetchApi<PaymentResult>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },
};
