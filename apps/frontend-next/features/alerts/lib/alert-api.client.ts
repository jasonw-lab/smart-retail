import { fetchApi } from '@/lib/api/client';
import type {
  Alert,
  AlertQuery,
  AlertPageResult,
  AlertPriority,
  CreateAlertDto,
  UpdateAlertStatusDto,
  BackendAlertVO,
} from '../types/alert';
import {
  normalizeBackendAlert,
  mapFrontendPriorityToBackend,
  mapFrontendStatusToBackend,
} from '../types/alert';

const BASE_URL = '/api/proxy/api/v1/retail/alerts';

export const alertApiClient = {
  /**
   * アラートリスト取得
   * Backend: GET /api/v1/retail/alerts?storeId=&status=
   */
  async getList(params: {
    storeId?: string;
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<Alert[]> {
    const searchParams = new URLSearchParams();
    if (params.storeId) searchParams.set('storeId', params.storeId);
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    const data = await fetchApi<BackendAlertVO[]>(`${BASE_URL}${query ? `?${query}` : ''}`);
    return (data || []).map(normalizeBackendAlert);
  },

  /**
   * アラート一覧取得（ページング）
   *
   * Backend は現状ページング未対応のため、クライアント側でページング・フィルタリングを行う。
   */
  async getPage(params: AlertQuery): Promise<AlertPageResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('pageNum', String(params.pageNum));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.storeId) {
      searchParams.set('storeId', params.storeId);
    }
    if (params.status) {
      searchParams.set('status', mapFrontendStatusToBackend(params.status));
    }
    if (params.priority) {
      searchParams.set(
        'priority',
        mapFrontendPriorityToBackend(Number(params.priority) as AlertPriority)
      );
    }
    if (params.category) {
      searchParams.set('category', params.category);
    }

    const data = await fetchApi<BackendAlertVO[]>(`${BASE_URL}?${searchParams.toString()}`);
    const list = (data || []).map(normalizeBackendAlert).filter((alert) => {
      if (params.status && alert.status !== params.status) return false;
      if (params.priority && String(alert.priority) !== params.priority) return false;
      if (params.category && alert.category !== params.category) return false;
      return true;
    });

    return {
      list,
      total: list.length,
    };
  },

  /**
   * アラート詳細取得
   */
  async getById(id: string): Promise<Alert> {
    const data = await fetchApi<BackendAlertVO>(`${BASE_URL}/${id}`);
    return normalizeBackendAlert(data);
  },

  /**
   * アラート作成
   */
  async create(data: CreateAlertDto): Promise<void> {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: {
        storeId: data.storeId,
        alertType: data.alertType,
        priority: mapFrontendPriorityToBackend(data.priority),
        message: data.message,
        productId: data.productId,
        deviceId: data.deviceId,
        lotNumber: data.lotNumber,
        thresholdValue: data.thresholdValue,
        currentValue: data.currentValue,
      },
    });
  },

  /**
   * アラート状態更新
   */
  async updateStatus(id: string, data: UpdateAlertStatusDto): Promise<void> {
    await fetchApi<void>(`${BASE_URL}/${id}/status`, {
      method: 'PATCH',
      body: {
        status: mapFrontendStatusToBackend(data.status),
        resolutionNote: data.resolutionNote,
      },
    });
  },

  /**
   * アラート削除
   */
  async delete(id: string): Promise<void> {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};
