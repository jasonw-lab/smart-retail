import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { deptApiServer } from '@/features/system/lib/dept-api.server';
import { DeptTableClient } from '@/features/system/components/dept-table-client';
import type { Dept } from '@/features/system/types/dept';

export default async function DeptPage() {
  const t = await getTranslations('system.dept');
  let data: Dept[];
  try {
    data = await deptApiServer.getList();
  } catch {
    data = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DeptTableClient initialData={data} />
      </Suspense>
    </div>
  );
}
