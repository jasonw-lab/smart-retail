import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { noticeApiServer } from '@/features/system/lib/notice-api.server';
import { NoticeTableClient } from '@/features/system/components/notice-table-client';
import type { NoticeQuery, NoticePageResult } from '@/features/system/types/notice';

interface SearchParams {
  page?: string;
  title?: string;
  publishStatus?: string;
}

export default async function NoticePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('system.notice');

  const params: NoticeQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    title: resolvedSearchParams.title,
    publishStatus: resolvedSearchParams.publishStatus
      ? parseInt(resolvedSearchParams.publishStatus, 10)
      : undefined,
  };

  let data: NoticePageResult;
  try {
    data = await noticeApiServer.getPage(params);
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
        <NoticeTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
