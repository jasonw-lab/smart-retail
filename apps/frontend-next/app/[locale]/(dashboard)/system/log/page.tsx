import { Suspense } from 'react';
import { logApiServer } from '@/features/system/lib/log-api.server';
import { LogTableClient } from '@/features/system/components/log-table-client';
import type { LogQuery, LogPageResult } from '@/features/system/types/log';

interface SearchParams {
  page?: string;
  keywords?: string;
  startTime?: string;
  endTime?: string;
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: LogQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
    startTime: resolvedSearchParams.startTime,
    endTime: resolvedSearchParams.endTime,
  };

  let data: LogPageResult;
  try {
    data = await logApiServer.getPage(params);
  } catch {
    data = { list: [], total: 0 };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Log</h1>
        <p className="text-muted-foreground">View system operation history</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <LogTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
