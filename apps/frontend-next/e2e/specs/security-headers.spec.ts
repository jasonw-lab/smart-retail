import { test, expect } from '@playwright/test';

test.describe('セキュリティヘッダー', () => {
  test('CSPヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const csp = response.headers()['content-security-policy'];

    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('X-Frame-Optionsヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const xFrameOptions = response.headers()['x-frame-options'];

    expect(xFrameOptions).toBe('DENY');
  });

  test('X-Content-Type-Optionsヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const xContentTypeOptions = response.headers()['x-content-type-options'];

    expect(xContentTypeOptions).toBe('nosniff');
  });

  test('X-XSS-Protectionヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const xXssProtection = response.headers()['x-xss-protection'];

    expect(xXssProtection).toBe('1; mode=block');
  });

  test('Referrer-Policyヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const referrerPolicy = response.headers()['referrer-policy'];

    expect(referrerPolicy).toBe('strict-origin-when-cross-origin');
  });

  test('Permissions-Policyヘッダーが設定されている', async ({ request }) => {
    const response = await request.get('/login');
    const permissionsPolicy = response.headers()['permissions-policy'];

    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
  });

  test('Strict-Transport-Securityヘッダーが設定されている', async ({
    request,
  }) => {
    const response = await request.get('/login');
    const hsts = response.headers()['strict-transport-security'];

    expect(hsts).toContain('max-age=31536000');
    expect(hsts).toContain('includeSubDomains');
  });
});
