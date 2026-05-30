// Server-compatible mock data for dashboard
// This file can be imported by both server and client components

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
}

export type AlertType = 'out_of_stock' | 'low_stock' | 'expiring' | 'system';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  lotNumber?: string;
  timestamp: Date;
  actionLabel?: string;
  actionLink?: string;
}

export function getMockKPIData(): KPIData {
  return {
    sales: {
      value: 107316,
      change: 8.8,
      changeType: 'increase',
    },
    outOfStockSKU: {
      value: 7,
      label: 'SKU',
    },
    activeStores: {
      active: 29,
      total: 30,
    },
    suspendedAlerts: {
      value: 218,
      requiresAction: true,
    },
    systemUptime: {
      value: 99.98,
    },
    newCustomers: {
      value: 1240,
      change: 12.5,
    },
    averageOrderValue: {
      value: 3480,
    },
  };
}

export function getMockAlerts(): AlertItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'out_of_stock',
      title: '在庫切れ',
      description: '商品の在庫がなくなりました',
      lotNumber: 'LOT-2026-0921-890',
      timestamp: new Date(now.getTime() - 30 * 60000),
      actionLabel: '在庫確認',
      actionLink: '/inventory',
    },
    {
      id: '2',
      type: 'low_stock',
      title: '在庫確認要',
      description: '在庫が少なくなっています',
      lotNumber: 'LOT-2026-0922-650',
      timestamp: new Date(now.getTime() - 2 * 60 * 60000),
      actionLabel: '在庫確認',
      actionLink: '/inventory',
    },
    {
      id: '3',
      type: 'out_of_stock',
      title: '在庫切れ',
      description: '商品の在庫がなくなりました',
      lotNumber: 'LOT-2026-0912-194',
      timestamp: new Date(now.getTime() - 5 * 60 * 60000),
      actionLabel: '在庫確認',
      actionLink: '/inventory',
    },
  ];
}
