import { Suspense } from 'react';
import { DictTableClient } from '@/features/system/components/dict-table-client';
import type { DictQuery, DictPageResult } from '@/features/system/types/dict';

interface SearchParams {
  page?: string;
  keywords?: string;
}

// Mock data for development (replace with actual API call)
async function getDicts(params: DictQuery): Promise<DictPageResult> {
  // TODO: Replace with actual API call
  const mockDicts = [
    { id: 1, name: 'Gender', dictCode: 'gender', status: 1, remark: 'User gender options' },
    { id: 2, name: 'Notice Type', dictCode: 'notice_type', status: 1, remark: 'Notification types' },
    { id: 3, name: 'Notice Level', dictCode: 'notice_level', status: 1, remark: 'Notification priority levels' },
    { id: 4, name: 'Device Type', dictCode: 'device_type', status: 1, remark: 'Device categories' },
    { id: 5, name: 'Payment Method', dictCode: 'payment_method', status: 1, remark: 'Payment options' },
  ];

  let filtered = mockDicts;
  if (params.keywords) {
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(params.keywords!.toLowerCase()) ||
        d.dictCode.toLowerCase().includes(params.keywords!.toLowerCase())
    );
  }

  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
}

export default async function DictPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: DictQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  const data = await getDicts(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dictionary Management</h1>
        <p className="text-muted-foreground">
          Manage system dictionary data for dropdown options
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DictTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
