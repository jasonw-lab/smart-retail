import * as Sentry from '@sentry/nextjs';
import { clientEnv } from '@/lib/env/client';

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
