import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { isBlobReadWriteTokenConfigured } from "@/lib/storage/blob";
import { isRedisConfigured, verifyRedisConnection, getRateLimitBackend } from "@/lib/rate-limit";

export const GET = async (request) => {
  if (process.env.NODE_ENV === "production") {
    const healthSecret = process.env.HEALTH_CHECK_SECRET;
    if (healthSecret) {
      const provided = request.headers.get("x-health-secret");
      if (provided !== healthSecret) {
        return apiError("Not found", 404);
      }
    } else {
      const session = await auth();
      if (!session?.user) {
        return apiError("Unauthorized", 401);
      }
    }
  }

  const redis = await verifyRedisConnection();

  return apiSuccess({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    env: process.env.NODE_ENV,
    resendConfigured: !!process.env.RESEND_API_KEY,
    mongoConfigured: !!process.env.MONGODB_URI,
    blobReadWriteConfigured: isBlobReadWriteTokenConfigured(),
    redisConfigured: isRedisConfigured(),
    rateLimitBackend: getRateLimitBackend(),
    redisReachable: redis.reachable,
  });
};
