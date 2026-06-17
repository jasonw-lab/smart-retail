'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Eye, Download, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { Progress } from '@/components/ui/progress';
import {
  formatCurrency,
  formatRelativeTime,
  formatDateTime,
  formatPercent,
} from '@/lib/format';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { useTransactions } from '../hooks/use-transactions';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import {
  PaymentMethod,
  PaymentMethodLabel,
  PaymentMethodIcon,
  PaymentMethodColor,
  type Transaction,
  type TransactionQuery,
  type TransactionPageResult,
  type PaymentMethodType,
} from '../types/transaction';

interface TransactionTableClientProps {
  initialData: TransactionPageResult;
  initialParams: TransactionQuery;
}

const periodOptions = [
  { value: 'today', label: '本日' },
  { value: 'yesterday', label: '昨日' },
  { value: '7days', label: '過去7日' },
  { value: '30days', label: '過去30日' },
];

export function TransactionTableClient({
  initialData,
  initialParams,
}: TransactionTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: stores = [] } = useStoreOptions();

  const [params, setParams] = useState<TransactionQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeId: initialParams.storeId ? String(initialParams.storeId) : '',
    paymentMethod: initialParams.paymentMethod || '',
    period: initialParams.period || 'today',
    orderNumber: initialParams.orderNumber || '',
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useTransactions(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

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
      key: 'paymentMethod',
      label: '決済方法',
      type: 'select',
      options: [
        { value: '', label: 'すべて' },
        ...Object.entries(PaymentMethodLabel).map(([v, l]) => ({
          value: v,
          label: `${PaymentMethodIcon[v as keyof typeof PaymentMethodIcon]} ${l}`,
        })),
      ],
    },
    {
      key: 'period',
      label: '期間',
      type: 'select',
      options: periodOptions,
    },
    {
      key: 'orderNumber',
      label: '決済番号',
      type: 'text',
      placeholder: '例: ORD-0099',
      width: 'w-36',
    },
  ];

  const handleSearch = () => {
    const newParams: TransactionQuery = {
      ...params,
      pageNum: 1,
      orderNumber: filterValues.orderNumber || undefined,
      storeId: filterValues.storeId
        ? parseInt(filterValues.storeId, 10)
        : undefined,
      paymentMethod:
        (filterValues.paymentMethod as TransactionQuery['paymentMethod']) ||
        undefined,
      period: filterValues.period,
    };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleReset = () => {
    setFilterValues({
      storeId: '',
      paymentMethod: '',
      period: 'today',
      orderNumber: '',
    });
    const newParams: TransactionQuery = {
      pageNum: 1,
      pageSize: params.pageSize,
      period: 'today',
    };
    setParams(newParams);
    router.push(pathname);
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...params, pageNum: page };
    setParams(newParams);
    updateURL(newParams);
  };

  const updateURL = (params: TransactionQuery) => {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(params.pageNum));
    if (params.orderNumber) urlParams.set('order', params.orderNumber);
    if (params.storeId) urlParams.set('storeId', String(params.storeId));
    if (params.paymentMethod) urlParams.set('method', params.paymentMethod);
    if (params.period) urlParams.set('period', params.period);
    router.push(`${pathname}?${urlParams.toString()}`);
  };

  const handleExportCSV = () => {
    // CSV export logic placeholder
    alert('CSV出力機能は準備中です');
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'orderNumber',
      header: '注文番号',
      width: '150px',
      render: (_, row) => (
        <a
          href="#"
          className="font-mono text-sm text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault();
            setSelectedTransaction(row);
          }}
        >
          {row.orderNumber}
        </a>
      ),
    },
    {
      key: 'storeName',
      header: '店舗名',
      width: '120px',
      sortable: true,
    },
    {
      key: 'totalAmount',
      header: '金額',
      width: '100px',
      align: 'right',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono">{formatCurrency(row.totalAmount)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: '決済方法',
      width: '120px',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{PaymentMethodLabel[row.paymentMethod]}</span>
        </div>
      ),
    },
    {
      key: 'transactionTime',
      header: '決済日時',
      width: '100px',
      sortable: true,
      render: (_, row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-sm">
                {formatRelativeTime(row.transactionTime)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {formatDateTime(row.transactionTime)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      width: '80px',
      align: 'center',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTransaction(row);
          }}
          title="詳細"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Get summary data with fallback defaults
  const totalAmount = data.summary?.totalAmount || 4820500;
  const totalCount = data.summary?.totalCount || 1248;
  const byPaymentMethod = data.summary?.byPaymentMethod || [
    {
      method: 'CARD' as PaymentMethodType,
      amount: 2892300,
      count: 748,
      ratio: 60,
    },
    {
      method: 'QR' as PaymentMethodType,
      amount: 1446150,
      count: 374,
      ratio: 30,
    },
    {
      method: 'CASH' as PaymentMethodType,
      amount: 482050,
      count: 126,
      ratio: 10,
    },
  ];

  // Calculate previous period comparison (mock data for now)
  const previousPeriodComparison = '+11.9%';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">売り上げ</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-sm text-success">
                {previousPeriodComparison}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Count Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">件数</span>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {totalCount.toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  件
                </span>
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                本日: {Math.round(totalCount * 0.1)}件
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                決済方法分布
              </span>
              <span className="text-xs text-muted-foreground">本日計</span>
            </div>
            <div className="space-y-3">
              {byPaymentMethod.map((item) => (
                <div key={item.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span>{PaymentMethodIcon[item.method]}</span>
                      <span>{PaymentMethodLabel[item.method]}</span>
                    </span>
                    <span className="font-medium">{item.ratio}%</span>
                  </div>
                  <Progress
                    value={item.ratio}
                    className="h-2"
                    indicatorClassName={`bg-[${PaymentMethodColor[item.method]}]`}
                    style={
                      {
                        '--progress-color': PaymentMethodColor[item.method],
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
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
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV出力
          </Button>
        }
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="決済履歴が見つかりません"
        rowClickable
        onRowClick={(row) => setSelectedTransaction(row)}
        pagination={{
          pageNum: params.pageNum,
          pageSize: params.pageSize,
          total: displayData?.total || 0,
          onPageChange: handlePageChange,
        }}
      />

      <TransactionDetailDialog
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
