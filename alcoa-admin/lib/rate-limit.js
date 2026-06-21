/**
 * Rate limiting using Upstash Redis.
 * Falls back to in-memory sliding window when Redis is not configured.
 */

let ratelimitInstance = null;
let redisInstance = null;

/** @type {Map<string, { count: number; resetAt: number }>} */
const memoryBuckets = new Map();

function checkMemoryRateLimit(key, maxRequests = 10, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: new Date(now + windowMs) };
  }
  if (bucket.count >= maxRequests) {
    return { success: false, remaining: 0, reset: new Date(bucket.resetAt) };
  }
  bucket.count += 1;
  return { success: true, remaining: maxRequests - bucket.count, reset: new Date(bucket.resetAt) };
}

/** Login attempts — 10 per email per hour (in-memory when Redis absent). */
export function checkLoginRateLimit(email) {
  const key = `login:${String(email || "").toLowerCase().trim()}`;
  return checkMemoryRateLimit(key, 10, 60 * 60 * 1000);
}

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
    if (!limiter) {
      const windowMs =
        window === "1 h" ? 60 * 60 * 1000 : window === "15 m" ? 15 * 60 * 1000 : 60 * 60 * 1000;
      return checkMemoryRateLimit(identifier, requests, windowMs);
    }

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
