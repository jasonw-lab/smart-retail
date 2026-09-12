import { Suspense } from 'react';
import { dictApiServer } from '@/features/system/lib/dict-api.server';
import { DictItemTableClient } from '@/features/system/components/dict-item-table-client';
import type { DictItemQuery, DictItemPageResult } from '@/features/system/types/dict';

interface DictItemPageProps {
  params: Promise<{ locale: string; dictCode: string }>;
  searchParams: Promise<{ title?: string; page?: string; keywords?: string }>;
}

export default async function DictItemPage({ params, searchParams }: DictItemPageProps) {
  const { dictCode } = await params;
  const resolvedSearchParams = await searchParams;

  const query: DictItemQuery = {
    dictCode,
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  let data: DictItemPageResult;
  try {
    data = await dictApiServer.getItems(dictCode, query);
  } catch {
    data = { list: [], total: 0 };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {resolvedSearchParams.title || dictCode} - Dictionary Items
        </h1>
        <p className="text-muted-foreground">Manage items for this system dictionary</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DictItemTableClient dictCode={dictCode} initialData={data} initialParams={query} />
      </Suspense>
    </div>
  );
}
