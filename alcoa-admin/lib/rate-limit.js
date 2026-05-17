/**
 * Rate limiting using Upstash Redis.
 * Falls back gracefully if Redis is not configured (dev environments).
 */

let ratelimitInstance = null;
let redisInstance = null;

async function getRatelimit(requests = 10, window = "1 h") {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // No rate limiting in dev without Redis
  }

  if (ratelimitInstance) return ratelimitInstance;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  ratelimitInstance = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "alcoa-admin",
  });

  return ratelimitInstance;
}

/**
 * Check rate limit for an identifier (IP + optional email).
 * Returns { success: boolean, remaining: number, reset: Date }
 */
export async function checkRateLimit(identifier, requests = 10, window = "1 h") {
  try {
    const limiter = await getRatelimit(requests, window);
    if (!limiter) return { success: true, remaining: 999, reset: new Date() };

    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (err) {
    console.error("[RateLimit] Error:", err.message);
    return { success: true, remaining: 999, reset: new Date() }; // Fail open
  }
}

/**
 * Get client IP from Next.js request headers
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
