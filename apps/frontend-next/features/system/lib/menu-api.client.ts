import { fetchApi } from '@/lib/api/client';
import type { Menu, MenuQuery, MenuForm, MenuOption } from '../types/menu';

const BASE_URL = '/api/proxy/api/v1/menus';

/**
 * Client Component専用のMenu API
 * Route Handler経由でBackendにアクセス
 */
export const menuApiClient = {
  /**
   * メニュー一覧取得（ツリー）
   */
  getList: async (params?: MenuQuery): Promise<Menu[]> => {
    const searchParams = new URLSearchParams();
    if (params?.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params?.visible !== undefined) {
      searchParams.set('visible', String(params.visible));
    }
    const query = searchParams.toString();
    return fetchApi<Menu[]>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  /**
   * メニュードロップダウン取得
   */
  getOptions: async (onlyParent?: boolean): Promise<MenuOption[]> => {
    const url = onlyParent ? `${BASE_URL}/options?onlyParent=true` : `${BASE_URL}/options`;
    return fetchApi<MenuOption[]>(url);
  },

  /**
   * 現在ユーザーのルート一覧取得
   */
  getRoutes: async (): Promise<unknown[]> => {
    return fetchApi<unknown[]>(`${BASE_URL}/routes`);
  },

  /**
   * メニュー編集フォーム用データ取得
   */
  getFormData: async (id: number): Promise<Menu> => {
    return fetchApi<Menu>(`${BASE_URL}/${id}/form`);
  },

  /**
   * メニュー作成
   */
  create: async (data: MenuForm): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * メニュー更新
   */
  update: async (id: number, data: MenuForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * メニュー削除
   */
  delete: async (id: number): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * 役割権限ダイアログ等で利用するメニュードロップダウン取得ヘルパー
 */
export async function getMenuOptions(onlyParent?: boolean): Promise<MenuOption[]> {
  return menuApiClient.getOptions(onlyParent);
}
