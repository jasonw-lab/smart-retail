// メニュー管理タイプ定義

export const MenuType = {
  CATALOG: 1,
  MENU: 2,
  BUTTON: 3,
  EXTLINK: 4,
} as const;

export type MenuTypeValue = (typeof MenuType)[keyof typeof MenuType];

export const MenuTypeLabel: Record<MenuTypeValue, string> = {
  [MenuType.CATALOG]: 'カタログ',
  [MenuType.MENU]: 'メニュー',
  [MenuType.BUTTON]: 'ボタン',
  [MenuType.EXTLINK]: '外部リンク',
};

export const MenuTypeColor: Record<
  MenuTypeValue,
  'warning' | 'success' | 'error' | 'info'
> = {
  [MenuType.CATALOG]: 'warning',
  [MenuType.MENU]: 'success',
  [MenuType.BUTTON]: 'error',
  [MenuType.EXTLINK]: 'info',
};

export interface Menu {
  id: number;
  parentId: number;
  name: string;
  type: MenuTypeValue;
  routeName?: string;
  routePath?: string;
  component?: string;
  perm?: string;
  icon?: string;
  sort: number;
  visible: number; // 1: 表示, 0: 非表示
  redirect?: string;
  alwaysShow?: number;
  keepAlive?: number;
  params?: { key: string; value: string }[];
  children?: Menu[];
}

export interface MenuQuery {
  keywords?: string;
}

export interface MenuForm {
  id?: number;
  parentId: number;
  name: string;
  type: MenuTypeValue;
  routeName?: string;
  routePath?: string;
  component?: string;
  perm?: string;
  icon?: string;
  sort: number;
  visible: number;
  redirect?: string;
  alwaysShow?: number;
  keepAlive?: number;
  params?: { key: string; value: string }[];
}

export interface MenuOption {
  value: number;
  label: string;
  children?: MenuOption[];
}
