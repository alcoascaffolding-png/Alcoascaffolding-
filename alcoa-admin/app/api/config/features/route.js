import { auth } from "@/lib/auth";
import { getUiFeaturePayload } from "@/lib/server-features";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * Runtime UI feature flags (authenticated). Avoids relying on NEXT_PUBLIC_* alone,
 * which is inlined at build time and often empty on Vercel if env was added later.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  return apiSuccess(getUiFeaturePayload());
}
