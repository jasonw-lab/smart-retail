// システムログタイプ定義

export interface Log {
  id: number;
  createTime: string;
  operator: string;
  module: string;
  content: string;
  ip: string;
  region?: string;
  browser?: string;
  os?: string;
  executionTime: number; // ms
}

export interface LogQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
  startTime?: string;
  endTime?: string;
}

export interface LogPageResult {
  list: Log[];
  total: number;
}
