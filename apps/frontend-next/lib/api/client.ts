/**
 * Client Component用のfetch wrapper
 * Route Handler経由でBackendにアクセス
 * 自動でトークンリフレッシュを行う
 */

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Client Component用のAPI fetch
 * Route Handler経由でBackendにアクセス
 */
export async function fetchApi<T>(path: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include', // Cookie送信
  });

  if (response.status === 401) {
    // 未認証 - ログインページへリダイレクト
    window.location.href = '/login';
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `API error: ${response.status}`,
      response.status,
      errorData.code
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export { ApiError };
