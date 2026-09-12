import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
const BACKEND_URL = process.env.BACKEND_URL;

// 認証不要のパス
const publicPaths = ['/login', '/api/auth/login'];

// 静的アセット
const staticPaths = ['/_next', '/favicon.ico', '/images'];

interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface ApiResponse<T> {
  code: string;
  data: T;
}

async function refreshAccessToken(refreshToken: string): Promise<AuthToken | null> {
  if (!BACKEND_URL) return null;

  try {
    const response = await fetch(
      `${BACKEND_URL}/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) return null;

    const result = (await response.json()) as ApiResponse<AuthToken>;
    if (result.code !== '00000') return null;

    return result.data;
  } catch {
    return null;
  }
}

function setAuthCookies(response: NextResponse, token: AuthToken) {
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set('access_token', token.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expiresIn || 3600,
  });

  if (token.refreshToken) {
    response.cookies.set('refresh_token', token.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }
}

function redirectToLogin(request: NextRequest, pathnameWithoutLocale: string) {
  const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] || 'ja';
  const loginUrl = new URL(`/${locale}/login`, request.url);
  loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的アセットはスキップ
  if (staticPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // API Routeはスキップ（個別で認証チェック）
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // i18nミドルウェアを適用
  const response = intlMiddleware(request);

  // 認証不要パスはスキップ（ロケールプレフィックス考慮）
  const pathnameWithoutLocale = pathname.replace(/^\/(ja|en)/, '') || '/';
  if (publicPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
    return response;
  }

  // access_token Cookieの存在チェック
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      const token = await refreshAccessToken(refreshToken);
      if (token) {
        const retryResponse = NextResponse.redirect(new URL(request.url));
        setAuthCookies(retryResponse, token);
        return retryResponse;
      }
    }

    return redirectToLogin(request, pathnameWithoutLocale);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
