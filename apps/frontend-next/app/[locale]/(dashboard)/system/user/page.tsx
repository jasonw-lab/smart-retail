import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { userApiServer } from '@/features/system/lib/user-api.server';
import { UserTableClient } from '@/features/system/components/user-table-client';
import type { UserQuery, UserPageResult } from '@/features/system/types/user';

interface SearchParams {
  page?: string;
  keywords?: string;
  status?: string;
  deptId?: string;
  startTime?: string;
  endTime?: string;
}

export default async function UserPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('system.user');
  const params: UserQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
    status: resolvedSearchParams.status ? parseInt(resolvedSearchParams.status) : undefined,
    deptId: resolvedSearchParams.deptId ? parseInt(resolvedSearchParams.deptId) : undefined,
    startTime: resolvedSearchParams.startTime,
    endTime: resolvedSearchParams.endTime,
  };

  let data: UserPageResult;
  try {
    data = await userApiServer.getPage(params);
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
        <UserTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
