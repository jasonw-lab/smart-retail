/**
 * Simple in-memory rate limiter for API routes.
 *
 * Uses a token-bucket style algorithm per client IP.
 * Not distributed - for production scale, replace with Redis.
 */

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, Bucket>();
let lastCleanup = 0;

function cleanupExpiredBuckets(now: number, windowMs: number) {
  if (now - lastCleanup < windowMs) return;

  for (const [key, bucket] of store.entries()) {
    if (now - bucket.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }

  lastCleanup = now;
}

export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  if (process.env.DISABLE_RATE_LIMIT === 'true') return false;

  const now = Date.now();
  cleanupExpiredBuckets(now, options.windowMs);
  const bucket = store.get(key);

  if (!bucket) {
    store.set(key, { tokens: options.limit - 1, lastRefill: now });
    return false;
  }

  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((elapsed / options.windowMs) * options.limit);

  bucket.tokens = Math.min(options.limit, bucket.tokens + tokensToAdd);
  bucket.lastRefill = tokensToAdd > 0 ? now : bucket.lastRefill;

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return false;
  }

  return true;
}

export function getClientIp(req: {
  headers: { get?: (name: string) => string | null };
  ip?: string | null;
}): string {
  const forwarded = req.headers.get?.('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}
