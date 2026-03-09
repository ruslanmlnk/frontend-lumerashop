import 'server-only';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetInMs: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __lumeraRateLimitStore?: Map<string, Bucket>;
};

const rateLimitStore = globalForRateLimit.__lumeraRateLimitStore || new Map<string, Bucket>();
if (!globalForRateLimit.__lumeraRateLimitStore) {
  globalForRateLimit.__lumeraRateLimitStore = rateLimitStore;
}

function cleanupExpiredBuckets(now: number): void {
  for (const [key, bucket] of rateLimitStore) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (rateLimitStore.size > 5000) {
    cleanupExpiredBuckets(now);
  }

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      limited: false,
      remaining: Math.max(maxRequests - 1, 0),
      resetInMs: windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetInMs: Math.max(existing.resetAt - now, 0),
    };
  }

  existing.count += 1;

  return {
    limited: false,
    remaining: Math.max(maxRequests - existing.count, 0),
    resetInMs: Math.max(existing.resetAt - now, 0),
  };
}

