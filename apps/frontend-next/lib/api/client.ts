/**
 * Client Component用のfetch wrapper
 * Route Handler経由でBackendにアクセス
 * 401時に自動でトークンリフレッシュを試行
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

// リフレッシュ中かどうかのフラグ（重複リフレッシュ防止）
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * トークンをリフレッシュ
 * @returns リフレッシュ成功時true、失敗時false
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Client Component用のAPI fetch
 * Route Handler経由でBackendにアクセス
 * 401時に一度だけリフレッシュを試行し、成功すればリトライ
 */
export async function fetchApi<T>(
  path: string,
  options?: FetchOptions,
  isRetry = false
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include', // Cookie送信
  });

  if (response.status === 401 && !isRetry) {
    // 401かつ初回リクエストの場合、リフレッシュを試行

    // 既にリフレッシュ中なら待機
    if (isRefreshing && refreshPromise) {
      const refreshed = await refreshPromise;
      if (refreshed) {
        return fetchApi<T>(path, options, true);
      }
    } else {
      // リフレッシュ開始
      isRefreshing = true;
      refreshPromise = refreshToken();

      try {
        const refreshed = await refreshPromise;
        if (refreshed) {
          // リフレッシュ成功 - 元のリクエストをリトライ
          return fetchApi<T>(path, options, true);
        }
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    // リフレッシュ失敗 - ログインページへ
    window.location.href = '/login';
    throw new ApiError('Unauthorized', 401);
  }

  if (response.status === 401) {
    // リトライ後も401 - ログインページへ
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
