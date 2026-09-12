import { NextResponse } from 'next/server';

// SSE リスナーのセット（インメモリ管理）
type Listener = (data: string) => void;
const listeners = new Set<Listener>();

export const dynamic = 'force-dynamic';

/**
 * GET /api/dev/reload
 * 開発環境限定: ブラウザクライアント向けの SSE (Server-Sent Events) エンドポイント
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  let currentListener: Listener;
  const stream = new ReadableStream({
    start(controller) {
      currentListener = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        } catch {
          // controller closed
        }
      };
      listeners.add(currentListener);

      // 初回接続確認用ハートビート
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ action: 'connected' })}\n\n`));
    },
    cancel() {
      if (currentListener) {
        listeners.delete(currentListener);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

/**
 * POST /api/dev/reload
 * 開発環境限定: Git Hook やビルドスクリプトからのリロード・再フェッチシグナル受付
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const payload = await req.json().catch(() => ({ action: 'refetch' }));
  const message = JSON.stringify(payload);

  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch {
      listeners.delete(listener);
    }
  });

  return NextResponse.json({
    success: true,
    clientCount: listeners.size,
    broadcastedAction: payload.action,
  });
}
