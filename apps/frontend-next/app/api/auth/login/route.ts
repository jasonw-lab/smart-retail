import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateLocalMockUser, isLocalMockAuthEnabled } from '@/lib/auth/mock-auth';
import { serverEnv } from '@/lib/env/server';
import { getClientIp, isRateLimited } from '@/lib/security/rate-limit';

const BACKEND_URL = serverEnv.BACKEND_URL;

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

async function setAuthCookies(token: AuthToken) {
  const cookieStore = await cookies();

  const isSecure = process.env.NODE_ENV === 'production';

  cookieStore.set('access_token', token.accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expiresIn || 3600,
  });

  cookieStore.set('refresh_token', token.refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (isRateLimited(`login:${clientIp}`, { limit: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body: LoginRequest = await request.json();
    let result: ApiResponse<AuthToken> | null = null;

    // If captchaCode is empty, omit captchaId & captchaCode so backend can bypass optional captcha
    const loginPayload: Record<string, unknown> = {
      username: body.username,
      password: body.password,
    };
    if (body.tenantId !== undefined) {
      loginPayload.tenantId = body.tenantId;
    }
    if (body.captchaCode && body.captchaCode.trim() !== '') {
      loginPayload.captchaId = body.captchaId;
      loginPayload.captchaCode = body.captchaCode.trim();
    }

    // Backend認証API呼び出し
    // BACKEND_URL already includes /api/v1 prefix
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        let errorMsg = 'Authentication failed';
        try {
          const errData = await response.json();
          errorMsg = errData?.msg || errData?.message || errorMsg;
        } catch {
          // ignore
        }
        return NextResponse.json({ error: errorMsg }, { status: response.status });
      }

      result = await response.json();
    } catch (error) {
      const mockToken = authenticateLocalMockUser(body.username, body.password);
      if (!mockToken) {
        if (isLocalMockAuthEnabled()) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        throw error;
      }

      await setAuthCookies(mockToken);
      return NextResponse.json({ success: true, mock: true });
    }

    if (!result) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    if (result.code !== '00000') {
      return NextResponse.json({ error: result.msg || 'Authentication failed' }, { status: 401 });
    }

    await setAuthCookies(result.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
