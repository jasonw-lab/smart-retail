import type {
  Role,
  RoleQuery,
  RolePageResult,
  RoleForm,
  MenuOption,
} from '../types/role';

const BASE_URL = '/api/proxy/api/v1/roles';

export async function getRoles(params: RoleQuery): Promise<RolePageResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.keywords) searchParams.set('keywords', params.keywords);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export async function getRole(id: number): Promise<Role> {
  const res = await fetch(`${BASE_URL}/${id}/form`);
  if (!res.ok) throw new Error('Failed to fetch role');
  return res.json();
}

export async function getRoleOptions(): Promise<
  { value: number; label: string }[]
> {
  const res = await fetch(`${BASE_URL}/options`);
  if (!res.ok) throw new Error('Failed to fetch role options');
  return res.json();
}

export async function createRole(data: RoleForm): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create role');
}

export async function updateRole(id: number, data: RoleForm): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update role');
}

export async function deleteRoles(ids: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${ids}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete roles');
}

export async function getRoleMenuIds(roleId: number): Promise<number[]> {
  // Backend endpoint: GET /{roleId}/menu-ids
  const res = await fetch(`${BASE_URL}/${roleId}/menu-ids`);
  if (!res.ok) throw new Error('Failed to fetch role menu ids');
  return res.json();
}

export async function updateRoleMenus(
  roleId: number,
  menuIds: number[]
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${roleId}/menus`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuIds),
  });
  if (!res.ok) throw new Error('Failed to update role menus');
}

export async function getMenuOptions(): Promise<MenuOption[]> {
  const res = await fetch('/api/proxy/api/v1/menus/options');
  if (!res.ok) throw new Error('Failed to fetch menu options');
  return res.json();
}
