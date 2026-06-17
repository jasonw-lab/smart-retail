import { Suspense } from 'react';
import { menuApiServer } from '@/features/system/lib/menu-api.server';
import { MenuTableClient } from '@/features/system/components/menu-table-client';
import type { Menu } from '@/features/system/types/menu';

export default async function MenuPage() {
  let data: Menu[];
  try {
    data = await menuApiServer.getList();
  } catch {
    data = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">
          Manage system navigation menus and permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MenuTableClient initialData={data} />
      </Suspense>
    </div>
  );
}
