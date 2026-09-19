import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StoreTableClient } from '@/features/stores/components/store-table-client';
import { storeApiServer } from '@/features/stores/lib/store-api.server';
import type { StoreQuery, StorePageResult, StoreStatusType } from '@/features/stores/types/store';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('stores');
  return {
    title: t('title'),
  };
}

interface SearchParams {
  page?: string;
  name?: string;
  status?: string;
  address?: string;
}

async function getStores(params: StoreQuery): Promise<StorePageResult> {
  return storeApiServer.getPage(params);
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations('stores');
  const tCommon = await getTranslations('common');
  const resolvedSearchParams = await searchParams;
  const params: StoreQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    storeName: resolvedSearchParams.name,
    address: resolvedSearchParams.address,
    status: resolvedSearchParams.status as StoreStatusType | undefined,
  };

  const data = await getStores(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <span>Home</span>
            <span>/</span>
            <span>{t('title')}</span>
            <span>/</span>
            <span className="text-foreground">{t('listTitle')}</span>
          </nav>
          <h1 className="text-2xl font-bold">{t('listTitle')}</h1>
        </div>
      </div>

      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <StoreTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
