import { Suspense } from 'react';
import { deptApiServer } from '@/features/system/lib/dept-api.server';
import { DeptTableClient } from '@/features/system/components/dept-table-client';
import type { Dept } from '@/features/system/types/dept';

export default async function DeptPage() {
  let data: Dept[];
  try {
    data = await deptApiServer.getList();
  } catch {
    data = [];
  }

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
