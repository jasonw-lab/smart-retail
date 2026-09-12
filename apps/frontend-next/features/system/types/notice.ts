// 通知公告管理タイプ定義

export interface Notice {
  id: string;
  title: string;
  content?: string;
  type?: number; // 1: 通知, 2: 公告 等
  priority?: number; // 0: 低, 1: 中, 2: 高
  level?: string; // 'L': 低, 'M': 中, 'H': 高
  targetType?: number; // 0: 全体, 1: 指定
  targetUserIds?: string;
  publishStatus?: number; // 0: 未発行, 1: 発行済, 2: 撤回済
  publishTime?: string;
  revokeTime?: string;
  createTime?: string;
}

export interface NoticeQuery {
  pageNum: number;
  pageSize: number;
  title?: string;
  publishStatus?: number;
  isRead?: number;
}

export interface NoticeForm {
  id?: string;
  title: string;
  content?: string;
  type?: number;
  priority?: number;
  level?: string;
  targetType?: number;
  targetUserIds?: string;
}

export interface NoticeDetail {
  id?: string;
  title?: string;
  content?: string;
  type?: number;
  publisherName?: string;
  level?: string;
  publishTime?: string;
  publishStatus?: number;
}

export interface NoticePageResult {
  list: Notice[];
  total: number;
}
