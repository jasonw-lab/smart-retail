import { fetchFromBackend } from '@/lib/api/server';
import type { Menu } from '../types/menu';

/**
 * Server Component専用のMenu API
 * Backend直接fetch（Route Handler経由しない）
 */
export const menuApiServer = {
  /**
   * メニュー一覧取得（ツリー形式）
   */
  getList: (): Promise<Menu[]> => {
    return fetchFromBackend<Menu[]>('menus');
  },
};
