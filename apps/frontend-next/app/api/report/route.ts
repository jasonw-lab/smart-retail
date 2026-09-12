import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * CSP violation reporting endpoint.
 *
 * In production, forward reports to Sentry or another logging service.
 * For now, we accept the report and return 204 to avoid noise in the browser console.
 */
export async function POST(request: Request) {
  try {
    const report = await request.json().catch(() => ({}));
    // Forward to Sentry or logging service here if needed.
    console.error('CSP violation report:', JSON.stringify(report));
  } catch {
    // Ignore malformed reports
  }

  return new NextResponse(null, { status: 204 });
}
