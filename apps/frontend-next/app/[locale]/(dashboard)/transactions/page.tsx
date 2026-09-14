import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('transactions');
  return {
    title: t('title'),
  };
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
  const t = await getTranslations('transactions');
  const tCommon = await getTranslations('common');
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
        <h1 className="text-2xl font-bold">{t('listTitle')}</h1>
        <p className="text-muted-foreground">{t('listDescription')}</p>
      </div>

      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <TransactionTableClient initialData={data} initialParams={initialParams} />
      </Suspense>
    </div>
  );
}
