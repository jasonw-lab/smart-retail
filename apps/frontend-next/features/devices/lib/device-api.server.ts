import { fetchFromBackend } from '@/lib/api/server';
import type { Device, DeviceQuery, DevicePageResult } from '../types/device';

/**
 * Server Component専用のDevice API
 * Backend直接fetch（Route Handler経由しない）
 */
export const deviceApiServer = {
  /**
   * デバイス一覧取得（ページネーション）
   */
  getPage: async (params: DeviceQuery): Promise<DevicePageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.deviceName) {
      searchParams.set('deviceName', params.deviceName);
    }
    if (params.storeId) {
      searchParams.set('storeId', String(params.storeId));
    }
    if (params.deviceType) {
      searchParams.set('deviceType', params.deviceType);
    }
    if (params.status) {
      searchParams.set('status', params.status);
    }
    return fetchFromBackend<DevicePageResult>(
      `retail/devices?${searchParams.toString()}`
    );
  },

  /**
   * デバイス詳細取得
   */
  getById: async (id: number): Promise<Device> => {
    return fetchFromBackend<Device>(`retail/devices/${id}`);
  },
};
