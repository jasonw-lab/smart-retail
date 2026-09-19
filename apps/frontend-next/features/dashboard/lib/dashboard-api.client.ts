import { fetchApi } from '@/lib/api/client';
import type { KPIData, AlertItem, SalesChartData } from '../types/dashboard';

const BASE_URL = '/api/proxy/api/v1/retail/dashboard';

/**
 * Client Component専用のDashboard API
 * Route Handler経由でBackendにアクセス
 */
export const dashboardApiClient = {
  /**
   * KPIを取得する
   */
  getKPI: (): Promise<KPIData> => {
    return fetchApi<KPIData>(`${BASE_URL}/kpi`);
  },

  /**
   * ダッシュボード用アラート一覧を取得する
   */
  getAlerts: (limit?: number): Promise<AlertItem[]> => {
    const query = limit !== undefined ? `?limit=${limit}` : '';
    return fetchApi<AlertItem[]>(`${BASE_URL}/alerts${query}`);
  },

  /**
   * 売上推移を取得する
   */
  getSalesTrend: (params?: {
    startDate?: string;
    endDate?: string;
    interval?: string;
  }): Promise<SalesChartData> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) {
      searchParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      searchParams.set('endDate', params.endDate);
    }
    if (params?.interval) {
      searchParams.set('interval', params.interval);
    }
    const query = searchParams.toString();
    return fetchApi<SalesChartData>(`${BASE_URL}/sales-trend${query ? `?${query}` : ''}`);
  },
};
