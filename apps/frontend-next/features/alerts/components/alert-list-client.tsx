'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Bell, Wifi, Store, RefreshCw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useAlertSubscription } from '../hooks/use-alert-subscription';
import { useAlertStore } from '../store/alert-store';
import { useAlerts, useUpdateAlertStatus, useDeleteAlert } from '../hooks/use-alerts';
import type { Alert, AlertMonitoringSummary, AlertPriority, AlertQuery } from '../types/alert';
import {
  AlertPriorityLabel,
  AlertPriorityColor,
  DEFAULT_PRIORITY_LABEL,
  DEFAULT_PRIORITY_COLOR,
  DEFAULT_ALERT_STATUS_COLOR,
} from '../types/alert';
import { cn } from '@/lib/utils';
import { TESTIDS } from '@/lib/testing/testids';

interface AlertListClientProps {
  initialAlerts: Alert[];
  monitoringSummary?: AlertMonitoringSummary;
}

export function AlertListClient({ initialAlerts, monitoringSummary }: AlertListClientProps) {
  const t = useTranslations('alerts');
  const tc = useTranslations('common');

  const alertTypeLabels: Record<string, string> = {
    LOW_STOCK: t('typeLowStock'),
    EXPIRING: t('typeExpiring'),
    OVERSTOCK: t('typeOverstock'),
    DEVICE_ERROR: t('typeDeviceError'),
    PAYMENT_ERROR: t('typePaymentError'),
  };

  // STOMP connection
  const { isConnected } = useAlertSubscription();

  // Zustand store
  const realtimeAlerts = useAlertStore((state) => state.alerts);
  const updateAlertStatusInStore = useAlertStore((state) => state.updateAlertStatus);
  const removeAlertFromStore = useAlertStore((state) => state.removeAlert);

  // REST API
  const [query, setQuery] = useState<AlertQuery>({
    pageNum: 1,
    pageSize: 1000,
    storeId: '',
  });
  const { data: alertPage, isLoading } = useAlerts(query, {
    placeholderData: { list: initialAlerts, total: initialAlerts.length },
  });
  const updateStatus = useUpdateAlertStatus();
  const deleteAlert = useDeleteAlert();

  // Local UI state
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [filterValues, setFilterValues] = useState({
    priority: '',
    status: '',
    category: '',
    storeId: '',
  });
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 店舗フィルタ変更時は REST 再取得
  useEffect(() => {
    setQuery((prev) => ({ ...prev, storeId: filterValues.storeId }));
  }, [filterValues.storeId]);

  // フィルタ・ページサイズ変更時はページ番号をリセット
  useEffect(() => {
    setPageNum(1);
  }, [selectedPriority, filterValues, pageSize]);

  // Merge initial, REST and realtime alerts (realtime wins on duplicate id)
  const allAlerts = useMemo(() => {
    const alertMap = new Map<string, Alert>();

    for (const alert of initialAlerts) {
      alertMap.set(alert.id, {
        ...alert,
        priority: alert.priority || 2,
        status: alert.status || 'unread',
      });
    }
    for (const alert of alertPage?.list ?? []) {
      alertMap.set(alert.id, {
        ...alert,
        priority: alert.priority || 2,
        status: alert.status || 'unread',
      });
    }
    for (const alert of realtimeAlerts) {
      alertMap.set(alert.id, {
        ...alert,
        priority: alert.priority || 2,
        status: alert.status || 'unread',
      });
    }
    return Array.from(alertMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initialAlerts, alertPage, realtimeAlerts]);

  // Filter alerts by priority tab and filter bar
  const filteredAlerts = useMemo(() => {
    let filtered = allAlerts;
    if (selectedPriority !== 'all') {
      const priority = parseInt(selectedPriority) as AlertPriority;
      filtered = filtered.filter((a) => a.priority === priority);
    }
    if (filterValues.priority) {
      const priority = parseInt(filterValues.priority) as AlertPriority;
      filtered = filtered.filter((a) => a.priority === priority);
    }
    if (filterValues.status) {
      filtered = filtered.filter((a) => a.status === filterValues.status);
    }
    if (filterValues.category) {
      filtered = filtered.filter((a) => a.category === filterValues.category);
    }
    if (filterValues.storeId) {
      filtered = filtered.filter((a) => String(a.storeId) === filterValues.storeId);
    }
    return filtered;
  }, [allAlerts, selectedPriority, filterValues]);

  // Client-side pagination
  const total = filteredAlerts.length;
  const paginatedAlerts = useMemo(() => {
    const start = (pageNum - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, pageNum, pageSize]);

  // Count by priority
  const priorityCounts = useMemo(() => {
    return {
      1: allAlerts.filter((a) => a.priority === 1).length,
      2: allAlerts.filter((a) => a.priority === 2).length,
      3: allAlerts.filter((a) => a.priority === 3).length,
      4: allAlerts.filter((a) => a.priority === 4).length,
    };
  }, [allAlerts]);

  const unreadCount = allAlerts.filter((a) => !a.read).length;

  // Filter fields
  const filterFields: FilterField[] = [
    {
      key: 'priority',
      label: t('filterPriority'),
      testId: TESTIDS.ALERT_FILTER_PRIORITY,
      type: 'select',
      options: [
        { value: '', label: t('filterAll') },
        { value: '1', label: 'P1' },
        { value: '2', label: 'P2' },
        { value: '3', label: 'P3' },
        { value: '4', label: 'P4' },
      ],
    },
    {
      key: 'status',
      label: t('filterStatus'),
      testId: TESTIDS.ALERT_FILTER_STATUS,
      type: 'select',
      options: [
        { value: '', label: t('filterAll') },
        { value: 'unread', label: t('statusUnread') },
        { value: 'acknowledged', label: t('statusAcknowledged') },
        { value: 'resolved', label: t('statusResolved') },
      ],
    },
    {
      key: 'category',
      label: t('filterCategory'),
      testId: TESTIDS.ALERT_FILTER_CATEGORY,
      type: 'select',
      options: [
        { value: '', label: t('filterAll') },
        { value: '通信障害', label: t('categoryCommunication') },
        { value: '冷蔵異常', label: t('categoryRefrigerator') },
        { value: '在庫異常', label: t('categoryInventory') },
        { value: '決済異常', label: t('categoryPayment') },
      ],
    },
    {
      key: 'storeId',
      label: t('filterStore'),
      testId: TESTIDS.ALERT_FILTER_STORE,
      type: 'select',
      options: [
        { value: '', label: t('filterAll') },
        { value: '1', label: '新宿国際通り店' },
        { value: '2', label: '秋田駅前店' },
        { value: '3', label: '銀座中央通り店' },
      ],
    },
  ];

  const handleToggleRead = (alert: Alert) => {
    const nextStatus = alert.status === 'unread' ? 'acknowledged' : 'unread';
    updateStatus.mutate(
      { id: alert.id, data: { status: nextStatus } },
      {
        onSuccess: () => {
          updateAlertStatusInStore(alert.id, nextStatus);
          toast.success(t('statusUpdateSuccess'));
        },
        onError: () => {
          toast.error(t('statusUpdateFailed'));
        },
      }
    );
  };

  const handleDelete = (alert: Alert) => {
    if (!window.confirm(t('deleteConfirmMessage'))) return;

    deleteAlert.mutate(alert.id, {
      onSuccess: () => {
        removeAlertFromStore(alert.id);
        toast.success(t('deleteSuccess'));
      },
      onError: () => {
        toast.error(t('deleteFailed'));
      },
    });
  };

  // Table columns
  const columns: Column<Alert>[] = [
    {
      key: 'checkbox',
      header: '',
      width: '40px',
      render: () => <input type="checkbox" className="rounded border-gray-300" />,
    },
    {
      key: 'priority',
      header: t('columnPriority'),
      width: '70px',
      render: (_, row) => (
        <Badge className={AlertPriorityColor[row.priority] ?? DEFAULT_PRIORITY_COLOR}>
          {AlertPriorityLabel[row.priority] ?? DEFAULT_PRIORITY_LABEL}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: t('columnCategory'),
      width: '100px',
      render: (_, row) => (
        <span className="text-sm">
          {row.category || (alertTypeLabels[row.type] ?? t('typeOther'))}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('columnStatus'),
      width: '80px',
      render: (_, row) => {
        const statusLabels: Record<string, string> = {
          unread: t('statusUnread'),
          acknowledged: t('statusAcknowledged'),
          resolved: t('statusResolved'),
        };
        const statusColors: Record<string, string> = {
          unread: 'bg-destructive/10 text-destructive',
          acknowledged: 'bg-warning/10 text-warning',
          resolved: 'bg-success/10 text-success',
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              statusColors[row.status] ?? DEFAULT_ALERT_STATUS_COLOR
            }`}
          >
            {statusLabels[row.status] ?? t('statusUnknown')}
          </span>
        );
      },
    },
    {
      key: 'message',
      header: t('columnSummary'),
      render: (_, row) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium line-clamp-1">{row.message}</p>
          <p className="text-xs text-muted-foreground">{row.storeName}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('columnDetectedAt'),
      width: '100px',
      render: (_, row) => (
        <div className="text-sm text-muted-foreground">
          <p>
            {new Date(row.createdAt).toLocaleDateString('ja-JP', {
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
          <p>
            {new Date(row.createdAt).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('columnActions'),
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            data-testid={`alert-toggle-read-${row.id}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={row.read ? t('markAsUnread') : t('markAsRead')}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRead(row);
            }}
            disabled={updateStatus.isPending}
          >
            {row.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            data-testid={`alert-delete-${row.id}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={tc('delete')}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            disabled={deleteAlert.isPending}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const derivedIncidentStores = Array.from(
    allAlerts.reduce((counts, alert) => {
      if (!alert.storeName) return counts;
      counts.set(alert.storeName, (counts.get(alert.storeName) || 0) + 1);
      return counts;
    }, new Map<string, number>())
  )
    .map(([name, issues]) => ({ name, issues }))
    .sort((a, b) => b.issues - a.issues)
    .slice(0, 5);

  const incidentStores = monitoringSummary?.incidentStores?.length
    ? monitoringSummary.incidentStores
    : derivedIncidentStores;
  const networkStability =
    typeof monitoringSummary?.networkStability === 'number'
      ? `${monitoringSummary.networkStability.toFixed(1)}%`
      : undefined;

  const startItem = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const endItem = Math.min(pageNum * pageSize, total);

  return (
    <div data-testid={TESTIDS.ALERT_PAGE} className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>{t('breadcrumbDashboard')}</span>
        <span>/</span>
        <span>{t('breadcrumbInventory')}</span>
        <span>/</span>
        <span className="text-foreground">{t('breadcrumbAlerts')}</span>
      </nav>

      {/* Priority Tabs */}
      <Tabs value={selectedPriority} onValueChange={setSelectedPriority}>
        <div className="flex items-center justify-between">
          <TabsList data-testid={TESTIDS.ALERT_PRIORITY_TABS}>
            <TabsTrigger data-testid={TESTIDS.ALERT_TAB_ALL} value="all">
              {t('tabAll')}
            </TabsTrigger>
            <TabsTrigger data-testid={TESTIDS.ALERT_TAB_P1} value="1" className="gap-2">
              <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded">
                P1
              </span>
              <span>{priorityCounts[1] ?? 0}</span>{t('itemsCount')}
            </TabsTrigger>
            <TabsTrigger data-testid={TESTIDS.ALERT_TAB_P2} value="2" className="gap-2">
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">P2</span>
              <span>{priorityCounts[2] ?? 0}</span>{t('itemsCount')}
            </TabsTrigger>
            <TabsTrigger data-testid={TESTIDS.ALERT_TAB_P3} value="3" className="gap-2">
              <span className="bg-warning text-warning-foreground text-xs px-1.5 py-0.5 rounded">
                P3
              </span>
              <span>{priorityCounts[3] ?? 0}</span>{t('itemsCount')}
            </TabsTrigger>
            <TabsTrigger data-testid={TESTIDS.ALERT_TAB_P4} value="4" className="gap-2">
              <span className="bg-info text-info-foreground text-xs px-1.5 py-0.5 rounded">P4</span>
              <span>{priorityCounts[4] ?? 0}</span>{t('itemsCount')}
            </TabsTrigger>
          </TabsList>

          <p className="text-sm text-muted-foreground">
            {t('monitoringNotice')}
          </p>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={setFilterValues}
            onSearch={() => setPageNum(1)}
            onReset={() => {
              setSelectedPriority('all');
              setFilterValues({
                priority: '',
                status: '',
                category: '',
                storeId: '',
              });
              setPageNum(1);
            }}
          />
        </div>

        <TabsContent value={selectedPriority} className="mt-4">
          <DataTable
            dataTestId={TESTIDS.ALERT_TABLE}
            getRowTestId={(row) => `${TESTIDS.ALERT_TABLE_ROW}-${row.id}`}
            columns={columns}
            data={paginatedAlerts}
            isLoading={isLoading}
            getRowKey={(row) => row.id}
            emptyMessage={t('emptyMessage')}
            pagination={{
              pageNum,
              pageSize,
              total,
              onPageChange: setPageNum,
              onPageSizeChange: setPageSize,
              pageSizeOptions: [10, 20, 50, 100],
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t('showingCount', { start: startItem, end: endItem, total })}
        </span>
        <div data-testid={TESTIDS.ALERT_CONNECTION_STATUS} className="flex items-center gap-2">
          <span
            className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-success' : 'bg-destructive')}
          />
          <span>{isConnected ? t('connectionConnected') : t('connectionDisconnected')}</span>
        </div>
      </div>

      {/* Bottom Section: Network Stability & Incident Stores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Network Stability Card */}
        <Card data-testid={TESTIDS.ALERT_NETWORK_STABILITY}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {t('networkStability')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-3xl font-bold',
                  networkStability ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {networkStability || '-'}
              </span>
              <span className="text-sm text-muted-foreground">
                {networkStability ? t('recent5Min') : t('networkNotConnected')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Incident Stores Card */}
        <Card data-testid={TESTIDS.ALERT_INCIDENT_STORES}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4" />
              {t('incidentStores')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidentStores.length > 0 ? (
                incidentStores.map((store) => (
                  <div key={store.name} className="flex items-center justify-between text-sm">
                    <span>{store.name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {store.issues}{t('itemsCount')}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('noIncidentStores')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Alert Panel */}
        <Card data-testid={TESTIDS.ALERT_REALTIME_CARD} className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
              <Bell className="h-4 w-4" />
              {t('realtimeMonitoring')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                {isConnected
                  ? t('realtimeConnected', { count: unreadCount })
                  : t('realtimeDisconnected')}
              </p>
              <Button
                data-testid={TESTIDS.ALERT_NOTIFICATION_SETTINGS}
                size="sm"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('checkNotificationSettings')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
