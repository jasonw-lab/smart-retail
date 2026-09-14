'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  ChevronRight,
  ChevronDown,
  Package,
  Trash2,
  Download,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { formatDate, formatDateTime } from '@/lib/format';
import { TESTIDS, testId } from '@/lib/testing/testids';
import { toast } from 'sonner';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { useInventory } from '../hooks/use-inventory';
import { ReplenishDialog } from './replenish-dialog';
import { DisposeDialog } from './dispose-dialog';
import { HistoryDialog } from './history-dialog';
import {
  InventoryStatus,
  InventoryStatusColor,
  type Inventory,
  type InventoryLot,
  type InventoryQuery,
  type InventoryPageResult,
  type InventoryStatusType,
} from '../types/inventory';

interface InventoryTableClientProps {
  initialData: InventoryPageResult;
  initialParams: InventoryQuery;
}

export function InventoryTableClient({ initialData, initialParams }: InventoryTableClientProps) {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const inventoryStatusLabels: Record<InventoryStatusType, string> = {
    [InventoryStatus.NORMAL]: t('statusNormal'),
    [InventoryStatus.OUT_OF_STOCK]: t('statusOut'),
    [InventoryStatus.OVERSTOCK]: t('statusOverstock'),
    [InventoryStatus.EXPIRING]: t('statusExpiring'),
    [InventoryStatus.EXPIRED]: t('statusExpired'),
  };

  const { data: stores = [] } = useStoreOptions();

  const [params, setParams] = useState<InventoryQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeId: initialParams.storeId ? String(initialParams.storeId) : '',
    productName: initialParams.productName || '',
    status: initialParams.status || '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Dialogs
  const [replenishTarget, setReplenishTarget] = useState<Inventory | null>(null);
  const [disposeTarget, setDisposeTarget] = useState<{
    inventory: Inventory;
    lot: InventoryLot;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Inventory | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useInventory(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  // Calculate inventory summary
  const summary = useMemo(() => {
    const list = displayData?.list || [];
    const totalQuantity = list.reduce((sum, item) => sum + item.totalQuantity, 0);
    const lowStockCount = list.filter(
      (item) =>
        item.status === InventoryStatus.OUT_OF_STOCK || item.totalQuantity <= item.reorderPoint
    ).length;
    const expiringCount = list.filter(
      (item) => item.status === InventoryStatus.EXPIRING || item.status === InventoryStatus.EXPIRED
    ).length;
    return {
      totalQuantity,
      lowStockCount,
      expiringCount,
      turnoverRate: null as number | null,
    };
  }, [displayData]);

  const filterFields: FilterField[] = [
    {
      key: 'storeId',
      label: t('store'),
      type: 'select',
      options: [
        { value: '', label: t('allStores') },
        ...stores.map((s) => ({ value: String(s.id), label: s.storeName })),
      ],
    },
    {
      key: 'productName',
      label: t('productName'),
      type: 'text',
      placeholder: t('searchProductPlaceholder'),
      width: 'w-40',
    },
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      options: [
        { value: '', label: t('allStatuses') },
        ...Object.values(InventoryStatus).map((status) => ({
          value: status,
          label: inventoryStatusLabels[status] ?? status,
        })),
      ],
    },
  ];

  const handleSearch = () => {
    const newParams: InventoryQuery = {
      ...params,
      pageNum: 1,
      storeId: filterValues.storeId ? parseInt(filterValues.storeId, 10) : undefined,
      productName: filterValues.productName || undefined,
      status: (filterValues.status as InventoryQuery['status']) || undefined,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({ storeId: '', productName: '', status: '' });
    const newParams = { pageNum: 1, pageSize: params.pageSize };
    setParams(newParams);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);
    updateURL(newParams);
  };

  const updateURL = (params: InventoryQuery) => {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.pageNum));
    if (params.storeId) urlParams.set('storeId', String(params.storeId));
    if (params.productName) urlParams.set('product', params.productName);
    if (params.status) urlParams.set('status', params.status);
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handleExportCSV = () => {
    const rows = displayData?.list || [];
    if (rows.length === 0) {
      toast.info(t('exportEmpty'));
      return;
    }

    const headers = [
      t('storeName'),
      t('productCode'),
      t('productName'),
      t('lotNumber'),
      t('quantity'),
      t('expiryDate'),
      t('state'),
    ];
    const escape = (value: unknown) => `"${String(value ?? '-').replace(/"/g, '""')}"`;

    const lines = [
      headers.join(','),
      ...rows.map((item) => {
        const lot = item.lots?.[0];
        return [
          item.storeName,
          item.productCode,
          item.productName,
          lot?.lotNumber || '-',
          item.totalQuantity,
          item.oldestExpiryDate ? formatDate(item.oldestExpiryDate) : '-',
          inventoryStatusLabels[item.status] ?? item.status,
        ]
          .map(escape)
          .join(',');
      }),
    ];

    const csv = '\ufeff' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const d = new Date(date);
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return d <= threeDaysLater && d >= new Date();
  };

  const totalPages = Math.ceil((displayData?.total || 0) / params.pageSize);

  return (
    <div data-testid={TESTIDS.INVENTORY_PAGE} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid={TESTIDS.INVENTORY_SUMMARY_QUANTITY}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('summaryQuantity')}</p>
                <p className="text-2xl font-bold">
                  {summary.totalQuantity.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {t('itemsCount')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid={TESTIDS.INVENTORY_SUMMARY_LOW_STOCK}
          className={summary.lowStockCount > 0 ? 'border-destructive/50' : ''}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('summaryLowStock')}</p>
                <p className="text-2xl font-bold text-destructive">
                  {summary.lowStockCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {t('itemsCount')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid={TESTIDS.INVENTORY_SUMMARY_EXPIRING}
          className={summary.expiringCount > 0 ? 'border-warning/50' : ''}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-3">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('summaryExpiring')}</p>
                <p className="text-2xl font-bold text-warning">
                  {summary.expiringCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {t('itemsCount')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid={TESTIDS.INVENTORY_SUMMARY_TURNOVER}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('summaryTurnover')}</p>
                <p className="text-2xl font-bold text-success">
                  {summary.turnoverRate == null ? '-' : summary.turnoverRate}
                  {summary.turnoverRate != null && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        onReset={handleReset}
        actions={
          <div className="flex gap-2">
            <Button
              data-testid={TESTIDS.INVENTORY_EXPORT_BUTTON}
              variant="outline"
              onClick={handleExportCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('exportCsv')}
            </Button>
            <Button
              data-testid={TESTIDS.INVENTORY_NEW_BUTTON}
              onClick={() => router.push('/inventory/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('newInventory')}
            </Button>
          </div>
        }
      />

      {isError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t('fetchError')}
        </div>
      )}

      <div data-testid={TESTIDS.INVENTORY_TABLE} className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-[100px]">{t('storeName')}</TableHead>
              <TableHead>{t('productName')}</TableHead>
              <TableHead className="w-[100px]">{t('lotNumber')}</TableHead>
              <TableHead className="w-[80px] text-right">{t('quantity')}</TableHead>
              <TableHead className="w-[100px]">{t('expiryDate')}</TableHead>
              <TableHead className="w-[100px]">{t('state')}</TableHead>
              <TableHead className="w-[140px]">{t('operations')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {tCommon('loading')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && displayData?.list?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t('noInventoryData')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              displayData?.list?.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                const hasLots = item.lots && item.lots.length > 0;
                const firstLot = item.lots?.[0];

                return (
                  <React.Fragment key={item.id}>
                    {/* Main row */}
                    <TableRow
                      data-testid={testId(TESTIDS.INVENTORY_TABLE_ROW, item.id)}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        {hasLots && (
                          <Button
                            data-testid={testId(TESTIDS.INVENTORY_ROW_EXPAND, item.id)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpand(item.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{item.storeName}</TableCell>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {firstLot?.lotNumber || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            item.status === InventoryStatus.OUT_OF_STOCK
                              ? 'text-destructive font-semibold'
                              : item.status === InventoryStatus.OVERSTOCK
                                ? 'text-amber-600 font-semibold'
                                : ''
                          }
                        >
                          {item.totalQuantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.oldestExpiryDate ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={
                                    isExpired(item.oldestExpiryDate)
                                      ? 'text-destructive font-medium'
                                      : isExpiringSoon(item.oldestExpiryDate)
                                        ? 'text-orange-600 font-medium'
                                        : ''
                                  }
                                >
                                  {formatDate(item.oldestExpiryDate)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {formatDateTime(item.oldestExpiryDate)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={InventoryStatusColor[item.status]}>
                          {inventoryStatusLabels[item.status] ?? item.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            data-testid={testId(TESTIDS.INVENTORY_REPLENISH_BUTTON, item.id)}
                            variant="outline"
                            size="sm"
                            onClick={() => setReplenishTarget(item)}
                          >
                            {t('replenish')}
                          </Button>
                          <Button
                            data-testid={testId(TESTIDS.INVENTORY_HISTORY_BUTTON, item.id)}
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistoryTarget(item)}
                          >
                            {t('viewHistory')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded lot rows */}
                    {isExpanded &&
                      item.lots?.map((lot) => (
                        <TableRow key={`${item.id}-${lot.id}`} className="bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell className="text-muted-foreground text-sm pl-6"></TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{lot.lotNumber}</span>
                          </TableCell>
                          <TableCell className="text-right text-sm">{lot.quantity}</TableCell>
                          <TableCell>
                            {lot.expiryDate ? (
                              <span
                                className={
                                  isExpired(lot.expiryDate)
                                    ? 'text-destructive font-medium text-sm'
                                    : isExpiringSoon(lot.expiryDate)
                                      ? 'text-orange-600 text-sm'
                                      : 'text-sm'
                                }
                              >
                                {formatDate(lot.expiryDate)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <Button
                              data-testid={testId(TESTIDS.INVENTORY_DISPOSE_BUTTON, lot.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDisposeTarget({ inventory: item, lot })}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              {t('dispose')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('paginationTotal', {
              total: displayData?.total || 0,
              from: (params.pageNum - 1) * params.pageSize + 1,
              to: Math.min(params.pageNum * params.pageSize, displayData?.total || 0),
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              data-testid={TESTIDS.INVENTORY_PREV_PAGE}
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum - 1)}
              disabled={params.pageNum === 1}
            >
              {tCommon('previous')}
            </Button>
            <span className="text-sm">
              {params.pageNum} / {totalPages}
            </span>
            <Button
              data-testid={TESTIDS.INVENTORY_NEXT_PAGE}
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum + 1)}
              disabled={params.pageNum >= totalPages}
            >
              {tCommon('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ReplenishDialog
        inventory={replenishTarget}
        open={!!replenishTarget}
        onClose={() => setReplenishTarget(null)}
      />
      <DisposeDialog
        inventory={disposeTarget?.inventory || null}
        lot={disposeTarget?.lot || null}
        open={!!disposeTarget}
        onClose={() => setDisposeTarget(null)}
      />
      <HistoryDialog
        inventory={historyTarget}
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
}
