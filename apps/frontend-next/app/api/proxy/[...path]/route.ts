import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

/**
 * Client Component用のProxy Route Handler
 * /api/proxy/* へのリクエストをBackend APIに転送
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendPath = path.join('/');
  const url = new URL(`${BACKEND_URL}/${backendPath}`);

  // クエリパラメータを転送
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    if (backendResponse.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 204 No Content
    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const result: ApiResponse<unknown> = await backendResponse.json();

    if (result.code !== '00000') {
      return NextResponse.json(
        { error: result.msg || 'Backend API error', code: result.code },
        { status: 400 }
      );
    }

    // Result<T>のunwrap: dataのみを返す
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
