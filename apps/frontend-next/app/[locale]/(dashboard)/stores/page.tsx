import { Suspense } from 'react';
import { StoreTableClient } from '@/features/stores/components/store-table-client';
import { storeApiServer } from '@/features/stores/lib/store-api.server';
import type { StoreQuery, StorePageResult, StoreStatusType } from '@/features/stores/types/store';

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
            <span>Store Management</span>
            <span>/</span>
            <span className="text-foreground">店舗一覧</span>
          </nav>
          <h1 className="text-2xl font-bold">店舗一覧</h1>
        </div>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <StoreTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
