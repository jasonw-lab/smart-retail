// システム設定管理タイプ定義

export interface Config {
  id: string;
  configName: string;
  configKey: string;
  configValue: string;
  remark?: string;
  createTime?: string;
}

export interface ConfigQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
}

export interface ConfigForm {
  id?: string;
  configName: string;
  configKey: string;
  configValue: string;
  remark?: string;
}

export interface ConfigPageResult {
  list: Config[];
  total: number;
}
