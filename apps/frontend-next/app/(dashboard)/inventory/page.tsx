import { Suspense } from 'react';
import { InventoryTableClient } from '@/features/inventory/components/inventory-table-client';
import { inventoryApiServer } from '@/features/inventory/lib/inventory-api.server';
import type { InventoryQuery, InventoryPageResult, InventoryStatusType } from '@/features/inventory/types/inventory';

interface SearchParams {
  page?: string;
  storeId?: string;
  product?: string;
  status?: string;
}

async function getInventory(params: InventoryQuery): Promise<InventoryPageResult> {
  try {
    return await inventoryApiServer.getPage(params);
  } catch {
    // API未実装時の空データフォールバック
    return { list: [], total: 0 };
  }
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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
        <h1 className="text-2xl font-bold">在庫一覧</h1>
        <p className="text-muted-foreground">
          店舗×商品別の在庫状況を確認し、補充・廃棄を記録します
        </p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <InventoryTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
