/**
 * Backend API共通型定義
 */

/**
 * ページネーション結果
 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/**
 * ページネーションクエリパラメータ
 */
export interface PageQuery {
  pageNum: number;
  pageSize: number;
}

/**
 * Backend API Result wrapper
 */
export interface ApiResult<T> {
  code: string;
  msg: string;
  data: T;
}

/**
 * 認証トークン
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
}

/**
 * ユーザー情報
 */
export interface UserInfo {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
}
