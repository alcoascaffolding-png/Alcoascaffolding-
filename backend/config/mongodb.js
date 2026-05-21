/**
 * MongoDB environment configuration (CommonJS — legacy Express backend).
 * Keep in sync with alcoa-admin/lib/mongodb-config.js
 */

const MONGO_DB_NAMES = {
  development: "alcoa-admin-dev",
  production: "alcoa-admin-prod",
};

const LEGACY_DB_NAME = "alcoa-admin";

function getAppEnv() {
  const raw = (process.env.APP_ENV || "").trim().toLowerCase();
  if (raw === "production" || raw === "prod") return "production";
  if (raw === "development" || raw === "dev") return "development";
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function getMongoDbName(uri = process.env.MONGODB_URI) {
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

function validateMongoEnvironment(options = {}) {
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
        `Set MONGODB_DB_NAME=${MONGO_DB_NAMES.production} on production hosts.`
    );
  }

  return { appEnv, dbName };
}

module.exports = {
  MONGO_DB_NAMES,
  LEGACY_DB_NAME,
  getAppEnv,
  getMongoDbName,
  validateMongoEnvironment,
};
