import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// 認証不要のパス
const publicPaths = ['/login', '/api/auth/login'];

// 静的アセット
const staticPaths = ['/_next', '/favicon.ico', '/images'];

export function middleware(request: NextRequest) {
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
    // 未認証 - ログインページへリダイレクト
    const locale = pathname.match(/^\/(ja|en)/)?.[1] || 'ja';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
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
