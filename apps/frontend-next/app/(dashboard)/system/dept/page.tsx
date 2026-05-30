import { Suspense } from 'react';
import { DeptTableClient } from '@/features/system/components/dept-table-client';
import type { Dept } from '@/features/system/types/dept';

// Mock data for development (replace with actual API call)
async function getDepts(): Promise<Dept[]> {
  // TODO: Replace with actual API call
  return [
    {
      id: 1,
      parentId: 0,
      name: 'Youlai Tech',
      code: 'YOULAI',
      sort: 1,
      status: 1,
      children: [
        {
          id: 2,
          parentId: 1,
          name: 'R&D Dept',
          code: 'RD001',
          sort: 1,
          status: 1,
        },
        {
          id: 3,
          parentId: 1,
          name: 'Test Dept',
          code: 'QA001',
          sort: 1,
          status: 1,
        },
      ],
    },
    {
      id: 4,
      parentId: 0,
      name: 'Operations Dept',
      code: 'OPS001',
      sort: 2,
      status: 1,
      children: [],
    },
    {
      id: 5,
      parentId: 0,
      name: 'Logistics Division',
      code: 'LOG99',
      sort: 3,
      status: 0,
      children: [],
    },
  ];
}

export default async function DeptPage() {
  const data = await getDepts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Department Management</h1>
        <p className="text-muted-foreground">
          Manage organizational department structure
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DeptTableClient initialData={data} />
      </Suspense>
    </div>
  );
}
