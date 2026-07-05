/**
 * Verify Upstash Redis connectivity for rate limiting.
 * Run: npm run verify:redis
 *
 * Setup:
 * 1. https://console.upstash.com → Create database (Regional, same region as Vercel if possible)
 * 2. Copy REST URL + REST Token into .env.local:
 *    UPSTASH_REDIS_REST_URL=...
 *    UPSTASH_REDIS_REST_TOKEN=...
 * 3. Run this script again
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

console.log("\n🔍 Upstash Redis check\n");

if (!url || !token) {
  console.error("❌ UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set.");
  console.error("   Add them to alcoa-admin/.env.local (see .env.local.example).\n");
  console.error("   Quick setup:");
  console.error("   1. https://console.upstash.com → Create Redis database");
  console.error("   2. Open the database → REST API → copy URL + Token");
  console.error("   3. Paste into .env.local and run: npm run verify:redis\n");
  process.exit(1);
}

console.log(`   REST URL : ${url.replace(/\/\/[^@]+@/, "//***@")}`);
console.log("   Token    : *** (set)\n");

try {
  const redis = new Redis({ url, token });
  const pong = await redis.ping();

  if (pong !== "PONG") {
    console.error(`❌ Unexpected ping response: ${pong}\n`);
    process.exit(1);
  }

  const testKey = `alcoa-admin:verify:${Date.now()}`;
  await redis.set(testKey, "ok", { ex: 60 });
  const value = await redis.get(testKey);
  await redis.del(testKey);

  if (value !== "ok") {
    console.error("❌ Redis write/read test failed.\n");
    process.exit(1);
  }

  console.log("✅ Redis is reachable (ping + read/write OK)");
  console.log("   Rate limiting will use Upstash for login + public forms.\n");
  console.log("   Vercel: add the same two env vars in Project → Settings → Environment Variables,");
  console.log("   then redeploy.\n");
} catch (err) {
  console.error(`❌ Redis connection failed: ${err?.message || err}\n`);
  process.exit(1);
}
