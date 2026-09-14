'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Eye, Download, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar, type FilterField } from '@/components/ui/filter-bar';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatRelativeTime, formatDateTime, formatDate } from '@/lib/format';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { TESTIDS, testId } from '@/lib/testing/testids';
import { useStoreOptions } from '@/features/stores/hooks/use-stores';
import { useTransactions } from '../hooks/use-transactions';
import { transactionApiClient } from '../lib/transaction-api.client';
import { buildTransactionQuery } from '../lib/transaction-query';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import {
  PaymentMethod,
  PaymentMethodLabel,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getPaymentMethodColor,
  type Transaction,
  type TransactionQuery,
  type TransactionPageResult,
} from '../types/transaction';

interface TransactionTableClientProps {
  initialData: TransactionPageResult;
  initialParams: TransactionQuery;
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: string[][]): string {
  const bom = '\uFEFF';
  return bom + rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function TransactionTableClient({
  initialData,
  initialParams,
}: TransactionTableClientProps) {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const { data: stores = [] } = useStoreOptions();

  const [params, setParams] = useState<TransactionQuery>(initialParams);
  const [filterValues, setFilterValues] = useState({
    storeId: initialParams.storeId ? String(initialParams.storeId) : '',
    paymentMethod: initialParams.paymentMethod || '',
    period: initialParams.period || 'today',
    orderNumber: initialParams.orderNumber || '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    data = initialData,
    isLoading,
    isError,
  } = useTransactions(params, {
    placeholderData: initialData,
  });

  // エラー時は初期データを使用し続ける（SSRで取得したデータ）
  const displayData = isError ? initialData : data;

  const periodOptions = [
    { value: 'today', label: t('periodToday') },
    { value: 'yesterday', label: t('periodYesterday') },
    { value: '7days', label: t('period7days') },
    { value: '30days', label: t('period30days') },
  ];

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
      key: 'paymentMethod',
      label: t('paymentMethod'),
      type: 'select',
      options: [
        { value: '', label: tCommon('all') },
        ...Object.entries(PaymentMethodLabel).map(([v, l]) => ({
          value: v,
          label: `${getPaymentMethodIcon(v)} ${l}`,
        })),
      ],
    },
    {
      key: 'period',
      label: t('period'),
      type: 'select',
      options: periodOptions,
    },
    {
      key: 'orderNumber',
      label: t('orderNumberFilter'),
      type: 'text',
      placeholder: t('orderNumberPlaceholder'),
      width: 'w-36',
    },
  ];

  const handleSearch = () => {
    const baseParams: TransactionQuery = {
      ...params,
      pageNum: 1,
      orderNumber: filterValues.orderNumber || undefined,
      storeId: filterValues.storeId ? parseInt(filterValues.storeId, 10) : undefined,
      paymentMethod: (filterValues.paymentMethod as TransactionQuery['paymentMethod']) || undefined,
      period: filterValues.period,
    };
    const newParams = { ...baseParams, ...buildTransactionQuery(baseParams) };
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
    const baseParams: TransactionQuery = {
      pageNum: 1,
      pageSize: params.pageSize,
      period: 'today',
    };
    const newParams = { ...baseParams, ...buildTransactionQuery(baseParams) };
    setParams(newParams);
    window.history.replaceState(null, '', window.location.pathname);
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

  const handleExportCSV = async () => {
    try {
      const blob = await transactionApiClient.exportTransactions(params);
      downloadBlob(blob, `transactions-${formatDate(new Date())}.csv`);
      return;
    } catch {
      // Backend /export が未実装の場合はフロントエンドで CSV を生成
    }

    const rows = [
      [
        t('orderNumber'),
        t('storeName'),
        t('totalAmount'),
        t('paymentMethod'),
        t('transactionDate'),
        t('provider'),
        t('paymentRef'),
      ],
      ...transactions.map((transaction) => [
        transaction.orderNumber,
        transaction.storeName || '',
        String(transaction.totalAmount),
        getPaymentMethodLabel(transaction.paymentMethod),
        formatDateTime(transaction.transactionTime),
        transaction.paymentProvider || '',
        transaction.referenceId || '',
      ]),
    ];
    const csv = buildCsv(rows);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `transactions-${formatDate(new Date())}.csv`);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'orderNumber',
      header: t('orderNumber'),
      width: '150px',
      render: (_, row) => (
        <a
          href="#"
          data-testid={testId(TESTIDS.TRANSACTION_DETAIL_LINK, row.id)}
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
      header: t('storeName'),
      width: '120px',
      sortable: true,
    },
    {
      key: 'totalAmount',
      header: t('amount'),
      width: '100px',
      align: 'right',
      sortable: true,
      render: (_, row) => <span className="font-mono">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: 'paymentMethod',
      header: t('paymentMethod'),
      width: '120px',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{getPaymentMethodLabel(row.paymentMethod)}</span>
        </div>
      ),
    },
    {
      key: 'transactionTime',
      header: t('transactionDate'),
      width: '100px',
      sortable: true,
      render: (_, row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-sm">{formatRelativeTime(row.transactionTime)}</span>
            </TooltipTrigger>
            <TooltipContent>{formatDateTime(row.transactionTime)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'actions',
      header: tCommon('actions'),
      width: '80px',
      align: 'center',
      render: (_, row) => (
        <Button
          data-testid={testId(TESTIDS.TRANSACTION_DETAIL_BUTTON, row.id)}
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTransaction(row);
          }}
          title={t('detail')}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const transactions = displayData?.list || [];
  const totalAmount =
    displayData.summary?.totalAmount ??
    transactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
  const totalCount = displayData.summary?.totalCount ?? transactions.length;
  const byPaymentMethod =
    displayData.summary?.byPaymentMethod ??
    Object.values(PaymentMethod).map((method) => {
      const matching = transactions.filter((transaction) => transaction.paymentMethod === method);
      const amount = matching.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
      const count = matching.length;

      return {
        method,
        amount,
        count,
        ratio: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      };
    });

  return (
    <div data-testid={TESTIDS.TRANSACTION_PAGE} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <Card data-testid={TESTIDS.TRANSACTION_SUMMARY_SALES}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('summarySales')}</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Count Card */}
        <Card data-testid={TESTIDS.TRANSACTION_SUMMARY_COUNT}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('summaryCount')}</span>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {totalCount.toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground ml-1">{t('countUnit')}</span>
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {t('showingCount', { count: transactions.length.toLocaleString() })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution Card */}
        <Card data-testid={TESTIDS.TRANSACTION_SUMMARY_PAYMENT}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{t('paymentMethodDistribution')}</span>
              <span className="text-xs text-muted-foreground">{t('todayTotal')}</span>
            </div>
            <div className="space-y-3">
              {byPaymentMethod.map((item) => (
                <div key={item.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span>{getPaymentMethodIcon(item.method)}</span>
                      <span>{getPaymentMethodLabel(item.method)}</span>
                    </span>
                    <span className="font-medium">{item.ratio}%</span>
                  </div>
                  <Progress
                    value={item.ratio}
                    className="h-2"
                    indicatorClassName={`bg-[${getPaymentMethodColor(item.method)}]`}
                    style={
                      {
                        '--progress-color': getPaymentMethodColor(item.method),
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
          <Button
            data-testid={TESTIDS.TRANSACTION_EXPORT_BUTTON}
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('exportCsv')}
          </Button>
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

      {/* Data Table */}
      <DataTable
        dataTestId={TESTIDS.TRANSACTION_TABLE}
        columns={columns}
        data={displayData?.list || []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={t('noData')}
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
