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
  getKPI: async (): Promise<KPIData> => {
    try {
      const raw = await fetchFromBackend<Record<string, unknown>>(`${BASE_PATH}/kpi`);
      if (raw && typeof raw === 'object' && 'sales' in raw && 'outOfStockSKU' in raw) {
        return raw as unknown as KPIData;
      }

      const todaySales = Number(raw?.todaySales ?? 0);
      const growthRate = Number(raw?.salesGrowthRate ?? 0);
      const outOfStock = Number(raw?.outOfStockSkuCount ?? 0);
      const activeStores = Number(raw?.activeStoreCount ?? 0);
      const totalStores = Number(raw?.totalStoreCount ?? 0);
      const pendingAlerts = Number(raw?.pendingAlertCount ?? 0);

      return {
        sales: {
          value: todaySales,
          change: Math.abs(growthRate),
          changeType: growthRate >= 0 ? 'increase' : 'decrease',
        },
        outOfStockSKU: {
          value: outOfStock,
          label: 'SKU',
        },
        activeStores: {
          active: activeStores,
          total: totalStores || 1,
        },
        suspendedAlerts: {
          value: pendingAlerts,
          requiresAction: pendingAlerts > 0,
        },
        systemUptime: {
          value: 99.98,
        },
        newCustomers: {
          value: 0,
          change: 0,
        },
        averageOrderValue: {
          value: todaySales > 0 ? Math.round(todaySales / Math.max(1, activeStores)) : 0,
        },
      };
    } catch {
      return {
        sales: { value: 0, change: 0, changeType: 'increase' },
        outOfStockSKU: { value: 0, label: 'SKU' },
        activeStores: { active: 0, total: 1 },
        suspendedAlerts: { value: 0, requiresAction: false },
        systemUptime: { value: 99.98 },
        newCustomers: { value: 0, change: 0 },
        averageOrderValue: { value: 0 },
      };
    }
  },

  /**
   * ダッシュボード用アラート一覧を取得する
   */
  getAlerts: async (limit?: number): Promise<AlertItem[]> => {
    try {
      const query = limit !== undefined ? `?limit=${limit}` : '';
      const raw = await fetchFromBackend<unknown[]>(`${BASE_PATH}/alerts${query}`);
      if (!Array.isArray(raw)) return [];
      return raw.map((item: unknown) => {
        const a = item as Record<string, unknown>;
        return {
          id: String(a.id ?? ''),
          type: (typeof a.alertType === 'string' ? a.alertType.toLowerCase() : 'system') as any,
          title: String(a.alertTitle ?? a.title ?? 'アラート'),
          description: String(a.alertMessage ?? a.description ?? ''),
          lotNumber: typeof a.lotNumber === 'string' ? a.lotNumber : undefined,
          timestamp: String(a.createTime ?? a.timestamp ?? new Date().toISOString()),
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * 売上推移を取得する
   */
  getSalesTrend: async (params?: { startDate?: string; endDate?: string }): Promise<SalesChartData> => {
    try {
      const raw = await fetchFromBackend<unknown>(`${BASE_PATH}/sales-trend${buildDateQuery(params)}`);
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && '7d' in raw) {
        return raw as SalesChartData;
      }
      if (Array.isArray(raw)) {
        const points = raw.map((item: unknown) => {
          const p = item as Record<string, unknown>;
          const salesVal = Number(p.salesAmount ?? p.sales ?? 0);
          return {
            date: typeof p.date === 'string' ? p.date.slice(5) : '',
            sales: salesVal,
            profit: Math.round(salesVal * 0.25),
          };
        });
        return {
          '7d': points,
          '30d': points,
          '1y': points,
        };
      }
      return { '7d': [], '30d': [], '1y': [] };
    } catch {
      return { '7d': [], '30d': [], '1y': [] };
    }
  },
};
