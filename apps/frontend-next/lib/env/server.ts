import 'server-only';
import { z } from 'zod';

const serverSchema = z.object({
  BACKEND_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  OPENAPI_SPEC_URL: z.string().url().optional(),
});

function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid server environment variables: ${JSON.stringify(fields)}`);
  }

  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_LOCAL_AUTH_MOCK === 'true') {
    throw new Error('ENABLE_LOCAL_AUTH_MOCK must not be true in production');
  }

  return parsed.data;
}

export const serverEnv = parseServerEnv();
