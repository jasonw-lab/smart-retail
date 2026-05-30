import { Suspense } from 'react';
import { RoleTableClient } from '@/features/system/components/role-table-client';
import type { RoleQuery, RolePageResult } from '@/features/system/types/role';

interface SearchParams {
  page?: string;
  keywords?: string;
}

// Mock data for development (replace with actual API call)
async function getRoles(params: RoleQuery): Promise<RolePageResult> {
  // TODO: Replace with actual API call
  const mockRoles = [
    { id: 1, name: 'System Administrator', code: 'ADMIN', status: 1, sort: 1, dataScope: 1 },
    { id: 2, name: 'Store Manager', code: 'MANAGER', status: 1, sort: 2, dataScope: 2 },
    { id: 3, name: 'Inventory Controller', code: 'INVENTORY', status: 1, sort: 3, dataScope: 3 },
    { id: 4, name: 'Guest Viewer', code: 'GUEST', status: 0, sort: 4, dataScope: 4 },
    { id: 5, name: 'Supervisor', code: 'SUPER', status: 1, sort: 5, dataScope: 1 },
    { id: 6, name: 'Security Officer', code: 'SEC', status: 1, sort: 6, dataScope: 2 },
    { id: 7, name: 'Marketing Lead', code: 'MARKET', status: 1, sort: 7, dataScope: 2 },
    { id: 8, name: 'Support Tech', code: 'TECH', status: 1, sort: 8, dataScope: 3 },
    { id: 9, name: 'Data Analyst', code: 'ANALYST', status: 1, sort: 9, dataScope: 3 },
    { id: 10, name: 'API Integration', code: 'API', status: 1, sort: 10, dataScope: 4 },
  ];

  let filtered = mockRoles;
  if (params.keywords) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(params.keywords!.toLowerCase()) ||
        r.code.toLowerCase().includes(params.keywords!.toLowerCase())
    );
  }

  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
}

export default async function RolePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: RoleQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
  };

  const data = await getRoles(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">
          Manage system roles and data permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RoleTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
