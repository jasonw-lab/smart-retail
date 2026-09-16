import { test, expect } from '@playwright/test';
import { caseMeta, suiteMeta } from '../fixtures/case-meta';

test.describe(
  'セキュリティヘッダー',
  suiteMeta({ precondition: '未ログイン（/login へ HTTP GET）' }),
  () => {
    test(
      'CSPヘッダーが設定されている',
      caseMeta({
        id: 'SEC-001',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: [
          "Content-Security-Policy に default-src 'self' と frame-ancestors 'none' が含まれる",
        ],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const csp = response.headers()['content-security-policy'];

        expect(csp).toBeDefined();
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("frame-ancestors 'none'");
      }
    );

    test(
      'X-Frame-Optionsヘッダーが設定されている',
      caseMeta({
        id: 'SEC-002',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['X-Frame-Options が DENY'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const xFrameOptions = response.headers()['x-frame-options'];

        expect(xFrameOptions).toBe('DENY');
      }
    );

    test(
      'X-Content-Type-Optionsヘッダーが設定されている',
      caseMeta({
        id: 'SEC-003',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['X-Content-Type-Options が nosniff'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const xContentTypeOptions = response.headers()['x-content-type-options'];

        expect(xContentTypeOptions).toBe('nosniff');
      }
    );

    test(
      'X-XSS-Protectionヘッダーが設定されている',
      caseMeta({
        id: 'SEC-004',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['X-XSS-Protection が 1; mode=block'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const xXssProtection = response.headers()['x-xss-protection'];

        expect(xXssProtection).toBe('1; mode=block');
      }
    );

    test(
      'Referrer-Policyヘッダーが設定されている',
      caseMeta({
        id: 'SEC-005',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['Referrer-Policy が strict-origin-when-cross-origin'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const referrerPolicy = response.headers()['referrer-policy'];

        expect(referrerPolicy).toBe('strict-origin-when-cross-origin');
      }
    );

    test(
      'Permissions-Policyヘッダーが設定されている',
      caseMeta({
        id: 'SEC-006',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['Permissions-Policy に camera=() と microphone=() が含まれる'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const permissionsPolicy = response.headers()['permissions-policy'];

        expect(permissionsPolicy).toContain('camera=()');
        expect(permissionsPolicy).toContain('microphone=()');
      }
    );

    test(
      'Strict-Transport-Securityヘッダーが設定されている',
      caseMeta({
        id: 'SEC-007',
        screen: '全画面共通',
        priority: 'P1',
        perspectives: ['security'],
        steps: ['/login を HTTP GET する'],
        expected: ['Strict-Transport-Security に max-age=31536000 と includeSubDomains が含まれる'],
      }),
      async ({ request }) => {
        const response = await request.get('/login');
        const hsts = response.headers()['strict-transport-security'];

        expect(hsts).toContain('max-age=31536000');
        expect(hsts).toContain('includeSubDomains');
      }
    );
  }
);

test.describe('CSRF 保護（未実装）', suiteMeta({ precondition: 'admin でログイン済み' }), () => {
  test.fixme(
    'CSRF トークンが無い更新リクエストは拒否される',
    caseMeta({
      id: 'SEC-008',
      screen: '全画面共通',
      priority: 'P1',
      perspectives: ['security'],
      steps: ['x-csrf-token ヘッダーを付けずに /api/proxy 経由で店舗の登録を POST する'],
      expected: ['403 が返る', '店舗は登録されない'],
    }),
    async () => {}
  );
});
