import type {
  Dict,
  DictQuery,
  DictPageResult,
  DictForm,
  DictItem,
  DictItemQuery,
  DictItemPageResult,
  DictItemForm,
} from '../types/dict';

const BASE_URL = '/api/proxy/api/v1/dicts';

export async function getDicts(params: DictQuery): Promise<DictPageResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.keywords) searchParams.set('keywords', params.keywords);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dicts');
  return res.json();
}

export async function getDict(id: number): Promise<Dict> {
  const res = await fetch(`${BASE_URL}/${id}/form`);
  if (!res.ok) throw new Error('Failed to fetch dict');
  return res.json();
}

export async function createDict(data: DictForm): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create dict');
}

export async function updateDict(id: number, data: DictForm): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update dict');
}

export async function deleteDicts(ids: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${ids}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete dicts');
}

// 辞書項目 - Backend: /api/v1/dicts/{dictCode}/items
export async function getDictItems(
  params: DictItemQuery
): Promise<DictItemPageResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('pageNum', String(params.pageNum));
  searchParams.set('pageSize', String(params.pageSize));
  if (params.keywords) searchParams.set('keywords', params.keywords);

  const res = await fetch(
    `${BASE_URL}/${params.dictCode}/items?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error('Failed to fetch dict items');
  return res.json();
}

export async function getDictItem(
  dictCode: string,
  id: number
): Promise<DictItem> {
  const res = await fetch(`${BASE_URL}/${dictCode}/items/${id}/form`);
  if (!res.ok) throw new Error('Failed to fetch dict item');
  return res.json();
}

export async function createDictItem(
  dictCode: string,
  data: DictItemForm
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${dictCode}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create dict item');
}

export async function updateDictItem(
  dictCode: string,
  id: number,
  data: DictItemForm
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${dictCode}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update dict item');
}

export async function deleteDictItems(
  dictCode: string,
  ids: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${dictCode}/items/${ids}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete dict items');
}
