import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // ログイン
  http.post('http://localhost:3001/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // ユーザー情報取得
  http.get('http://localhost:3001/api/auth/me', () => {
    return HttpResponse.json({
      userId: 1,
      username: 'admin',
      nickname: '管理者',
      roles: ['ADMIN'],
      perms: [],
    });
  }),

  // ログアウト
  http.post('http://localhost:3001/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // トークンリフレッシュ
  http.post('http://localhost:3001/api/auth/refresh', () => {
    return HttpResponse.json({ success: true, expiresIn: 3600 });
  }),
];
