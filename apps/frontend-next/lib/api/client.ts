/**
 * Client Component用のfetch wrapper
 * Route Handler経由でBackendにアクセス
 * 401時に自動でトークンリフレッシュを試行
 */

import { getUserLocale } from '@/i18n/locale';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 1;

let csrfPromise: Promise<string | null> | null = null;

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function fetchCsrfToken(): Promise<string | null> {
  if (csrfPromise) return csrfPromise;
  csrfPromise = (async (): Promise<string | null> => {
    const cookieToken = readCsrfCookie();
    if (cookieToken) return cookieToken;
    try {
      const response = await fetch('/api/auth/csrf', { credentials: 'include' });
      if (!response.ok) return null;
      const data = (await response.json()) as { token?: string };
      return data.token ?? null;
    } catch {
      return null;
    }
  })().then((token) => {
    if (!token) csrfPromise = null;
    return token;
  });
  return csrfPromise;
}

function isMutatingMethod(method?: string): boolean {
  const m = method?.toUpperCase() ?? 'GET';
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
}

function isIdempotentMethod(method?: string): boolean {
  const m = method?.toUpperCase() ?? 'GET';
  return m === 'GET' || m === 'HEAD';
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

function createAbortSignal(
  timeoutMs: number,
  parentSignal?: AbortSignal | null
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const cleanup = () => clearTimeout(id);

  if (!parentSignal) {
    return { signal: controller.signal, cleanup };
  }

  if (parentSignal.aborted) {
    controller.abort();
    return { signal: controller.signal, cleanup };
  }

  const abortFromParent = () => controller.abort();
  parentSignal.addEventListener('abort', abortFromParent, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      parentSignal.removeEventListener('abort', abortFromParent);
      cleanup();
    },
  };
}

function redirectToLogin(redirectPath?: string) {
  if (typeof window === 'undefined') return;
  const locale = getUserLocale();
  const base = locale === 'ja' ? '' : `/${locale}`;
  let redirect = redirectPath;
  if (!redirect || redirect.startsWith('/api/')) {
    redirect = window.location.pathname + window.location.search;
  }
  window.location.href = `${base}/login?redirect=${encodeURIComponent(redirect)}`;
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
  const timeoutMs = typeof options?.timeout === 'number' ? options.timeout : DEFAULT_TIMEOUT_MS;

  let lastError: Error | undefined;

  const needsCsrf = isMutatingMethod(options?.method);
  let csrfToken = needsCsrf ? await fetchCsrfToken() : null;
  let csrfRetried = false;
  const canRetry = isIdempotentMethod(options?.method);

  for (let attempt = 0; attempt <= (canRetry ? MAX_RETRIES : 0); attempt++) {
    const { signal, cleanup } = createAbortSignal(timeoutMs, options?.signal);
    try {
      const response = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        credentials: 'include', // Cookie送信
        signal,
      });

      if (response.status === 401 && !isRetry) {
        // 401かつ初回リクエストの場合、リフレッシュを試行

        // 既にリフレッシュ中なら待機
        if (isRefreshing && refreshPromise) {
          const refreshed = await refreshPromise;
          if (refreshed) {
            return await fetchApi<T>(path, options, true);
          }
        } else {
          // リフレッシュ開始
          isRefreshing = true;
          refreshPromise = refreshToken();

          try {
            const refreshed = await refreshPromise;
            if (refreshed) {
              // リフレッシュ成功 - 元のリクエストをリトライ
              return await fetchApi<T>(path, options, true);
            }
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        }

        // リフレッシュ失敗 - ログインページへ
        redirectToLogin();
        throw new ApiError('Unauthorized', 401);
      }

      if (response.status === 401) {
        // リトライ後も401 - ログインページへ
        redirectToLogin();
        throw new ApiError('Unauthorized', 401);
      }

      if (response.status === 403 && needsCsrf && !csrfRetried) {
        csrfPromise = null;
        csrfToken = await fetchCsrfToken();
        csrfRetried = true;
        continue;
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

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // ユーザー中断やAbortErrorは即座に中断して再試行しない
      if (lastError.name === 'AbortError' || options?.signal?.aborted) {
        break;
      }

      // 非冪等メソッドまたはリトライ上限超過時は再試行しない
      if (!canRetry || attempt >= MAX_RETRIES) {
        break;
      }

      const isNetworkError =
        lastError.name === 'TypeError' ||
        lastError.message.includes('fetch');

      if (!isNetworkError) {
        break;
      }

      // 簡易 exponential backoff (100ms, 200ms)
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    } finally {
      cleanup();
    }
  }

  throw lastError ?? new ApiError('Unknown API error', 0);
}

export { ApiError };
