import { fetchApi } from '@/lib/api/client';
import type { AlertAssistantReq, AlertAssistantVO } from '../types/alert-assistant';

const BASE_URL = '/api/proxy/api/v1/retail/ai/alerts/priority';

/**
 * Client Component専用のAlert Assistant API
 * Route Handler経由でBackendにアクセス
 */
export const alertAssistantApiClient = {
  /**
   * AI によるアラート優先度要約を取得
   * Backend: POST /api/v1/retail/ai/alerts/priority
   */
  getPrioritySummary: async (data: AlertAssistantReq): Promise<AlertAssistantVO> => {
    return fetchApi<AlertAssistantVO>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },
};
