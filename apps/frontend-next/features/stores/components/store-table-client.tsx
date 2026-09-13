'use client';

import { useState, useMemo } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Edit, Trash2, Plus, Boxes, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import { TESTIDS, testId } from '@/lib/testing/testids';
import { useStores, useDeleteStore } from '../hooks/use-stores';
import {
  StoreStatus,
  StoreStatusColor,
  type Store,
  type StoreQuery,
  type StorePageResult,
} from '../types/store';

interface StoreTableClientProps {
  initialData: StorePageResult;
  initialParams: StoreQuery;
}

export function StoreTableClient({ initialData, initialParams }: StoreTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('stores');
  const tCommon = useTranslations('common');

  const [params, setParams] = useState<StoreQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeName: initialParams.storeName || '',
    address: initialParams.address || '',
    status: initialParams.status || '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useStores(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  const deleteStore = useDeleteStore();

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: 'storeName',
        label: t('storeName'),
        type: 'text',
        placeholder: t('searchNamePlaceholder'),
        width: 'w-40',
      },
      {
        key: 'address',
        label: t('address'),
        type: 'text',
        placeholder: t('searchAddressPlaceholder'),
        width: 'w-40',
      },
      {
        key: 'status',
        label: t('status'),
        type: 'select',
        options: [
          { value: '', label: tCommon('all') },
          { value: StoreStatus.ACTIVE, label: t('statusActive') },
          { value: StoreStatus.MAINTENANCE, label: t('statusMaintenance') },
          { value: StoreStatus.INACTIVE, label: t('statusInactive') },
        ],
      },
    ],
    [t, tCommon]
  );

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
    window.history.replaceState(null, '', window.location.pathname);
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
      toast.success(t('deleteSuccess'));
      setDeleteTarget(null);
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const columns: Column<Store>[] = useMemo(
    () => [
      {
        key: 'storeCode',
        header: t('storeCode'),
        width: '120px',
      },
      {
        key: 'storeName',
        header: t('storeName'),
        sortable: true,
        render: (_, row) => <span className="font-medium">{row.storeName}</span>,
      },
      {
        key: 'address',
        header: t('address'),
        render: (_, row) => (
          <span className="text-muted-foreground truncate max-w-[200px] block">
            {row.address || '-'}
          </span>
        ),
      },
      {
        key: 'phone',
        header: t('phone'),
        width: '120px',
        render: (_, row) => <span className="text-muted-foreground">{row.phone || '-'}</span>,
      },
      {
        key: 'status',
        header: t('status'),
        width: '100px',
        sortable: true,
        render: (_, row) => {
          const statusLabel =
            row.status === StoreStatus.ACTIVE
              ? t('statusActive')
              : row.status === StoreStatus.MAINTENANCE
                ? t('statusMaintenance')
                : t('statusInactive');
          return <StatusBadge variant={StoreStatusColor[row.status]}>{statusLabel}</StatusBadge>;
        },
      },
      {
        key: 'businessHours',
        header: t('businessHours'),
        width: '100px',
        render: (_, row) => <span className="text-sm">{row.businessHours || '09:00-22:00'}</span>,
      },
      {
        key: 'manager',
        header: t('manager'),
        width: '100px',
        render: (_, row) => <span className="text-sm">{row.manager || '-'}</span>,
      },
      {
        key: 'todaySales',
        header: t('todaySales'),
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
        header: t('alerts'),
        width: '100px',
        align: 'center',
        render: (_, row) => {
          if (!row.alertCount) return <span className="text-muted-foreground">-</span>;
          const variant =
            row.highestAlertPriority === 1
              ? 'error'
              : row.highestAlertPriority === 2
                ? 'orange'
                : 'warning';
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
        header: t('actions'),
        width: '120px',
        align: 'center',
        render: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              data-testid={testId(TESTIDS.STORE_EDIT_BUTTON, row.id)}
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/stores/${row.id}/edit`);
              }}
              title={tCommon('edit')}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              data-testid={testId(TESTIDS.STORE_INVENTORY_BUTTON, row.id)}
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/inventory?storeId=${row.id}`);
              }}
              title={t('viewInventory')}
            >
              <Boxes className="h-4 w-4" />
            </Button>
            <Button
              data-testid={testId(TESTIDS.STORE_DELETE_BUTTON, row.id)}
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
              title={tCommon('delete')}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [t, tCommon, router]
  );

  return (
    <div data-testid={TESTIDS.STORE_PAGE} className="space-y-4">
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <Button data-testid={TESTIDS.STORE_NEW_BUTTON} onClick={() => router.push('/stores/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newStore')}
          </Button>
        }
      />

      <DataTable
        dataTestId={TESTIDS.STORE_TABLE}
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={t('emptyMessage')}
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
        title={t('deleteConfirm')}
        description={t('deleteConfirmDescription')}
        confirmLabel={tCommon('delete')}
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteStore.isPending}
      >
        {deleteTarget && (
          <p className="text-sm">
            {t('storeName')}: <span className="font-medium">{deleteTarget.storeName}</span>
          </p>
        )}
      </ConfirmDialog>

      {isError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t('fetchError')}
        </div>
      )}
    </div>
  );
}
