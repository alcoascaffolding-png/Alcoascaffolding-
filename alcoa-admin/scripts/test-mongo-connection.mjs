/**
 * Test MongoDB connection and print resolved database (dev/prod).
 * Run: npm run db:test
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMongoConnectionSummary,
  getMongoDbName,
  validateMongoEnvironment,
} from "../lib/mongodb-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing. Copy .env.example → .env.local");
  process.exit(1);
}

const summary = getMongoConnectionSummary(MONGODB_URI);
console.log("\n🔍 MongoDB environment check\n");
console.log(`   APP_ENV     : ${summary.appEnv}`);
console.log(`   Database    : ${summary.dbName}`);
console.log(`   URI (masked): ${summary.maskedUri}\n`);

try {
  validateMongoEnvironment();
} catch (e) {
  console.error(`❌ ${e.message}\n`);
  process.exit(1);
}

const dbName = getMongoDbName(MONGODB_URI);
console.log("🔄 Connecting...\n");

try {
  await mongoose.connect(MONGODB_URI, { dbName, family: 4, serverSelectionTimeoutMS: 10000 });
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("✅ Connected");
  console.log(`   Host     : ${mongoose.connection.host}`);
  console.log(`   Database : ${mongoose.connection.name}`);
  console.log(`   Collections (${collections.length}): ${collections.map((c) => c.name).join(", ") || "(none)"}\n`);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
}
