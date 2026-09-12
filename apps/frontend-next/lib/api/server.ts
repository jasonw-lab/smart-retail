import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocalMockUserFromToken } from '@/lib/auth/mock-auth';
import { unwrapApiResponse } from '@/lib/api/result';
import { serverEnv } from '@/lib/env/server';

const BACKEND_URL = serverEnv.BACKEND_URL;

/**
 * redirect()が投げるエラーかどうかを判定
 * Next.jsのredirect()はNEXT_REDIRECTというdigestを持つエラーを投げる
 */
export function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

/**
 * Server Component用のBackend直接fetch
 * httpOnly CookieからJWTを取得してBackendに転送
 * Result<T>のunwrapを内部で行い、dataのみを返す
 */
export async function fetchFromBackend<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const mockUser = getLocalMockUserFromToken(accessToken);
  if (mockUser && path === 'users/me') {
    return mockUser as T;
  }

  const url = `${BACKEND_URL}/${path}`;
  const hasExplicitCachePolicy =
    options?.cache !== undefined || (options as { next?: unknown } | undefined)?.next !== undefined;
  const response = await fetch(url, {
    ...(!hasExplicitCachePolicy ? { cache: 'no-store' as const } : {}),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // トークン期限切れ - ログインページへリダイレクト
    redirect('/login');
  }

  return unwrapApiResponse<T>(response);
}

/**
 * 認証不要のBackend fetch（ログインAPI等）
 */
export async function fetchFromBackendPublic<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}/${path}`;
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return unwrapApiResponse<T>(response);
}
