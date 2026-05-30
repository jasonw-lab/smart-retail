// 部門管理タイプ定義

export interface Dept {
  id: number;
  parentId: number;
  name: string;
  code: string;
  sort: number;
  status: number; // 1: 有効, 0: 無効
  children?: Dept[];
}

export interface DeptQuery {
  keywords?: string;
  status?: number;
}

export interface DeptForm {
  id?: number;
  parentId: number;
  name: string;
  code: string;
  sort: number;
  status: number;
}

export interface DeptOption {
  value: number;
  label: string;
  children?: DeptOption[];
}
