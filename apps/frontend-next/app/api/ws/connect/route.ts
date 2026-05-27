import { NextResponse } from 'next/server';
import { validateAndConsumeTicket } from '@/lib/ws/ticket-store';

/**
 * WebSocket接続用のトークン交換エンドポイント
 * 短寿命チケットをaccessTokenに交換
 */
export async function POST(request: Request) {
  try {
    const { ticket } = await request.json();

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket is required' },
        { status: 400 }
      );
    }

    const accessToken = validateAndConsumeTicket(ticket);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid or expired ticket' },
        { status: 401 }
      );
    }

    // accessTokenを返す（短寿命チケット検証後のみ）
    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error('WebSocket connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
