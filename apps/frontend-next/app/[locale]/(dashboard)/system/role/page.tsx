import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { roleApiServer } from '@/features/system/lib/role-api.server';
import { RoleTableClient } from '@/features/system/components/role-table-client';
import type { RoleQuery, RolePageResult } from '@/features/system/types/role';

interface SearchParams {
  page?: string;
  keywords?: string;
}

export default async function RolePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('system.role');
  const params: RoleQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  let data: RolePageResult;
  try {
    data = await roleApiServer.getPage(params);
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
        <RoleTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
