/**
 * Create or reset the main admin user in the production database.
 *
 * Run:
 *   npm run create:prod-admin -- --confirm
 *
 * Defaults:
 *   Email:    admin@alcoascaffolding.ae
 *   Password: Admin@1234
 *
 * Override: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create:prod-admin -- --confirm
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMongoDbName,
  MONGO_DB_NAMES,
  validateMongoEnvironment,
} from "../lib/mongodb-config.js";
import User from "../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const confirm = process.argv.includes("--confirm");
const email = (process.env.ADMIN_EMAIL || "admin@alcoascaffolding.ae").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Admin@1234";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env.local");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB_NAME?.trim() || MONGO_DB_NAMES.production;

if (!dbName.endsWith("-prod")) {
  console.error(
    `❌ Refusing: database "${dbName}" is not production. Set MONGODB_DB_NAME=${MONGO_DB_NAMES.production}`
  );
  process.exit(1);
}

if (!confirm) {
  console.log("\n⚠️  Create production admin requires --confirm\n");
  console.log(`   Database : ${dbName}`);
  console.log(`   Email    : ${email}`);
  console.log("   Run: npm run create:prod-admin -- --confirm\n");
  process.exit(1);
}

process.env.APP_ENV = "production";
process.env.MONGODB_DB_NAME = dbName;

try {
  validateMongoEnvironment();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}

console.log(`\n👤 Production admin → ${dbName}\n`);

await mongoose.connect(MONGODB_URI, { dbName, family: 4 });

let user = await User.findOne({ email }).select("+password");

if (user) {
  user.password = password;
  user.isActive = true;
  user.role = "super_admin";
  user.name = user.name || "Super Admin";
  user.department = user.department || "management";
  await user.save();
  console.log(`   ✅ Updated existing user: ${email}`);
} else {
  user = await User.create({
    name: "Super Admin",
    email,
    password,
    role: "super_admin",
    department: "management",
    phone: "+971 4 100 0001",
    isActive: true,
  });
  console.log(`   ✅ Created user: ${email}`);
}

console.log("\n✅ Done. Sign in on production with the same email and password.\n");

await mongoose.disconnect();
process.exit(0);
