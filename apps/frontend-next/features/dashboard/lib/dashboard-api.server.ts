import { fetchFromBackend } from '@/lib/api/server';
import type { KPIData, AlertItem, SalesChartData } from '../types/dashboard';

const BASE_PATH = 'retail/dashboard';

function buildDateQuery(params?: { startDate?: string; endDate?: string }): string {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Server Component専用のDashboard API
 * Backend直接fetch（Route Handler経由しない）
 */
export const dashboardApiServer = {
  /**
   * KPIを取得する
   */
  getKPI: (): Promise<KPIData> => {
    return fetchFromBackend<KPIData>(`${BASE_PATH}/kpi`);
  },

  /**
   * ダッシュボード用アラート一覧を取得する
   */
  getAlerts: (limit?: number): Promise<AlertItem[]> => {
    const query = limit !== undefined ? `?limit=${limit}` : '';
    return fetchFromBackend<AlertItem[]>(`${BASE_PATH}/alerts${query}`);
  },

  /**
   * 売上推移を取得する
   */
  getSalesTrend: (params?: { startDate?: string; endDate?: string }): Promise<SalesChartData> => {
    return fetchFromBackend<SalesChartData>(`${BASE_PATH}/sales-trend${buildDateQuery(params)}`);
  },
};
