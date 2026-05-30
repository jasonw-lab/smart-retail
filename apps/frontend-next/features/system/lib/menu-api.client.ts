import type { Menu, MenuQuery, MenuForm, MenuOption } from '../types/menu';

const BASE_URL = '/api/proxy/api/v1/menus';

export async function getMenus(params?: MenuQuery): Promise<Menu[]> {
  const searchParams = new URLSearchParams();
  if (params?.keywords) searchParams.set('keywords', params.keywords);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch menus');
  return res.json();
}

export async function getMenu(id: number): Promise<Menu> {
  const res = await fetch(`${BASE_URL}/${id}/form`);
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
}

export async function getMenuOptions(onlyParent?: boolean): Promise<MenuOption[]> {
  const url = onlyParent ? `${BASE_URL}/options?onlyParent=true` : `${BASE_URL}/options`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch menu options');
  return res.json();
}

export async function createMenu(data: MenuForm): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create menu');
}

export async function updateMenu(id: number, data: MenuForm): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update menu');
}

export async function deleteMenu(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete menu');
}
