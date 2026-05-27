'use client';

import { useMemo } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlertSubscription } from '../hooks/use-alert-subscription';
import { useAlertStore } from '../store/alert-store';
import type { Alert } from '../types/alert';
import { cn } from '@/lib/utils';

interface AlertListClientProps {
  initialAlerts: Alert[];
}

const alertTypeLabels: Record<string, string> = {
  LOW_STOCK: '在庫切れ',
  EXPIRING: '期限切れ間近',
  OVERSTOCK: '在庫過多',
  DEVICE_ERROR: '通信断',
  PAYMENT_ERROR: '決済端末異常',
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const severityColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export function AlertListClient({ initialAlerts }: AlertListClientProps) {
  // STOMP接続・購読
  const { isConnected } = useAlertSubscription();

  // Zustandから最新のアラートを取得
  const realtimeAlerts = useAlertStore((state) => state.alerts);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const markAllAsRead = useAlertStore((state) => state.markAllAsRead);

  // 初期データとリアルタイムデータをマージ（重複排除）
  const allAlerts = useMemo(() => {
    const alertMap = new Map<string, Alert>();
    for (const alert of initialAlerts) {
      alertMap.set(alert.id, alert);
    }
    for (const alert of realtimeAlerts) {
      alertMap.set(alert.id, alert);
    }
    return Array.from(alertMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initialAlerts, realtimeAlerts]);

  const unreadCount = allAlerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? '接続中' : '切断'}
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              未読: {unreadCount}件
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            全て既読にする
          </Button>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {allAlerts.length === 0 && (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            アラートはありません
          </div>
        )}
        {allAlerts.map((alert) => {
          const Icon = severityIcons[alert.severity];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-4 rounded-md border p-4 transition-colors",
                alert.read ? "bg-muted/30" : "bg-background"
              )}
              onClick={() => !alert.read && markAsRead(alert.id)}
            >
              <Icon className={cn("mt-0.5 h-5 w-5", severityColors[alert.severity])} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {alertTypeLabels[alert.type] || alert.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString('ja-JP')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                {alert.productName && (
                  <p className="text-xs text-muted-foreground">
                    商品: {alert.productName}
                  </p>
                )}
              </div>
              {!alert.read && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
