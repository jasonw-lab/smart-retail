import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { storeTicket } from '@/lib/ws/ticket-store';

/**
 * WebSocket接続用の短寿命チケットを発行
 * XSSリスク軽減のため、accessTokenを直接返さない
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 短寿命（30秒）のワンタイムチケットを発行
  const ticket = randomUUID();
  storeTicket(ticket, accessToken, 30);

  return NextResponse.json({ ticket, expiresIn: 30 });
}
