import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
  tenantId?: number;
}

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

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    // Backend認証API呼び出し
    // BACKEND_URL already includes /api/v1 prefix
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: response.status }
      );
    }

    const result: ApiResponse<AuthToken> = await response.json();

    if (result.code !== '00000') {
      return NextResponse.json(
        { error: result.msg || 'Authentication failed' },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken, expiresIn } = result.data;
    const cookieStore = await cookies();

    // httpOnly Cookieにトークンを保存
    // localhost ではSecureを無効化（開発・テスト環境対応）
    const isSecure =
      process.env.NODE_ENV === 'production' &&
      !process.env.BACKEND_URL?.includes('localhost');

    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn || 3600,
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
