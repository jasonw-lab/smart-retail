import { fetchFromBackend } from '@/lib/api/server';
import type {
  BackendAlertVO,
  Alert,
  AlertPageResult,
  AlertMonitoringSummary,
  AlertQuery,
} from '../types/alert';
import { normalizeBackendAlert, normalizeBackendAlertList } from '../types/alert';

function buildAlertQuery(params: AlertQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.storeId) searchParams.set('storeId', params.storeId);
  if (params.status) searchParams.set('status', params.status);
  return searchParams;
}

/**
 * Server Component専用のAlert API
 * Backend直接fetch（Route Handler経由しない）
 */
export const alertApiServer = {
  /**
   * アラートリスト取得
   */
  getList: async (params: { storeId?: string; status?: string }): Promise<Alert[]> => {
    const searchParams = new URLSearchParams();
    if (params.storeId) searchParams.set('storeId', params.storeId);
    if (params.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    const data = await fetchFromBackend<unknown>(`retail/alerts${query ? `?${query}` : ''}`);
    return normalizeBackendAlertList(data).map(normalizeBackendAlert);
  },

  /**
   * アラート一覧取得（ページング）
   */
  getPage: async (params: AlertQuery): Promise<AlertPageResult> => {
    const searchParams = buildAlertQuery(params);
    const data = await fetchFromBackend<unknown>(`retail/alerts?${searchParams.toString()}`);
    const rawList = normalizeBackendAlertList(data);
    let total = rawList.length;
    if (
      typeof data === 'object' &&
      data !== null &&
      'total' in data &&
      typeof (data as Record<string, unknown>)['total'] === 'number'
    ) {
      total = (data as Record<string, unknown>)['total'] as number;
    }

    const list = rawList.map(normalizeBackendAlert).filter((alert) => {
      if (params.status && alert.status !== params.status) return false;
      if (params.priority && String(alert.priority) !== params.priority) return false;
      if (params.category && alert.category !== params.category) return false;
      return true;
    });
    return { list, total: list.length === rawList.length ? total : list.length };
  },

  /**
   * アラート詳細取得
   */
  getById: (id: string): Promise<Alert> => {
    return fetchFromBackend<BackendAlertVO>(`retail/alerts/${id}`).then(normalizeBackendAlert);
  },

  /**
   * アラート監視サマリー取得
   */
  getSummary: (): Promise<AlertMonitoringSummary> => {
    return fetchFromBackend<AlertMonitoringSummary>('retail/alerts/monitoring');
  },
};
