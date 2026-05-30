import type { User, UserQuery, UserPageResult, UserForm } from '../types/user';

const BASE_URL = '/api/proxy/api/v1/users';

export async function getUsers(params: UserQuery): Promise<UserPageResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.keywords) searchParams.set('keywords', params.keywords);
  if (params.status !== undefined) searchParams.set('status', String(params.status));
  if (params.deptId) searchParams.set('deptId', String(params.deptId));
  if (params.startTime) searchParams.set('startTime', params.startTime);
  if (params.endTime) searchParams.set('endTime', params.endTime);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function createUser(data: UserForm): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user');
}

export async function updateUser(id: number, data: UserForm): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
}

export async function deleteUsers(ids: string): Promise<void> {
  // Backend expects List<Long> in body for batch delete
  const idList = ids.split(',').map((id) => parseInt(id, 10));
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(idList),
  });
  if (!res.ok) throw new Error('Failed to delete users');
}

export async function resetPassword(userId: number, password: string): Promise<void> {
  // Backend: PATCH /{id}/password with RequestParam password
  const res = await fetch(`${BASE_URL}/${userId}/password?password=${encodeURIComponent(password)}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to reset password');
}

export async function exportUsers(params: UserQuery): Promise<Blob> {
  const searchParams = new URLSearchParams();
  if (params.keywords) searchParams.set('keywords', params.keywords);
  if (params.status !== undefined) searchParams.set('status', String(params.status));
  if (params.deptId) searchParams.set('deptId', String(params.deptId));

  const res = await fetch(`${BASE_URL}/export?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to export users');
  return res.blob();
}
