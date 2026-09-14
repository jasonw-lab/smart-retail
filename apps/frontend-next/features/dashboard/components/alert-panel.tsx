'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertItem } from '../types/dashboard';

interface AlertPanelProps {
  alerts: AlertItem[];
  className?: string;
}

export function AlertPanel({ alerts, className }: AlertPanelProps) {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const getAlertConfig = (type: string) => {
    const key = (type || '').toLowerCase();
    switch (key) {
      case 'out_of_stock':
        return {
          label: t('alerts.types.out_of_stock'),
          variant: 'destructive' as const,
          icon: Package,
        };
      case 'low_stock':
        return {
          label: t('alerts.types.low_stock'),
          variant: 'warning' as const,
          icon: AlertCircle,
        };
      case 'expiring':
      case 'expiry_soon':
        return {
          label: t('alerts.types.expiring'),
          variant: 'warning' as const,
          icon: Clock,
        };
      case 'high_stock':
        return {
          label: t('alerts.types.high_stock'),
          variant: 'warning' as const,
          icon: AlertCircle,
        };
      case 'system':
        return {
          label: t('alerts.types.system'),
          variant: 'info' as const,
          icon: AlertCircle,
        };
      default:
        return {
          label: t('alerts.types.default'),
          variant: 'info' as const,
          icon: AlertCircle,
        };
    }
  };

  const formatRelativeTime = (dateInput: Date | string): string => {
    let date: Date;
    if (typeof dateInput === 'string') {
      const parsed = new Date(dateInput.replace(' ', 'T'));
      date = isNaN(parsed.getTime()) ? new Date(dateInput) : parsed;
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('alerts.time.justNow');
    if (diffMins < 60) return t('alerts.time.minutesAgo', { mins: diffMins });
    if (diffHours < 24) return t('alerts.time.hoursAgo', { hours: diffHours });
    return t('alerts.time.daysAgo', { days: diffDays });
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{t('alerts.title')}</CardTitle>
        <Link
          href="/alerts"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {t('alerts.inventoryLink')}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{t('alerts.noAlerts')}</p>
        ) : (
          <>
            {alerts.map((alert) => {
              const config = getAlertConfig(alert.type);

              return (
                <div
                  key={alert.id}
                  data-testid={`alert-item-${alert.id}`}
                  onClick={() => router.push(alert.actionLink || '/alerts')}
                  className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer"
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
                      {t('alerts.lotNumber', { lotNumber: alert.lotNumber })}
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
                  {t('alerts.viewAll')}
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
export type { AlertItem, AlertType } from '../types/dashboard';
