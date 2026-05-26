# ADR-002: JWT認証をApp Routerでどう扱うか

## ステータス
承認済み (2025-05) / 改訂 (2026-05)

## 背景
既存のVue3版フロントエンドでは、JWTトークン（accessToken / refreshToken）をlocalStorageに保存し、axiosインターセプターで自動付与している。バックエンドはSpring Boot + Spring Securityで、JWT認証を提供。

App Router環境では、Server ComponentsとClient Componentsが混在するため、トークンの保管場所とリクエストへの付与方法を再設計する必要がある。

### 既存バックエンドAPI仕様
| API | メソッド | パス | リクエスト形式 |
|-----|---------|------|---------------|
| ログイン | POST | `/api/v1/auth/login` | `multipart/form-data` (username, password, captchaKey, captchaCode) |
| キャプチャ取得 | GET | `/api/v1/auth/captcha` | - |
| トークンリフレッシュ | POST | `/api/v1/auth/refresh-token?refreshToken=xxx` | query param |
| ログアウト | DELETE | `/api/v1/auth/logout` | Authorization header |

### 既存Vue版の認証フロー
1. `/api/v1/auth/captcha` でキャプチャ取得
2. `/api/v1/auth/login` でログイン → accessToken / refreshToken を取得
3. localStorageに保存
4. axiosインターセプターでAuthorizationヘッダーに付与
5. 401発生時にrefreshTokenでリフレッシュ
6. refreshToken期限切れでログイン画面へリダイレクト

## 検討した選択肢

### 選択肢1: クライアント保持（localStorage）+ Client Component fetch
- Vue版と同様の方式
- トークンをlocalStorageに保存
- Client ComponentからAPIを直接呼び出し

### 選択肢2: Route Handler BFF経由（全経路統一）
- トークンをhttpOnly Cookieに保存
- Server Component / Client Component共にRoute Handler経由

### 選択肢3: ハイブリッドアプローチ（採用）
- トークンをhttpOnly Cookieに保存
- **Server Component → Backend直接fetch**
- **Client Component → Route Handler経由**
- 事前トークンリフレッシュでServer Componentの401を最小化

## 決定
**ハイブリッドアプローチ（選択肢3）を採用する。**

### 採用理由

1. **Next.js公式推奨に準拠**
   - Server ComponentからRoute Handlerへの内部fetchは[公式でアンチパターン](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
   - 追加のネットワークホップを回避

2. **Docker/K8s環境での安定性**
   - 内部fetchはlocalhost解決問題が発生しやすい
   - Backend直接fetchなら環境依存が少ない

3. **パフォーマンス**
   - Server Componentの初期ロードが高速化
   - fetch memoizationの恩恵を受けられる

4. **セキュリティ**
   - httpOnly Cookieによりトークンがクライアントサイドのスクリプトから直接アクセス不可
   - XSS攻撃への耐性が向上

### 設計方針

```
┌─────────────────────────────────────────────────────────────┐
│                    ハイブリッド認証フロー                    │
├─────────────────────────────────────────────────────────────┤
│  Server Component  →  Backend直接fetch                      │
│                       （Cookie読み取り、401時はログインへ）  │
│                                                             │
│  Client Component  →  Route Handler → Backend               │
│                       （トークンリフレッシュ対応）           │
│                                                             │
│  事前リフレッシュ   →  Client側で残り5分でリフレッシュ      │
│                       （Server Componentの401を最小化）     │
└─────────────────────────────────────────────────────────────┘
```

### 認証フロー

```
[Login]
Browser → Route Handler(/api/auth/login)
           → FormData変換
           → Backend(POST /api/v1/auth/login, multipart/form-data)
           ← { accessToken, refreshToken, tokenType, expiresIn }
         ← Set-Cookie: access_token, refresh_token (httpOnly)

[API Request - Server Component]
Server Component → Backend直接fetch
                   → cookies().get('access_token')
                   → Backend API (Authorization: Bearer xxx)
                   ← Response
                 ← データ or 401時はログインへリダイレクト

[API Request - Client Component]
Client Component → Route Handler(/api/proxy/*)
                   → cookies().get('access_token')
                   → Backend API
                   ← 401時は自動リフレッシュ + リトライ
                 ← JSON Response

[Proactive Token Refresh - Client側]
useProactiveTokenRefresh() → 4分ごとにトークン残り時間チェック
                           → 残り5分以下なら /api/auth/refresh
                           → Cookie更新
                           → Server Componentの401発生を最小化

[Logout]
Browser → Route Handler(/api/auth/logout)
           → Backend(DELETE /api/v1/auth/logout)
           → cookies().delete('access_token')
           → cookies().delete('refresh_token')
         ← Redirect to /login
```

### 実装

#### ログイン Route Handler

```typescript
// app/api/auth/login/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: Request) {
  const body = await request.json();

  // FormDataに変換（既存バックエンド仕様に合わせる）
  const formData = new FormData();
  formData.append('username', body.username);
  formData.append('password', body.password);
  formData.append('captchaKey', body.captchaKey);
  formData.append('captchaCode', body.captchaCode);

  const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.code === '00000') {
    const { accessToken, refreshToken, expiresIn } = result.data;
    const cookieStore = await cookies();

    // httpOnly Cookieに保存
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    // expiresInも保存（事前リフレッシュ判定用）
    cookieStore.set('token_expires_at', String(Date.now() + expiresIn * 1000), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日
      path: '/',
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: result.msg }, { status: 401 });
}
```

#### Server Component用 API関数

```typescript
// lib/api/server.ts
// Server Component専用 - Backend直接fetch（Route Handler経由しない）
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function fetchFromBackend<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Server ComponentではCookie更新不可 → ログインへリダイレクト
  if (response.status === 401) {
    redirect('/login?reason=session_expired');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result = await response.json();

  // Result<T> unwrap
  if (result.code === '00000') {
    return result.data;
  }

  throw new Error(result.msg || 'Unknown error');
}
```

#### Client Component用 Route Handler

```typescript
// app/api/proxy/[...path]/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // CSRF対策
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }
  }

  const pathStr = path.join('/');
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/api/v1/${pathStr}${url.search}`;

  // リクエスト実行
  let response = await fetchWithAuth(backendUrl, request, accessToken);

  // 401の場合、トークンリフレッシュを試行
  if (response.status === 401 && refreshToken) {
    const refreshResult = await refreshAccessToken(refreshToken);

    if (refreshResult.success) {
      // 新しいトークンでCookie更新
      cookieStore.set('access_token', refreshResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshResult.expiresIn,
        path: '/',
      });

      cookieStore.set('token_expires_at', String(Date.now() + refreshResult.expiresIn * 1000), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshResult.expiresIn,
        path: '/',
      });

      if (refreshResult.refreshToken) {
        cookieStore.set('refresh_token', refreshResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }

      // リトライ
      response = await fetchWithAuth(backendUrl, request, refreshResult.accessToken);
    } else {
      return NextResponse.json(
        { code: 'AUTH_EXPIRED', message: 'Session expired' },
        { status: 401 }
      );
    }
  }

  const data = await response.json();

  // Result<T>のunwrap
  if (data.code === '00000') {
    return NextResponse.json(data.data);
  }

  return NextResponse.json(data, { status: response.status });
}

async function fetchWithAuth(url: string, request: NextRequest, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    method: request.method,
    headers,
    body: request.method !== 'GET' ? await request.text() : undefined,
  });
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(
    `${BACKEND_URL}/api/v1/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
    { method: 'POST' }
  );

  const result = await response.json();

  if (result.code === '00000') {
    return {
      success: true,
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      expiresIn: result.data.expiresIn,
    };
  }

  return { success: false };
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
```

#### 事前トークンリフレッシュ

```typescript
// app/api/auth/check-expiry/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const expiresAt = cookieStore.get('token_expires_at')?.value;

  if (!expiresAt) {
    return NextResponse.json({ expiresIn: 0 });
  }

  const expiresIn = Math.max(0, Math.floor((Number(expiresAt) - Date.now()) / 1000));
  return NextResponse.json({ expiresIn });
}
```

```typescript
// app/api/auth/refresh/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
    { method: 'POST' }
  );

  const result = await response.json();

  if (result.code === '00000') {
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = result.data;

    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    cookieStore.set('token_expires_at', String(Date.now() + expiresIn * 1000), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    if (newRefreshToken) {
      cookieStore.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
```

```typescript
// hooks/use-proactive-token-refresh.ts
'use client';

import { useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 4 * 60 * 1000; // 4分
const REFRESH_THRESHOLD = 5 * 60; // 残り5分

export function useProactiveTokenRefresh() {
  const checkAndRefresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check-expiry');
      if (!res.ok) return;

      const { expiresIn } = await res.json();

      if (expiresIn > 0 && expiresIn < REFRESH_THRESHOLD) {
        await fetch('/api/auth/refresh', { method: 'POST' });
      }
    } catch {
      // エラー時は次回チェックに委ねる
    }
  }, []);

  useEffect(() => {
    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkAndRefresh]);
}
```

```typescript
// components/providers/auth-provider.tsx
'use client';

import { useProactiveTokenRefresh } from '@/hooks/use-proactive-token-refresh';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useProactiveTokenRefresh();
  return <>{children}</>;
}
```

```typescript
// app/(dashboard)/layout.tsx
import { AuthProvider } from '@/components/providers/auth-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen">
        {/* Sidebar, Header等 */}
        <main>{children}</main>
      </div>
    </AuthProvider>
  );
}
```

## 却下した選択肢の理由

### クライアント保持（localStorage）を却下した理由
- **XSS脆弱性**: localStorageはJavaScriptから直接アクセス可能
- **Server Componentsとの不整合**: Server ComponentからはlocalStorageにアクセス不可
- **SSR時のhydrationミスマッチリスク**: サーバーとクライアントで認証状態が異なる可能性

### Route Handler BFF経由（全経路統一）を却下した理由
- **アンチパターン**: Server ComponentからRoute Handlerへの内部fetchはNext.js公式で非推奨
- **Docker/K8s問題**: localhost解決が環境依存で不安定
- **パフォーマンス**: 不要なネットワークホップが発生

## トレードオフ

### 受け入れるリスク
- Server Componentで401発生時はログインへリダイレクト（自動リフレッシュなし）
- 事前リフレッシュの間隔（4分）を超えて離席した場合は再ログイン必要
- Server/Client間でAPI呼び出しパターンが異なる

### 軽減策
- 事前リフレッシュにより、アクティブユーザーは401をほぼ経験しない
- accessToken有効期限30分、残り5分でリフレッシュ → 25分以上離席時のみ再ログイン
- API関数を`*.server.ts`/`*.client.ts`で明確に分離

### CSRF対策

httpOnly Cookie + SameSite=Lax を採用するため、追加のCSRF対策が必要:

| 対策 | 実装場所 | 目的 |
|-----|---------|------|
| SameSite=Lax | Cookie設定 | 他サイトからのCookie送信を制限 |
| Origin検証 | Route Handler | 許可されたオリジンからのリクエストのみ受付 |

## 影響範囲

| カテゴリ | 影響 |
|---------|------|
| トークン保管 | httpOnly Cookie（access_token, refresh_token, token_expires_at） |
| ログイン | Route Handler `/api/auth/login` (FormData変換) |
| キャプチャ | Route Handler `/api/auth/captcha` |
| ログアウト | Route Handler `/api/auth/logout` (DELETE) |
| Server Component API | `lib/api/server.ts` → Backend直接 |
| Client Component API | Route Handler `/api/proxy/*` → 自動リフレッシュ |
| 事前リフレッシュ | `/api/auth/check-expiry` + `/api/auth/refresh` |
| Middleware | 認証チェック、未認証時のリダイレクト |

## 関連ADR
- ADR-003: Server/Client Componentの境界設計
- ADR-005: STOMPリアルタイム通信
- ADR-007: 状態管理（TanStack Queryとの連携）
