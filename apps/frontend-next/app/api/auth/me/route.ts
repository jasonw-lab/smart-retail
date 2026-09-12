import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BackendApiError, unwrapApiResponse } from '@/lib/api/result';
import { getLocalMockUserFromToken } from '@/lib/auth/mock-auth';
import { serverEnv } from '@/lib/env/server';
import type { UserInfo } from '@/types/api';

const BACKEND_URL = serverEnv.BACKEND_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mockUser = getLocalMockUserFromToken(accessToken);
    if (mockUser) {
      return NextResponse.json(mockUser);
    }

    // Backend user info API呼び出し
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    return NextResponse.json(await unwrapApiResponse<UserInfo>(response));
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error('Get user info error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
