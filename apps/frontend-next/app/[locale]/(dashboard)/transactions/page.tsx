import { Suspense } from 'react';
import { TransactionTableClient } from '@/features/transactions/components/transaction-table-client';
import { transactionApiServer } from '@/features/transactions/lib/transaction-api.server';
import { buildTransactionQuery } from '@/features/transactions/lib/transaction-query';
import type {
  TransactionQuery,
  TransactionPageResult,
  PaymentMethodType,
} from '@/features/transactions/types/transaction';

interface SearchParams {
  page?: string;
  order?: string;
  storeId?: string;
  method?: string;
  period?: string;
}

async function getTransactions(params: TransactionQuery): Promise<TransactionPageResult> {
  const apiParams = buildTransactionQuery(params);
  return transactionApiServer.getPage(apiParams);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: TransactionQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 20,
    orderNumber: resolvedSearchParams.order,
    storeId: resolvedSearchParams.storeId ? parseInt(resolvedSearchParams.storeId, 10) : undefined,
    paymentMethod: resolvedSearchParams.method as PaymentMethodType | undefined,
    period: resolvedSearchParams.period || 'today',
  };

  const data = await getTransactions(params);
  const initialParams = { ...params, ...buildTransactionQuery(params) };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">決済履歴</h1>
        <p className="text-muted-foreground">店舗ごとの売上・決済取引を確認します</p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <TransactionTableClient initialData={data} initialParams={initialParams} />
      </Suspense>
    </div>
  );
}
