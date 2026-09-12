import { fetchApi } from '@/lib/api/client';
import type { SimpleHeartbeatPayload, HeartbeatPayload } from '../types/heartbeat';

const BASE_URL = '/api/proxy/api/v1/retail/heartbeat';

/**
 * Client Component専用のHeartbeat API
 * Route Handler経由でBackendにアクセス
 */
export const heartbeatApiClient = {
  /**
   * 簡易ハートビート送信
   * Backend: POST /api/v1/retail/heartbeat
   */
  send: async (data: SimpleHeartbeatPayload): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 店舗統計付きハートビート送信
   * Backend: POST /api/v1/retail/heartbeat/store
   */
  sendStore: async (data: HeartbeatPayload): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/store`, {
      method: 'POST',
      body: data,
    });
  },
};
