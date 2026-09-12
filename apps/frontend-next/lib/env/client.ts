import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_WS_ENDPOINT: z.string().url(),
  NEXT_PUBLIC_MOCK_API: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

function parseClientEnv() {
  // Next.js は process.env.<NAME> を個別に参照した場合にのみ
  // ブラウザバンドルへインライン展開するため、オブジェクトを直接 parse せず
  // 各変数を明示的に取り出す。
  const input = {
    NEXT_PUBLIC_WS_ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT,
    NEXT_PUBLIC_MOCK_API: process.env.NEXT_PUBLIC_MOCK_API,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  };

  const parsed = clientSchema.safeParse(input);

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid client environment variables: ${JSON.stringify(fields)}`);
  }

  return parsed.data;
}

export const clientEnv = parseClientEnv();
