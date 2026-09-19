import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { InventoryTableClient } from '@/features/inventory/components/inventory-table-client';
import { inventoryApiServer } from '@/features/inventory/lib/inventory-api.server';
import type {
  InventoryQuery,
  InventoryPageResult,
  InventoryStatusType,
} from '@/features/inventory/types/inventory';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('inventory');
  return {
    title: t('title'),
  };
}

interface SearchParams {
  page?: string;
  storeId?: string;
  product?: string;
  status?: string;
}

async function getInventory(params: InventoryQuery): Promise<InventoryPageResult> {
  return inventoryApiServer.getPage(params);
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations('inventory');
  const tCommon = await getTranslations('common');
  const resolvedSearchParams = await searchParams;
  const params: InventoryQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    storeId: resolvedSearchParams.storeId ? parseInt(resolvedSearchParams.storeId, 10) : undefined,
    productName: resolvedSearchParams.product,
    status: resolvedSearchParams.status as InventoryStatusType | undefined,
  };

  const data = await getInventory(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('listTitle')}</h1>
        <p className="text-muted-foreground">{t('listDescription')}</p>
      </div>

      <Suspense fallback={<div>{tCommon('loading')}</div>}>
        <InventoryTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
