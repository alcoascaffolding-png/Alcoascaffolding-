/**
 * MongoDB environment configuration (dev / prod database separation).
 *
 * Atlas structure:
 *   Cluster: alcoa-db (or your cluster hostname)
 *   ├── alcoa-admin-dev   ← local development & testing
 *   └── alcoa-admin-prod  ← live website / Vercel production
 *
 * Switch databases via .env.local (APP_ENV + MONGODB_DB_NAME) without changing cluster credentials.
 */

export const MONGO_DB_NAMES = {
  development: "alcoa-admin-dev",
  production: "alcoa-admin-prod",
};

/** Legacy database name before dev/prod split (migrate with scripts/migrate-rename-database.mjs). */
export const LEGACY_DB_NAME = "alcoa-admin";

/**
 * @returns {"development" | "production"}
 */
export function getAppEnv() {
  const raw = (process.env.APP_ENV || "").trim().toLowerCase();
  if (raw === "production" || raw === "prod") return "production";
  if (raw === "development" || raw === "dev") return "development";
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/**
 * Resolves MongoDB database name (priority):
 * 1. MONGODB_DB_NAME (explicit override — recommended)
 * 2. Path segment in MONGODB_URI (e.g. .../alcoa-admin-dev?...)
 * 3. APP_ENV default (alcoa-admin-dev | alcoa-admin-prod)
 */
export function getMongoDbName(uri = process.env.MONGODB_URI) {
  const fromEnv = process.env.MONGODB_DB_NAME?.trim();
  if (fromEnv) return fromEnv;

  if (uri) {
    const withoutQuery = uri.split("?")[0];
    const parts = withoutQuery.split("/");
    const last = parts[parts.length - 1];
    if (last && !last.includes("@") && !last.includes(":")) return last;
  }

  return MONGO_DB_NAMES[getAppEnv()];
}

/**
 * Blocks accidental prod/dev cross-wiring unless explicitly allowed.
 */
export function validateMongoEnvironment(options = {}) {
  const { strict = true } = options;
  const appEnv = getAppEnv();
  const dbName = getMongoDbName();

  if (
    strict &&
    appEnv === "production" &&
    (dbName.endsWith("-dev") || dbName === LEGACY_DB_NAME) &&
    process.env.MONGODB_ALLOW_DEV_IN_PRODUCTION !== "true"
  ) {
    throw new Error(
      `Refusing MongoDB connection: APP_ENV=production but database is "${dbName}". ` +
        `Set MONGODB_DB_NAME=${MONGO_DB_NAMES.production} on production hosts, ` +
        `or set MONGODB_ALLOW_DEV_IN_PRODUCTION=true to override (not recommended).`
    );
  }

  if (
    appEnv === "development" &&
    dbName.endsWith("-prod") &&
    process.env.MONGODB_ALLOW_PROD_IN_DEV !== "true"
  ) {
    console.warn(
      `[mongodb] Warning: APP_ENV=development is using production database "${dbName}". ` +
        `Set MONGODB_DB_NAME=${MONGO_DB_NAMES.development} or MONGODB_ALLOW_PROD_IN_DEV=true to acknowledge.`
    );
  }

  return { appEnv, dbName };
}

export function getMongoConnectionSummary(uri = process.env.MONGODB_URI) {
  const { appEnv, dbName } = validateMongoEnvironment({ strict: false });
  const maskedUri = uri
    ? uri.replace(/:([^:@/]+)@/, ":***@")
    : "(not set)";
  return { appEnv, dbName, maskedUri };
}
