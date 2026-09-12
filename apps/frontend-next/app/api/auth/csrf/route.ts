import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

/**
 * Issue a CSRF token using the Double Submit Cookie pattern.
 * The token is returned in the response body and also set as a non-httpOnly cookie
 * so that client-side JavaScript can read it and send it back as a header.
 */
export async function GET() {
  const token = generateCsrfToken();
  await setCsrfCookie(token);

  return NextResponse.json({ token });
}
