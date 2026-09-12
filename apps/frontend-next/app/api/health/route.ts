import { NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env/server';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    backend: { status: 'ok' | 'error'; responseTimeMs: number; message?: string };
  };
}

async function checkBackend(): Promise<HealthCheck['checks']['backend']> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // 1) ${BACKEND_URL}/health を試行
    let response = await fetch(`${serverEnv.BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    // 2) 失敗時は Spring Boot の /actuator/health を試行
    if (!response || !response.ok) {
      try {
        const backendOrigin = new URL(serverEnv.BACKEND_URL).origin;
        const actuatorRes = await fetch(`${backendOrigin}/actuator/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (actuatorRes.ok) {
          response = actuatorRes;
        }
      } catch {
        // ignore
      }
    }
    clearTimeout(timeout);

    if (!response || !response.ok) {
      return {
        status: 'error',
        responseTimeMs: Date.now() - start,
        message: response ? `HTTP ${response.status}` : 'No response',
      };
    }
    return { status: 'ok', responseTimeMs: Date.now() - start };
  } catch (error) {
    return {
      status: 'error',
      responseTimeMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function GET() {
  const backend = await checkBackend();
  const status = backend.status === 'ok' ? 'healthy' : 'degraded';

  const health: HealthCheck = {
    status,
    version: process.env.npm_package_version ?? '0.1.0',
    timestamp: new Date().toISOString(),
    checks: { backend },
  };

  return NextResponse.json(health, {
    status: status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
