import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE;
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER;
}

export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value;
}

export async function setCsrfCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate that the CSRF token in the request header matches the cookie value.
 * This implements the Double Submit Cookie pattern.
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) {
    return false;
  }

  const cookieHash = createHash('sha256').update(cookieToken).digest('hex');
  const headerHash = createHash('sha256').update(headerToken).digest('hex');
  const cookieBuffer = Buffer.from(cookieHash, 'hex');
  const headerBuffer = Buffer.from(headerHash, 'hex');

  return cookieToken.length === headerToken.length && timingSafeEqual(cookieBuffer, headerBuffer);
}
