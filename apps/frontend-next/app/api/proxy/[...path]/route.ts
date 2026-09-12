import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_SUCCESS_CODE, statusFromApiCode, type ApiResponse } from '@/lib/api/result';
import { serverEnv } from '@/lib/env/server';
import { validateCsrfToken } from '@/lib/security/csrf';

const BACKEND_URL = serverEnv.BACKEND_URL;

/**
 * Client Component用のProxy Route Handler
 * /api/proxy/* へのリクエストをBackend APIに転送
 */
async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // CSRF protection for state-changing requests
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') {
    const valid = await validateCsrfToken(request);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
  }

  // path already includes 'api/v1/...' but BACKEND_URL already has /api/v1
  // So we strip the 'api/v1' prefix from path
  let backendPath = path.join('/');
  if (backendPath.startsWith('api/v1/')) {
    backendPath = backendPath.replace('api/v1/', '');
  }
  const url = new URL(`${BACKEND_URL}/${backendPath}`);

  // クエリパラメータを転送
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    const accept = request.headers.get('accept');

    if (contentType) headers.set('Content-Type', contentType);
    if (accept) headers.set('Accept', accept);
    headers.set('Authorization', `Bearer ${accessToken}`);

    const backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
    });

    if (backendResponse.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 204 No Content
    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const result: ApiResponse<unknown> = await backendResponse.json();

    if (result.code !== API_SUCCESS_CODE) {
      return NextResponse.json(
        { error: result.msg || 'Backend API error', code: result.code },
        {
          status: statusFromApiCode(result.code, backendResponse.ok ? 400 : backendResponse.status),
        }
      );
    }

    // Result<T>のunwrap: dataのみを返す
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
