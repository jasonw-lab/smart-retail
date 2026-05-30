// ユーザー管理タイプ定義

export interface User {
  id: number;
  username: string;
  nickname: string;
  gender: number; // 1: 男性, 2: 女性, 0: 不明
  deptId: number;
  deptName: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  status: number; // 1: 有効, 0: 無効
  createTime: string;
  roleIds?: number[];
  roleNames?: string[];
}

export interface UserQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
  status?: number;
  deptId?: number;
  startTime?: string;
  endTime?: string;
}

export interface UserForm {
  id?: number;
  username: string;
  nickname: string;
  gender: number;
  deptId: number;
  mobile?: string;
  email?: string;
  status: number;
  roleIds: number[];
  password?: string;
}

export interface UserPageResult {
  list: User[];
  total: number;
}

export const GenderLabel: Record<number, string> = {
  0: '不明',
  1: '男性',
  2: '女性',
};
