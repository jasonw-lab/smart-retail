import { fetchApi } from '@/lib/api/client';
import type {
  Device,
  DeviceQuery,
  DevicePageResult,
  CreateDeviceDto,
  UpdateDeviceDto,
} from '../types/device';

const BASE_URL = '/api/proxy/api/v1/retail/devices';

export const deviceApiClient = {
  /**
   * デバイス一覧取得(ページング)
   */
  async getPage(params: DeviceQuery): Promise<DevicePageResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.deviceName) searchParams.set('deviceName', params.deviceName);
    if (params.storeId) searchParams.set('storeId', String(params.storeId));
    if (params.deviceType) searchParams.set('deviceType', params.deviceType);
    if (params.status) searchParams.set('status', params.status);

    return fetchApi<DevicePageResult>(`${BASE_URL}?${searchParams.toString()}`);
  },

  /**
   * デバイス詳細取得
   */
  async getById(id: number): Promise<Device> {
    return fetchApi<Device>(`${BASE_URL}/${id}`);
  },

  /**
   * デバイス作成
   */
  async create(data: CreateDeviceDto): Promise<Device> {
    return fetchApi<Device>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * デバイス更新
   */
  async update(id: number, data: UpdateDeviceDto): Promise<Device> {
    return fetchApi<Device>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * デバイス削除
   */
  async delete(id: number): Promise<void> {
    return fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};
