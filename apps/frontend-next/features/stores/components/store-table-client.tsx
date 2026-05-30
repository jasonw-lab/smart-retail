'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Edit, Trash2, Plus, Boxes, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import { useStores, useDeleteStore } from '../hooks/use-stores';
import {
  StoreStatus,
  StoreStatusLabel,
  StoreStatusColor,
  type Store,
  type StoreQuery,
  type StorePageResult,
} from '../types/store';

interface StoreTableClientProps {
  initialData: StorePageResult;
  initialParams: StoreQuery;
}

const filterFields: FilterField[] = [
  {
    key: 'storeName',
    label: '店舗名',
    type: 'text',
    placeholder: '店舗名を入力...',
    width: 'w-40',
  },
  {
    key: 'address',
    label: '住所',
    type: 'text',
    placeholder: '住所を入力...',
    width: 'w-40',
  },
  {
    key: 'status',
    label: 'ステータス',
    type: 'select',
    options: [
      { value: '', label: 'すべて' },
      { value: StoreStatus.ACTIVE, label: StoreStatusLabel.ACTIVE },
      { value: StoreStatus.MAINTENANCE, label: StoreStatusLabel.MAINTENANCE },
      { value: StoreStatus.INACTIVE, label: StoreStatusLabel.INACTIVE },
    ],
  },
];

export function StoreTableClient({
  initialData,
  initialParams,
}: StoreTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<StoreQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeName: initialParams.storeName || '',
    address: initialParams.address || '',
    status: initialParams.status || '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);

  const { data = initialData, isLoading, isError } = useStores(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  const deleteStore = useDeleteStore();

  const handleSearch = () => {
    const newParams = {
      ...params,
      pageNum: 1,
      storeName: filterValues.storeName || undefined,
      address: filterValues.address || undefined,
      status: (filterValues.status as StoreQuery['status']) || undefined,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({ storeName: '', address: '', status: '' });
    const newParams = { pageNum: 1, pageSize: params.pageSize };
    setParams(newParams);
    router.push(pathname);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);
    updateURL(newParams);
  };

  const updateURL = (params: StoreQuery) => {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.pageNum));
    if (params.storeName) urlParams.set('name', params.storeName);
    if (params.address) urlParams.set('address', params.address);
    if (params.status) urlParams.set('status', params.status);
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStore.mutateAsync(deleteTarget.id);
      toast.success('店舗を削除しました');
      setDeleteTarget(null);
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  const columns: Column<Store>[] = [
    {
      key: 'storeCode',
      header: '店舗コード',
      width: '120px',
    },
    {
      key: 'storeName',
      header: '店舗名',
      sortable: true,
      render: (_, row) => (
        <span className="font-medium">{row.storeName}</span>
      ),
    },
    {
      key: 'address',
      header: '住所',
      render: (_, row) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">
          {row.address || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: '電話番号',
      width: '120px',
      render: (_, row) => (
        <span className="text-muted-foreground">{row.phone || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'ステータス',
      width: '100px',
      sortable: true,
      render: (_, row) => (
        <StatusBadge variant={StoreStatusColor[row.status]}>
          {StoreStatusLabel[row.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'businessHours',
      header: '営業時間',
      width: '100px',
      render: (_, row) => (
        <span className="text-sm">{row.businessHours || '09:00-22:00'}</span>
      ),
    },
    {
      key: 'manager',
      header: '担当者',
      width: '100px',
      render: (_, row) => (
        <span className="text-sm">{row.manager || '-'}</span>
      ),
    },
    {
      key: 'todaySales',
      header: '本日売上',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (_, row) => (
        <span className={row.status === StoreStatus.ACTIVE ? '' : 'text-muted-foreground'}>
          {row.status === StoreStatus.ACTIVE && row.todaySales != null
            ? formatCurrency(row.todaySales)
            : '-'}
        </span>
      ),
    },
    {
      key: 'alertCount',
      header: 'アラート',
      width: '100px',
      align: 'center',
      render: (_, row) => {
        if (!row.alertCount) return <span className="text-muted-foreground">-</span>;
        const variant = row.highestAlertPriority === 1 ? 'error' :
                       row.highestAlertPriority === 2 ? 'orange' : 'warning';
        return (
          <StatusBadge variant={variant}>
            <AlertTriangle className="h-3 w-3" />
            {row.alertCount}
          </StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      header: '操作',
      width: '120px',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/stores/${row.id}/edit`);
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
              router.push(`/inventory?storeId=${row.id}`);
            }}
            title="在庫一覧"
          >
            <Boxes className="h-4 w-4" />
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
    <div className="space-y-4">
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <Button onClick={() => router.push('/stores/new')}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="店舗が見つかりません"
        pagination={{
          pageNum: params.pageNum,
          pageSize: params.pageSize,
          total: displayData?.total || 0,
          onPageChange: handlePageChange,
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="店舗を削除"
        description="この操作は取り消せません"
        confirmLabel="削除"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteStore.isPending}
      >
        {deleteTarget && (
          <p className="text-sm">
            店舗名: <span className="font-medium">{deleteTarget.storeName}</span>
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
