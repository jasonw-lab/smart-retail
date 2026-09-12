import { fetchApi } from '@/lib/api/client';
import type { Role, RoleQuery, RolePageResult, RoleForm, RoleOption } from '../types/role';

const BASE_URL = '/api/proxy/api/v1/roles';

/**
 * Client Component専用のRole API
 * Route Handler経由でBackendにアクセス
 */
export const roleApiClient = {
  /**
   * 役割一覧取得（ページネーション）
   */
  getPage: async (params: RoleQuery): Promise<RolePageResult> => {
    const searchParams = new URLSearchParams({
      pageNum: String(params.pageNum),
      pageSize: String(params.pageSize),
    });
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    return fetchApi<RolePageResult>(`${BASE_URL}/page?${searchParams.toString()}`);
  },

  /**
   * 役割ドロップダウン取得
   */
  getOptions: async (): Promise<RoleOption[]> => {
    return fetchApi<RoleOption[]>(`${BASE_URL}/options`);
  },

  /**
   * 役割詳細取得
   */
  getById: async (id: number): Promise<Role> => {
    return fetchApi<Role>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 役割編集フォームデータ取得
   */
  getFormData: async (id: number): Promise<RoleForm> => {
    return fetchApi<RoleForm>(`${BASE_URL}/${id}/form`);
  },

  /**
   * 役割に割り当て済みのメニューID取得
   */
  getMenuIds: async (roleId: number): Promise<number[]> => {
    return fetchApi<number[]>(`${BASE_URL}/${roleId}/menu-ids`);
  },

  /**
   * 役割のメニュー権限更新
   */
  updateMenus: async (roleId: number, menuIds: number[]): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${roleId}/menus`, {
      method: 'PUT',
      body: menuIds,
    });
  },

  /**
   * 役割作成
   */
  create: async (data: RoleForm): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 役割更新
   */
  update: async (id: number, data: RoleForm): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 役割一括削除（カンマ区切りのID文字列）
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },
};
