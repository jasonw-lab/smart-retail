'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Bell,
  Wifi,
  Store,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useAlertSubscription } from '../hooks/use-alert-subscription';
import { useAlertStore } from '../store/alert-store';
import type { Alert, AlertPriority, AlertCategory } from '../types/alert';
import { AlertPriorityLabel, AlertPriorityColor } from '../types/alert';
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

const alertCategoryLabels: Record<AlertCategory, string> = {
  通信障害: '通信障害',
  冷蔵異常: '冷蔵異常',
  在庫異常: '在庫異常',
  決済異常: '決済異常',
  その他: 'その他',
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const severityColors = {
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-destructive',
};

// Mock data for demonstration
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'DEVICE_ERROR',
    category: '通信障害',
    message: '店舗: 新宿国際通り店, デバイス: レシートプリンタ (DEV-27-PTR-01)',
    deviceId: 'DEV-27-PTR-01',
    deviceName: 'レシートプリンタ',
    storeId: 1,
    storeName: '新宿国際通り店',
    severity: 'error',
    priority: 1,
    status: 'unread',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'DEVICE_ERROR',
    category: '通信障害',
    message: '店舗: 秋田駅前店, デバイス: 冷蔵センサー1号 (DEV-30-RFS-01)',
    deviceId: 'DEV-30-RFS-01',
    deviceName: '冷蔵センサー1号',
    storeId: 2,
    storeName: '秋田駅前店',
    severity: 'warning',
    priority: 1,
    status: 'unread',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'DEVICE_ERROR',
    category: '通信障害',
    message: '店舗: 新宿国際通り店, デバイス: ルーター (DEV-27-NET-01)',
    deviceId: 'DEV-27-NET-01',
    deviceName: 'ルーター',
    storeId: 1,
    storeName: '新宿国際通り店',
    severity: 'error',
    priority: 1,
    status: 'acknowledged',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    type: 'PAYMENT_ERROR',
    category: '決済異常',
    message: '店舗: 秋田駅前店, デバイス: 決済端末1号 (DEV-30-POS-01)',
    deviceId: 'DEV-30-POS-01',
    deviceName: '決済端末1号',
    storeId: 2,
    storeName: '秋田駅前店',
    severity: 'error',
    priority: 1,
    status: 'unread',
    read: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '5',
    type: 'DEVICE_ERROR',
    category: '通信障害',
    message: '店舗: 秋田駅前店, デバイス: ルーター (DEV-30-NET-01)',
    deviceId: 'DEV-30-NET-01',
    deviceName: 'ルーター',
    storeId: 2,
    storeName: '秋田駅前店',
    severity: 'warning',
    priority: 1,
    status: 'unread',
    read: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export function AlertListClient({ initialAlerts }: AlertListClientProps) {
  // STOMP connection
  const { isConnected } = useAlertSubscription();

  // Zustand store
  const realtimeAlerts = useAlertStore((state) => state.alerts);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const markAllAsRead = useAlertStore((state) => state.markAllAsRead);

  // State
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [filterValues, setFilterValues] = useState({
    priority: '',
    status: '',
    category: '',
    storeId: '',
  });

  // Merge initial and realtime alerts with mock data
  const allAlerts = useMemo(() => {
    const alertMap = new Map<string, Alert>();

    // Add mock alerts for demo
    for (const alert of mockAlerts) {
      alertMap.set(alert.id, alert);
    }
    for (const alert of initialAlerts) {
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initialAlerts, realtimeAlerts]);

  // Filter alerts by priority tab
  const filteredAlerts = useMemo(() => {
    let filtered = allAlerts;
    if (selectedPriority !== 'all') {
      const priority = parseInt(selectedPriority) as AlertPriority;
      filtered = filtered.filter((a) => a.priority === priority);
    }
    return filtered;
  }, [allAlerts, selectedPriority]);

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
      label: '優先度',
      type: 'select',
      options: [
        { value: '', label: 'すべて' },
        { value: '1', label: 'P1' },
        { value: '2', label: 'P2' },
        { value: '3', label: 'P3' },
        { value: '4', label: 'P4' },
      ],
    },
    {
      key: 'status',
      label: '状態',
      type: 'select',
      options: [
        { value: '', label: 'すべて' },
        { value: 'unread', label: '未対応' },
        { value: 'acknowledged', label: '対応中' },
        { value: 'resolved', label: '解決済み' },
      ],
    },
    {
      key: 'category',
      label: '種別',
      type: 'select',
      options: [
        { value: '', label: 'すべて' },
        { value: '通信障害', label: '通信障害' },
        { value: '冷蔵異常', label: '冷蔵異常' },
        { value: '在庫異常', label: '在庫異常' },
        { value: '決済異常', label: '決済異常' },
      ],
    },
    {
      key: 'storeId',
      label: '店舗',
      type: 'select',
      options: [
        { value: '', label: 'すべて' },
        { value: '1', label: '新宿国際通り店' },
        { value: '2', label: '秋田駅前店' },
        { value: '3', label: '銀座中央通り店' },
      ],
    },
  ];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  // Table columns
  const columns: Column<Alert>[] = [
    {
      key: 'checkbox',
      header: '',
      width: '40px',
      render: () => (
        <input type="checkbox" className="rounded border-gray-300" />
      ),
    },
    {
      key: 'priority',
      header: '優先度',
      width: '70px',
      render: (_, row) => (
        <Badge className={AlertPriorityColor[row.priority]}>
          {AlertPriorityLabel[row.priority]}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: '種別',
      width: '100px',
      render: (_, row) => (
        <span className="text-sm">
          {row.category || alertTypeLabels[row.type]}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状態',
      width: '80px',
      render: (_, row) => {
        const statusLabels = {
          unread: '未対応',
          acknowledged: '対応中',
          resolved: '解決済',
        };
        const statusColors = {
          unread: 'bg-destructive/10 text-destructive',
          acknowledged: 'bg-warning/10 text-warning',
          resolved: 'bg-success/10 text-success',
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[row.status]}`}
          >
            {statusLabels[row.status]}
          </span>
        );
      },
    },
    {
      key: 'message',
      header: '概要',
      render: (_, row) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium line-clamp-1">{row.message}</p>
          <p className="text-xs text-muted-foreground">{row.storeName}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: '検出日時',
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
  ];

  // Mock network stability data
  const networkStability = 94.2;

  // Mock incident stores
  const incidentStores = [
    { name: '新宿国際通り店', issues: 2 },
    { name: '秋田駅前店', issues: 3 },
    { name: '福岡新宿店', issues: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>/</span>
        <span>在庫一覧</span>
        <span>/</span>
        <span className="text-foreground">アラート一覧</span>
      </nav>

      {/* Priority Tabs */}
      <Tabs value={selectedPriority} onValueChange={setSelectedPriority}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">全て</TabsTrigger>
            <TabsTrigger value="1" className="gap-2">
              <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded">
                P1
              </span>
              <span>{priorityCounts[1]}</span>件
            </TabsTrigger>
            <TabsTrigger value="2" className="gap-2">
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                P2
              </span>
              <span>{priorityCounts[2]}</span>件
            </TabsTrigger>
            <TabsTrigger value="3" className="gap-2">
              <span className="bg-warning text-warning-foreground text-xs px-1.5 py-0.5 rounded">
                P3
              </span>
              <span>{priorityCounts[3]}</span>件
            </TabsTrigger>
            <TabsTrigger value="4" className="gap-2">
              <span className="bg-info text-info-foreground text-xs px-1.5 py-0.5 rounded">
                P4
              </span>
              <span>{priorityCounts[4]}</span>件
            </TabsTrigger>
          </TabsList>

          <p className="text-sm text-muted-foreground">
            この画面の監視データは約5分ごとに更新されます
          </p>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={setFilterValues}
            onSearch={() => {}}
            onReset={() =>
              setFilterValues({
                priority: '',
                status: '',
                category: '',
                storeId: '',
              })
            }
          />
        </div>

        <TabsContent value={selectedPriority} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredAlerts}
            getRowKey={(row) => row.id}
            emptyMessage="アラートはありません"
            pagination={{
              pageNum: 1,
              pageSize: 20,
              total: filteredAlerts.length,
              onPageChange: () => {},
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>表示中 1-20件 / 全件 20</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-success' : 'bg-destructive'
            )}
          />
          <span>{isConnected ? '接続中' : '切断'}</span>
        </div>
      </div>

      {/* Bottom Section: Network Stability & Incident Stores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Network Stability Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              ネットワーク安定性
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-success">
                {networkStability}%
              </span>
              <span className="text-sm text-muted-foreground">安定</span>
            </div>
            <Progress value={networkStability} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Incident Stores Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4" />
              障害対応店舗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidentStores.map((store) => (
                <div
                  key={store.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{store.name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {store.issues}件
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Alert Panel */}
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
              <Bell className="h-4 w-4" />
              リアルタイム監視状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                全ての拠点の監視システムは現在、緊急対応
                レベルに達しています。P1アラート発生時は
                迅速なアラーム通知が必要です。
              </p>
              <Button size="sm" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                通知設定の確認
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
