'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Package,
  History,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { formatDate, formatDateTime } from '@/lib/format';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { useInventory } from '../hooks/use-inventory';
import { ReplenishDialog } from './replenish-dialog';
import { DisposeDialog } from './dispose-dialog';
import { HistoryDialog } from './history-dialog';
import {
  InventoryStatus,
  InventoryStatusLabel,
  InventoryStatusColor,
  type Inventory,
  type InventoryLot,
  type InventoryQuery,
  type InventoryPageResult,
} from '../types/inventory';

interface InventoryTableClientProps {
  initialData: InventoryPageResult;
  initialParams: InventoryQuery;
}

export function InventoryTableClient({
  initialData,
  initialParams,
}: InventoryTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: stores = [] } = useStoreOptions();

  const [params, setParams] = useState<InventoryQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeId: initialParams.storeId ? String(initialParams.storeId) : '',
    productName: initialParams.productName || '',
    status: initialParams.status || '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Dialogs
  const [replenishTarget, setReplenishTarget] = useState<Inventory | null>(
    null
  );
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
    const totalQuantity = list.reduce(
      (sum, item) => sum + item.totalQuantity,
      0
    );
    const lowStockCount = list.filter(
      (item) =>
        item.status === InventoryStatus.OUT_OF_STOCK ||
        item.totalQuantity <= item.reorderPoint
    ).length;
    const expiringCount = list.filter(
      (item) =>
        item.status === InventoryStatus.EXPIRING ||
        item.status === InventoryStatus.EXPIRED
    ).length;
    // Mock turnover rate
    const turnoverRate = 97.1;

    return {
      totalQuantity,
      lowStockCount,
      expiringCount,
      turnoverRate,
    };
  }, [data]);

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
      key: 'productName',
      label: '商品名',
      type: 'text',
      placeholder: '商品名を入力...',
      width: 'w-40',
    },
    {
      key: 'status',
      label: 'ステータス',
      type: 'select',
      options: [
        { value: '', label: 'すべてのステータス' },
        ...Object.entries(InventoryStatusLabel).map(([v, l]) => ({
          value: v,
          label: l,
        })),
      ],
    },
  ];

  const handleSearch = () => {
    const newParams: InventoryQuery = {
      ...params,
      pageNum: 1,
      storeId: filterValues.storeId
        ? parseInt(filterValues.storeId, 10)
        : undefined,
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
    router.push(pathname);
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
    // CSV export logic placeholder
    alert('CSVエクスポート機能は準備中です');
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">在庫数</p>
                <p className="text-2xl font-bold">
                  {summary.totalQuantity.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    件
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={summary.lowStockCount > 0 ? 'border-destructive/50' : ''}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  在庫不足アラート
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {summary.lowStockCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    件
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.expiringCount > 0 ? 'border-warning/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-3">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">期限切れ間近</p>
                <p className="text-2xl font-bold text-warning">
                  {summary.expiringCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    件
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">在庫回転率</p>
                <p className="text-2xl font-bold text-success">
                  {summary.turnoverRate}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    %
                  </span>
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
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
            <Button onClick={() => router.push('/inventory/new')}>
              <Plus className="mr-2 h-4 w-4" />
              新規在庫登録
            </Button>
          </div>
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-[100px]">店舗名</TableHead>
              <TableHead>商品名</TableHead>
              <TableHead className="w-[100px]">ロット番号</TableHead>
              <TableHead className="w-[80px] text-right">数量</TableHead>
              <TableHead className="w-[100px]">賞味期限</TableHead>
              <TableHead className="w-[100px]">状態</TableHead>
              <TableHead className="w-[140px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  読み込み中...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && displayData?.list?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  在庫データが見つかりません
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
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        {hasLots && (
                          <Button
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
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
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
                        <StatusBadge
                          variant={InventoryStatusColor[item.status]}
                        >
                          {InventoryStatusLabel[item.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplenishTarget(item)}
                          >
                            補充
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistoryTarget(item)}
                          >
                            確認
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded lot rows */}
                    {isExpanded &&
                      item.lots?.map((lot) => (
                        <TableRow
                          key={`${item.id}-${lot.id}`}
                          className="bg-muted/30"
                        >
                          <TableCell></TableCell>
                          <TableCell className="text-muted-foreground text-sm pl-6"></TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">
                              {lot.lotNumber}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {lot.quantity}
                          </TableCell>
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
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDisposeTarget({ inventory: item, lot })
                              }
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              廃棄
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
            全{displayData?.total || 0}件中{' '}
            {(params.pageNum - 1) * params.pageSize + 1}-
            {Math.min(
              params.pageNum * params.pageSize,
              displayData?.total || 0
            )}
            件
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum - 1)}
              disabled={params.pageNum === 1}
            >
              前へ
            </Button>
            <span className="text-sm">
              {params.pageNum} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.pageNum + 1)}
              disabled={params.pageNum >= totalPages}
            >
              次へ
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
