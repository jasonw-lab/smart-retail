export interface KPIData {
  sales: {
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  outOfStockSKU: {
    value: number;
    label: string;
  };
  activeStores: {
    active: number;
    total: number;
  };
  suspendedAlerts: {
    value: number;
    requiresAction: boolean;
  };
  systemUptime: {
    value: number;
  };
  newCustomers: {
    value: number;
    change: number;
  };
  averageOrderValue: {
    value: number;
  };
  salesChart?: SalesChartData;
}

export type AlertType =
  | 'out_of_stock'
  | 'low_stock'
  | 'expiring'
  | 'expiry_soon'
  | 'high_stock'
  | 'system'
  | (string & {});

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  lotNumber?: string;
  timestamp: string;
  actionLabel?: string;
  actionLink?: string;
}

export type TimeRange = '7d' | '30d' | '1y';

export interface SalesDataPoint {
  date: string;
  sales: number;
  profit: number;
}

export type SalesChartData = Record<TimeRange, SalesDataPoint[]>;
