import mongoose from "mongoose";
import {
  getMongoDbName,
  validateMongoEnvironment,
  getMongoConnectionSummary,
} from "./mongodb-config.js";

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export { getMongoDbName, getMongoConnectionSummary } from "./mongodb-config.js";

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define MONGODB_URI in .env.local (see .env.example)"
    );
  }

  const { dbName } = validateMongoEnvironment();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName,
    };

    if (process.env.NODE_ENV !== "production") {
      const summary = getMongoConnectionSummary(MONGODB_URI);
      console.info(
        `[mongodb] APP_ENV=${summary.appEnv} → database "${summary.dbName}"`
      );
    }

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
