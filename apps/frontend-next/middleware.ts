import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // 認証不要パスはスキップ
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // access_token Cookieの存在チェック
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // 未認証 - ログインページへリダイレクト
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
