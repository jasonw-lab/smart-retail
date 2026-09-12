import { fetchApi } from '@/lib/api/client';
import type {
  User,
  UserQuery,
  UserPageResult,
  UserForm,
  UserProfile,
  PasswordChangeRequest,
} from '../types/user';
import type { UserFormValues, ProfileFormValues } from '../schemas/user-schema';

const BASE_URL = '/api/proxy/api/v1/users';

function buildUserQueryParams(params: UserQuery): URLSearchParams {
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.keywords) {
    searchParams.set('keywords', params.keywords);
  }
  if (params.status !== undefined) {
    searchParams.set('status', String(params.status));
  }
  if (params.deptId) {
    searchParams.set('deptId', String(params.deptId));
  }
  if (params.startTime) {
    searchParams.set('startTime', params.startTime);
  }
  if (params.endTime) {
    searchParams.set('endTime', params.endTime);
  }
  return searchParams;
}

/**
 * Client Component専用のUser API
 * Route Handler経由でBackendにアクセス
 */
export const userApiClient = {
  /**
   * ユーザー一覧取得（ページネーション）
   */
  getPage: async (params: UserQuery): Promise<UserPageResult> => {
    return fetchApi<UserPageResult>(`${BASE_URL}?${buildUserQueryParams(params).toString()}`);
  },

  /**
   * ユーザー詳細取得
   */
  getById: async (id: number): Promise<User> => {
    return fetchApi<User>(`${BASE_URL}/${id}`);
  },

  /**
   * 編集フォーム用データ取得
   */
  getFormData: async (id: number): Promise<UserForm> => {
    return fetchApi<UserForm>(`${BASE_URL}/${id}/form`);
  },

  /**
   * ユーザー作成
   */
  create: async (data: UserFormValues): Promise<void> => {
    await fetchApi<void>(BASE_URL, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * ユーザー更新
   */
  update: async (id: number, data: UserFormValues): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * ユーザー一括削除
   * ids はカンマ区切りのユーザーID
   */
  delete: async (ids: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${ids}`, {
      method: 'DELETE',
    });
  },

  /**
   * パスワードリセット
   */
  resetPassword: async (id: number, password: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/${id}/password?password=${encodeURIComponent(password)}`, {
      method: 'PATCH',
    });
  },

  /**
   * ログインユーザーのプロフィール取得
   */
  getProfile: async (): Promise<UserProfile> => {
    return fetchApi<UserProfile>(`${BASE_URL}/profile`);
  },

  /**
   * ログインユーザーのプロフィール更新
   */
  updateProfile: async (data: ProfileFormValues): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/profile`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * ログインユーザーのパスワード変更
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}/password`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * ユーザー一覧エクスポート
   * Blob レスポンスを扱うため fetchApi ではなく生の fetch を使用
   */
  exportUsers: async (params: UserQuery): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    if (params.keywords) {
      searchParams.set('keywords', params.keywords);
    }
    if (params.status !== undefined) {
      searchParams.set('status', String(params.status));
    }
    if (params.deptId) {
      searchParams.set('deptId', String(params.deptId));
    }
    if (params.startTime) {
      searchParams.set('startTime', params.startTime);
    }
    if (params.endTime) {
      searchParams.set('endTime', params.endTime);
    }

    const res = await fetch(`${BASE_URL}/export?${searchParams.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to export users');
    }
    return res.blob();
  },
};
