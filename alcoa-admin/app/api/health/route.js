import { apiSuccess } from "@/lib/api-response";

export const GET = async () => {
  return apiSuccess({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    env: process.env.NODE_ENV,
    resendConfigured: !!process.env.RESEND_API_KEY,
    mongoConfigured: !!process.env.MONGODB_URI,
  });
};
