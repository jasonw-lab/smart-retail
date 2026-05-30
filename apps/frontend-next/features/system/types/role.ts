// 役割管理タイプ定義

export interface Role {
  id: number;
  name: string;
  code: string;
  status: number; // 1: 有効, 0: 無効
  sort: number;
  dataScope: number; // 1: 全て, 2: 部門とその子, 3: 部門のみ, 4: 自分のみ
  createTime?: string;
}

export interface RoleQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
}

export interface RoleForm {
  id?: number;
  name: string;
  code: string;
  status: number;
  sort: number;
  dataScope: number;
}

export interface RolePageResult {
  list: Role[];
  total: number;
}

export const DataScopeLabel: Record<number, string> = {
  1: '全データ',
  2: '部門＋子部門',
  3: '部門のみ',
  4: '本人のみ',
};

export interface MenuOption {
  value: number;
  label: string;
  children?: MenuOption[];
}
