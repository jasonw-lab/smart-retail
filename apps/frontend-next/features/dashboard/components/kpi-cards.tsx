'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Activity,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPIData } from '../lib/mock-data';

interface KPICardsProps {
  data: KPIData;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// 上段4カード
export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 売上高 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            売上高
          </CardTitle>
          <Badge variant="default" className="text-xs">
            本日
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.sales.value)}
          </div>
          <div
            className={cn(
              'flex items-center text-xs mt-1',
              data.sales.changeType === 'increase'
                ? 'text-emerald-600'
                : 'text-red-600'
            )}
          >
            {data.sales.changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {formatPercent(data.sales.change)}
          </div>
        </CardContent>
      </Card>

      {/* 在庫切れSKU */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            在庫切れSKU
          </CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.outOfStockSKU.value}{' '}
            <span className="text-sm font-normal text-gray-500">
              {data.outOfStockSKU.label}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 稼働店舗 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            稼働店舗
          </CardTitle>
          <Badge variant="success" className="text-xs">
            営業中
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.activeStores.active}
            <span className="text-sm font-normal text-gray-500">
              /{data.activeStores.total}店舗
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 休業中アラート */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            休業中アラート
          </CardTitle>
          {data.suspendedAlerts.requiresAction && (
            <Badge variant="warning" className="text-xs">
              要対応
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {data.suspendedAlerts.value}
            {data.suspendedAlerts.requiresAction && (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 下段3カード (グラフ下に配置)
export function KPICardsBottom({ data }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* システム稼働率 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            システム稼働率
          </CardTitle>
          <Activity className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {data.systemUptime.value.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      {/* 新規顧客 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            新規顧客
          </CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{data.newCustomers.value.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* 平均客単価 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            平均客単価
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.averageOrderValue.value)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Re-export type for convenience
export type { KPIData } from '../lib/mock-data';
