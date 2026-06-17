import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocalMockUserFromToken } from '@/lib/auth/mock-auth';

const BACKEND_URL = process.env.BACKEND_URL;

interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

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
export async function fetchFromBackend<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
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
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
    // Next.js cache configuration
    next: {
      revalidate: 60, // 60秒キャッシュ
      ...((options as { next?: { revalidate?: number } })?.next || {}),
    },
  });

  if (response.status === 401) {
    // トークン期限切れ - ログインページへリダイレクト
    redirect('/login');
  }

  if (!response.ok) {
    throw new Error(
      `Backend API error: ${response.status} ${response.statusText}`
    );
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== '00000') {
    throw new Error(result.msg || 'Backend API error');
  }

  return result.data;
}

/**
 * 認証不要のBackend fetch（ログインAPI等）
 */
export async function fetchFromBackendPublic<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_URL}/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Backend API error: ${response.status} ${response.statusText}`
    );
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== '00000') {
    throw new Error(result.msg || 'Backend API error');
  }

  return result.data;
}
