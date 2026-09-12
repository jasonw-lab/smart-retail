import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { configApiServer } from '@/features/system/lib/config-api.server';
import { ConfigTableClient } from '@/features/system/components/config-table-client';
import type { ConfigQuery, ConfigPageResult } from '@/features/system/types/config';

interface SearchParams {
  page?: string;
  keywords?: string;
}

export default async function ConfigPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('system.config');

  const params: ConfigQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  let data: ConfigPageResult;
  try {
    data = await configApiServer.getPage(params);
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
        <ConfigTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
