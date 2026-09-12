'use client';

import { useMutation } from '@tanstack/react-query';
import { alertAssistantApiClient } from '../lib/alert-assistant-api.client';
import type { AlertAssistantReq, AlertAssistantVO } from '../types/alert-assistant';

/**
 * AI アラート優先度要約取得Mutation
 */
export function useAlertAssistant() {
  return useMutation<AlertAssistantVO, Error, AlertAssistantReq>({
    mutationFn: (data: AlertAssistantReq) => alertAssistantApiClient.getPrioritySummary(data),
  });
}
