import type { Dept, DeptQuery, DeptForm, DeptOption } from '../types/dept';

const BASE_URL = '/api/proxy/api/v1/depts';

export async function getDepts(params?: DeptQuery): Promise<Dept[]> {
  const searchParams = new URLSearchParams();
  if (params?.keywords) searchParams.set('keywords', params.keywords);
  if (params?.status !== undefined) searchParams.set('status', String(params.status));

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch depts');
  return res.json();
}

export async function getDept(id: number): Promise<Dept> {
  const res = await fetch(`${BASE_URL}/${id}/form`);
  if (!res.ok) throw new Error('Failed to fetch dept');
  return res.json();
}

export async function getDeptOptions(): Promise<DeptOption[]> {
  const res = await fetch(`${BASE_URL}/options`);
  if (!res.ok) throw new Error('Failed to fetch dept options');
  return res.json();
}

export async function createDept(data: DeptForm): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create dept');
}

export async function updateDept(id: number, data: DeptForm): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update dept');
}

export async function deleteDepts(ids: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${ids}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete depts');
}
