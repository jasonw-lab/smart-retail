import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET() {
  try {
    // BACKEND_URL already includes /api/v1 prefix
    const response = await fetch(`${BACKEND_URL}/auth/captcha`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // バックエンド未実装時はダミーキャプチャを返す
      return NextResponse.json({
        captchaId: 'dummy-captcha-id',
        captchaBase64:
          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+QTFCMjwvdGV4dD48L3N2Zz4=',
      });
    }

    const data = await response.json();

    // バックエンドのレスポンス形式に合わせて変換
    return NextResponse.json({
      captchaId: data.data?.captchaId || data.captchaId,
      captchaBase64: data.data?.captchaBase64 || data.captchaBase64,
    });
  } catch {
    // エラー時はダミーキャプチャを返す
    return NextResponse.json({
      captchaId: 'dummy-captcha-id',
      captchaBase64:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+QTFCMjwvdGV4dD48L3N2Zz4=',
    });
  }
}
