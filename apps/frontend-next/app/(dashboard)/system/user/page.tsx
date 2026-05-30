import { Suspense } from 'react';
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

// Mock data for development (replace with actual API call)
async function getUsers(params: UserQuery): Promise<UserPageResult> {
  // TODO: Replace with actual API call
  const mockUsers = [
    {
      id: 1,
      username: 'demo',
      nickname: 'Demo User',
      gender: 1,
      deptId: 1,
      deptName: 'Youlai Tech',
      mobile: '18812345680',
      email: 'demo@example.com',
      status: 1,
      createTime: '2024-01-01 09:00:00',
      roleIds: [1],
      roleNames: ['System Admin'],
    },
    {
      id: 2,
      username: 'admin',
      nickname: 'System Admin',
      gender: 1,
      deptId: 1,
      deptName: 'Youlai Tech',
      mobile: '18812345678',
      email: 'admin@example.com',
      status: 1,
      createTime: '2024-01-05 10:30:00',
      roleIds: [1],
      roleNames: ['System Admin'],
    },
    {
      id: 3,
      username: 'manager01',
      nickname: 'Store Manager',
      gender: 1,
      deptId: 6,
      deptName: 'Tokyo Branch',
      mobile: '090-2345-6789',
      email: 'tanaka@example.com',
      status: 1,
      createTime: '2024-01-05 10:30:00',
      roleIds: [2],
      roleNames: ['Store Manager'],
    },
    {
      id: 4,
      username: 'staff01',
      nickname: 'Sato',
      gender: 2,
      deptId: 6,
      deptName: 'Tokyo Branch',
      mobile: '090-3456-7890',
      email: 'sato@example.com',
      status: 1,
      createTime: '2024-01-10 14:00:00',
      roleIds: [3],
      roleNames: ['Staff'],
    },
    {
      id: 5,
      username: 'staff02',
      nickname: 'Suzuki',
      gender: 1,
      deptId: 7,
      deptName: 'Osaka Branch',
      mobile: '090-4567-8901',
      email: 'suzuki@example.com',
      status: 1,
      createTime: '2024-01-12 09:30:00',
      roleIds: [3],
      roleNames: ['Staff'],
    },
    {
      id: 6,
      username: 'guest',
      nickname: 'Guest User',
      gender: 0,
      deptId: 1,
      deptName: 'HQ',
      status: 0,
      createTime: '2024-01-15 11:00:00',
      roleIds: [4],
      roleNames: ['Guest'],
    },
  ];

  let filtered = mockUsers;
  if (params.keywords) {
    filtered = filtered.filter(
      (u) =>
        u.username.includes(params.keywords!) ||
        u.nickname.includes(params.keywords!)
    );
  }
  if (params.status !== undefined) {
    filtered = filtered.filter((u) => u.status === params.status);
  }
  if (params.deptId) {
    filtered = filtered.filter((u) => u.deptId === params.deptId);
  }

  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
}

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: UserQuery = {
    pageNum: parseInt(resolvedSearchParams.page || '1', 10),
    pageSize: 10,
    keywords: resolvedSearchParams.keywords,
    status: resolvedSearchParams.status ? parseInt(resolvedSearchParams.status) : undefined,
    deptId: resolvedSearchParams.deptId ? parseInt(resolvedSearchParams.deptId) : undefined,
    startTime: resolvedSearchParams.startTime,
    endTime: resolvedSearchParams.endTime,
  };

  const data = await getUsers(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage system user accounts and permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UserTableClient initialData={data} initialParams={params} />
      </Suspense>
    </div>
  );
}
