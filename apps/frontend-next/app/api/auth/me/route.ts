import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

interface UserInfo {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
}

interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Backend user info API呼び出し
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: response.status }
      );
    }

    const result: ApiResponse<UserInfo> = await response.json();

    if (result.code !== '00000') {
      return NextResponse.json(
        { error: result.msg || 'Failed to fetch user info' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
