'use client';

import { useMutation } from '@tanstack/react-query';
import { paymentApiClient } from '../lib/payment-api.client';
import type { PaymentPayload } from '../types/payment';

/**
 * 決済結果受信Mutation
 */
export function useReceivePayment() {
  return useMutation({
    mutationFn: (data: PaymentPayload) => paymentApiClient.receive(data),
  });
}
