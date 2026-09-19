/**
 * Helper to reset mock server state between tests or suites
 */
export async function resetMockData() {
  const port = process.env.MOCK_PORT || '8095';
  try {
    const res = await fetch(`http://localhost:${port}/__mock/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      console.warn(`Failed to reset mock data: ${res.status}`);
    }
  } catch {
    // Ignore when mock server is not running or not reachable yet
  }
}

/**
 * Helper to inject mock server error for error-handling tests (R10)
 */
export async function injectMockError(route: string, status = 500, method?: string) {
  const port = process.env.MOCK_PORT || '8095';
  await fetch(`http://localhost:${port}/__mock/error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, status, method }),
  });
}
