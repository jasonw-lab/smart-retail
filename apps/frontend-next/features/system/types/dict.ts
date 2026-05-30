// 字典管理タイプ定義

export interface Dict {
  id: number;
  name: string;
  dictCode: string;
  status: number; // 1: 有効, 0: 無効
  remark?: string;
  createTime?: string;
}

export interface DictItem {
  id: number;
  dictId: number;
  dictCode: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string;
}

export interface DictQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
}

export interface DictItemQuery {
  pageNum: number;
  pageSize: number;
  dictCode: string;
  keywords?: string;
}

export interface DictForm {
  id?: number;
  name: string;
  dictCode: string;
  status: number;
  remark?: string;
}

export interface DictItemForm {
  id?: number;
  dictId?: number;
  dictCode: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string;
}

export interface DictPageResult {
  list: Dict[];
  total: number;
}

export interface DictItemPageResult {
  list: DictItem[];
  total: number;
}
