'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Edit,
  Trash2,
  Plus,
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { formatRelativeTime, formatDateTime } from '@/lib/format';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { useDevices, useDeleteDevice } from '../hooks/use-devices';
import {
  DeviceType,
  DeviceTypeLabel,
  DeviceTypeIcon,
  DeviceStatus,
  DeviceStatusLabel,
  DeviceStatusColor,
  type Device,
  type DeviceQuery,
  type DevicePageResult,
} from '../types/device';

interface DeviceTableClientProps {
  initialData: DevicePageResult;
  initialParams: DeviceQuery;
}

export function DeviceTableClient({
  initialData,
  initialParams,
}: DeviceTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: stores = [] } = useStoreOptions();

  const [params, setParams] = useState<DeviceQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    deviceName: initialParams.deviceName || '',
    storeId: initialParams.storeId ? String(initialParams.storeId) : '',
    deviceType: initialParams.deviceType || '',
    status: initialParams.status || '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useDevices(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  const deleteDevice = useDeleteDevice();

  // Calculate device status summary
  const statusSummary = useMemo(() => {
    const list = displayData?.list || [];
    const total = displayData?.total || list.length;
    const online = list.filter((d) => d.status === DeviceStatus.ONLINE).length;
    const offline = list.filter(
      (d) => d.status === DeviceStatus.OFFLINE
    ).length;
    const maintenance = list.filter(
      (d) => d.status === DeviceStatus.MAINTENANCE
    ).length;

    // If we have paginated data, estimate based on page ratio
    if (displayData?.total && displayData.total > list.length) {
      const ratio = displayData.total / list.length;
      return {
        total: displayData.total,
        online: Math.round(online * ratio),
        disconnected: Math.round(offline * ratio),
        maintenance: Math.round(maintenance * ratio),
      };
    }

    return {
      total,
      online,
      disconnected: offline,
      maintenance,
    };
  }, [displayData]);

  const filterFields: FilterField[] = [
    {
      key: 'storeId',
      label: '店舗',
      type: 'select',
      options: [
        { value: '', label: 'すべての店舗' },
        ...stores.map((s) => ({ value: String(s.id), label: s.storeName })),
      ],
    },
    {
      key: 'deviceType',
      label: 'デバイス種別',
      type: 'select',
      options: [
        { value: '', label: 'すべての種別' },
        ...Object.entries(DeviceTypeLabel).map(([v, l]) => ({
          value: v,
          label: l,
        })),
      ],
    },
    {
      key: 'status',
      label: '状態',
      type: 'select',
      options: [
        { value: '', label: 'すべての状態' },
        ...Object.entries(DeviceStatusLabel).map(([v, l]) => ({
          value: v,
          label: l,
        })),
      ],
    },
    {
      key: 'deviceName',
      label: 'デバイス名',
      type: 'text',
      placeholder: 'キーワードを入力...',
      width: 'w-40',
    },
  ];

  const handleSearch = () => {
    const newParams: DeviceQuery = {
      ...params,
      pageNum: 1,
      deviceName: filterValues.deviceName || undefined,
      storeId: filterValues.storeId
        ? parseInt(filterValues.storeId, 10)
        : undefined,
      deviceType:
        (filterValues.deviceType as DeviceQuery['deviceType']) || undefined,
      status: (filterValues.status as DeviceQuery['status']) || undefined,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({
      deviceName: '',
      storeId: '',
      deviceType: '',
      status: '',
    });
    const newParams = { pageNum: 1, pageSize: params.pageSize };
    setParams(newParams);
    router.push(pathname);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);
    updateURL(newParams);
  };

  const updateURL = (params: DeviceQuery) => {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.pageNum));
    if (params.deviceName) urlParams.set('name', params.deviceName);
    if (params.storeId) urlParams.set('storeId', String(params.storeId));
    if (params.deviceType) urlParams.set('type', params.deviceType);
    if (params.status) urlParams.set('status', params.status);
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDevice.mutateAsync(deleteTarget.id);
      toast.success('デバイスを削除しました');
      setDeleteTarget(null);
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  const columns: Column<Device>[] = [
    {
      key: 'storeName',
      header: '店舗',
      width: '100px',
      sortable: true,
    },
    {
      key: 'deviceName',
      header: 'デバイス名',
      sortable: true,
      render: (_, row) => <span className="font-medium">{row.deviceName}</span>,
    },
    {
      key: 'deviceType',
      header: 'デバイス種別',
      width: '130px',
      sortable: true,
      render: (_, row) => {
        const Icon = DeviceTypeIcon[row.deviceType];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{DeviceTypeLabel[row.deviceType]}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: '状態',
      width: '110px',
      sortable: true,
      render: (_, row) => (
        <StatusBadge variant={DeviceStatusColor[row.status]}>
          {DeviceStatusLabel[row.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'lastHeartbeat',
      header: '最終通信',
      width: '120px',
      sortable: true,
      render: (_, row) => {
        if (!row.lastHeartbeat) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {formatRelativeTime(row.lastHeartbeat)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {formatDateTime(row.lastHeartbeat)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'deviceCode',
      header: 'デバイスコード',
      width: '130px',
      render: (_, row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.deviceCode}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '100px',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/devices/${row.id}/edit`);
            }}
            title="編集"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            title="削除"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <Button onClick={() => router.push('/devices/new')}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        }
      />

      {/* Table Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">登録デバイスリスト</h2>
        <span className="text-sm text-muted-foreground">
          表示中の件数: {displayData?.list?.length || 0} /{' '}
          {displayData?.total || 0}件
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="デバイスが見つかりません"
        pagination={{
          pageNum: params.pageNum,
          pageSize: params.pageSize,
          total: displayData?.total || 0,
          onPageChange: handlePageChange,
        }}
      />

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{statusSummary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-3">
                <Wifi className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold text-success">
                  {statusSummary.online}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-3">
                <WifiOff className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disconnected</p>
                <p className="text-2xl font-bold text-destructive">
                  {statusSummary.disconnected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-3">
                <Wrench className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-warning">
                  {statusSummary.maintenance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="デバイスを削除"
        description="この操作は取り消せません"
        confirmLabel="削除"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteDevice.isPending}
      >
        {deleteTarget && (
          <p className="text-sm">
            デバイス名:{' '}
            <span className="font-medium">{deleteTarget.deviceName}</span>
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
