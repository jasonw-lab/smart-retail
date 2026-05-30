import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    // Backend refresh API呼び出し (refreshToken をクエリパラメータで送信)
    // BACKEND_URL already includes /api/v1 prefix
    const response = await fetch(
      `${BACKEND_URL}/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // リフレッシュ失敗 - Cookieをクリア
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    const result: ApiResponse<AuthToken> = await response.json();

    if (result.code !== '00000') {
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json(
        { error: result.msg || 'Token refresh failed' },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = result.data;

    // localhost ではSecureを無効化（開発・テスト環境対応）
    const isSecure =
      process.env.NODE_ENV === 'production' &&
      !process.env.BACKEND_URL?.includes('localhost');

    // 新しいトークンをCookieに保存
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn || 3600,
    });

    if (newRefreshToken) {
      cookieStore.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return NextResponse.json({ success: true, expiresIn });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
