'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertItem, AlertType } from '../lib/mock-data';

interface AlertPanelProps {
  alerts: AlertItem[];
  className?: string;
}

const alertTypeConfig: Record<
  AlertType,
  {
    label: string;
    variant: 'destructive' | 'warning' | 'info' | 'default';
    icon: typeof AlertCircle;
  }
> = {
  out_of_stock: {
    label: '在庫切れ',
    variant: 'destructive',
    icon: Package,
  },
  low_stock: {
    label: '在庫確認要',
    variant: 'warning',
    icon: AlertCircle,
  },
  expiring: {
    label: '賞味期限',
    variant: 'warning',
    icon: Clock,
  },
  system: {
    label: 'システム',
    variant: 'info',
    icon: AlertCircle,
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  return `${diffDays}日前`;
}

export function AlertPanel({ alerts, className }: AlertPanelProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">アラート情報</CardTitle>
        <Link
          href="/alerts"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          在庫管理
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            アラートはありません
          </p>
        ) : (
          <>
            {alerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  {alert.lotNumber && (
                    <p className="text-xs text-gray-500">
                      ロット番号: {alert.lotNumber}
                    </p>
                  )}
                  {alert.actionLabel && (
                    <Link
                      href={alert.actionLink || '#'}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      {alert.actionLabel}
                    </Link>
                  )}
                </div>
              );
            })}
            <div className="pt-2">
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="w-full">
                  すべてのアラートを表示
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export types for convenience
export type { AlertItem, AlertType } from '../lib/mock-data';
