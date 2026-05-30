import { Suspense } from 'react';
import { LogTableClient } from '@/features/system/components/log-table-client';
import type { LogQuery, LogPageResult } from '@/features/system/types/log';

interface SearchParams {
  page?: string;
  keywords?: string;
  startTime?: string;
  endTime?: string;
}

// Mock data for development (replace with actual API call)
async function getLogs(params: LogQuery): Promise<LogPageResult> {
  // TODO: Replace with actual API call
  const mockLogs = [
    {
      id: 1,
      createTime: '2026-05-28 22:10:53',
      operator: 'demo_user',
      module: 'DICTIONARY',
      content: 'Dictionary categorization list',
      ip: '36.13.238.30',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 45,
    },
    {
      id: 2,
      createTime: '2026-05-28 22:10:46',
      operator: 'demo_user',
      module: 'DEPT',
      content: 'Department hierarchy list fetch',
      ip: '36.13.238.30',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 32,
    },
    {
      id: 3,
      createTime: '2026-05-28 22:10:38',
      operator: 'demo_user',
      module: 'MENU',
      content: 'Menu listing refresh',
      ip: '36.10.238.30',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 28,
    },
    {
      id: 4,
      createTime: '2026-05-28 22:10:06',
      operator: 'demo_user',
      module: 'ROLE',
      content: 'Role authorization list view',
      ip: '36.13.238.32',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 120,
    },
    {
      id: 5,
      createTime: '2026-05-28 21:18:30',
      operator: 'demo_user',
      module: 'USER',
      content: 'User directory search',
      ip: '36.13.238.30',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 15,
    },
    {
      id: 6,
      createTime: '2026-05-28 13:31:00',
      operator: 'demo_user',
      module: 'LOGIN',
      content: 'Success Login',
      ip: '30.19.238.30',
      region: '0.0',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 55,
    },
    {
      id: 7,
      createTime: '2026-05-28 10:30:25',
      operator: 'admin',
      module: 'USER',
      content: 'User [user001] registered',
      ip: '192.168.1.100',
      region: 'Tokyo',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 45,
    },
    {
      id: 8,
      createTime: '2026-05-28 10:28:12',
      operator: 'admin',
      module: 'MENU',
      content: 'Product [PRD-001] price updated',
      ip: '192.168.1.100',
      region: 'Tokyo',
      browser: 'Chrome 148.0',
      os: 'Windows 10',
      executionTime: 32,
    },
  ];

  let filtered = mockLogs;
  if (params.keywords) {
    filtered = filtered.filter(
      (l) =>
        l.operator.includes(params.keywords!) ||
        l.module.includes(params.keywords!) ||
        l.content.includes(params.keywords!)
    );
  }

  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
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

  const data = await getLogs(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Log</h1>
        <p className="text-muted-foreground">
          View system operation history
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <LogTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
