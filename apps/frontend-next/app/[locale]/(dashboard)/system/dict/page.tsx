import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { dictApiServer } from '@/features/system/lib/dict-api.server';
import { DictTableClient } from '@/features/system/components/dict-table-client';
import type { DictQuery, DictPageResult } from '@/features/system/types/dict';

interface SearchParams {
  page?: string;
  keywords?: string;
}

export default async function DictPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('system.dict');
  const params: DictQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  let data: DictPageResult;
  try {
    data = await dictApiServer.getPage(params);
  } catch {
    data = { list: [], total: 0 };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DictTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
