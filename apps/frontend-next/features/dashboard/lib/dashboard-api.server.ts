import { fetchFromBackend } from '@/lib/api/server';
import type { KPIData, AlertItem, AlertType, SalesChartData } from '../types/dashboard';

const BASE_PATH = 'retail/dashboard';

function buildDateQuery(params?: { startDate?: string; endDate?: string }): string {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function normalizeAlertType(rawType: unknown): AlertType {
  if (typeof rawType !== 'string') return 'system';
  const lower = rawType.toLowerCase();
  if (lower === 'out_of_stock') return 'out_of_stock';
  if (lower === 'low_stock') return 'low_stock';
  if (lower === 'expiry_soon' || lower === 'expiring') return 'expiring';
  if (lower === 'high_stock') return 'high_stock';
  return lower as AlertType;
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
          type: normalizeAlertType(a.alertType),
          title: String(a.alertTitle ?? a.title ?? a.message ?? 'アラート'),
          description: String(a.alertMessage ?? a.description ?? a.message ?? ''),
          lotNumber: typeof a.lotNumber === 'string' ? a.lotNumber : undefined,
          timestamp: String(
            a.createTime ?? a.detectedAt ?? a.timestamp ?? new Date().toISOString()
          ),
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * 売上推移を取得する
   */
  getSalesTrend: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SalesChartData> => {
    const parsePoints = (raw: unknown) => {
      if (!Array.isArray(raw)) return [];
      return raw.map((item: unknown) => {
        const p = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const salesVal = Number(p.salesAmount ?? p.sales ?? 0);
        const rawDate = typeof p.date === 'string' ? p.date : '';
        let formattedDate = rawDate;
        if (rawDate.includes('-') && rawDate.length === 10) {
          formattedDate = rawDate.slice(5);
        }
        return {
          date: formattedDate,
          sales: salesVal,
          profit: Math.round(salesVal * 0.25),
        };
      });
    };

    try {
      if (params?.startDate || params?.endDate) {
        const raw = await fetchFromBackend<unknown>(
          `${BASE_PATH}/sales-trend${buildDateQuery(params)}`
        );
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && '7d' in raw) {
          return raw as SalesChartData;
        }
        const points = parsePoints(raw);
        return { '7d': points, '30d': points, '1y': points };
      }

      // ダッシュボード初期表示：7d, 30d, 1y を並列取得
      const today = new Date();
      const formatDate = (d: Date) => d.toISOString().slice(0, 10);
      const endDate = formatDate(today);

      const d7 = new Date(today);
      d7.setDate(d7.getDate() - 6);
      const start7d = formatDate(d7);

      const d30 = new Date(today);
      d30.setDate(d30.getDate() - 29);
      const start30d = formatDate(d30);

      const [res7d, res30d, res1y] = await Promise.all([
        fetchFromBackend<unknown>(
          `${BASE_PATH}/sales-trend?interval=day&startDate=${start7d}&endDate=${endDate}`
        ).catch(() => null),
        fetchFromBackend<unknown>(
          `${BASE_PATH}/sales-trend?interval=day&startDate=${start30d}&endDate=${endDate}`
        ).catch(() => null),
        fetchFromBackend<unknown>(
          `${BASE_PATH}/sales-trend?interval=month&startDate=2026-01-01&endDate=2026-12-31`
        ).catch(() => null),
      ]);

      if (res7d && typeof res7d === 'object' && !Array.isArray(res7d) && '7d' in res7d) {
        return res7d as SalesChartData;
      }

      const points7d = parsePoints(res7d);
      const points30d = parsePoints(res30d);
      const points1y = parsePoints(res1y);

      return {
        '7d': points7d.length ? points7d : (points1y.slice(-7) ?? []),
        '30d': points30d.length ? points30d : points1y,
        '1y': points1y.length ? points1y : points7d,
      };
    } catch {
      return { '7d': [], '30d': [], '1y': [] };
    }
  },
};
