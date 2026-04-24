import mongoose from "mongoose";

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

/**
 * Resolves the MongoDB database name:
 * 1. MONGODB_DB_NAME env (explicit override)
 * 2. Path segment in MONGODB_URI (e.g. ...mongodb.net/mydb?...)
 * 3. Default `alcoa-admin` when the URI has no database path (SRV URLs often omit it — then Mongoose used `test`, which hid seeded data).
 */
export function getMongoDbName(uri = process.env.MONGODB_URI) {
  if (!uri) return "alcoa-admin";
  const fromEnv = process.env.MONGODB_DB_NAME?.trim();
  if (fromEnv) return fromEnv;
  const withoutQuery = uri.split("?")[0];
  const parts = withoutQuery.split("/");
  const last = parts[parts.length - 1];
  if (last && !last.includes("@") && !last.includes(":")) return last;
  return "alcoa-admin";
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Force IPv4 — avoids IPv6 DNS resolution issues on Windows with Atlas SRV records.
      // Note: DNS server fix (8.8.8.8) is applied via NODE_OPTIONS in .env.local
      family: 4,
      dbName: getMongoDbName(MONGODB_URI),
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
