/**
 * Drop legacy MongoDB database "alcoa-admin" (unused after dev/prod split).
 *
 * Run (dry-run):
 *   npm run db:drop-legacy
 *
 * Apply:
 *   npm run db:drop-legacy -- --confirm
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { LEGACY_DB_NAME, MONGO_DB_NAMES } from "../lib/mongodb-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const confirm = process.argv.includes("--confirm");
const PROTECTED = new Set([MONGO_DB_NAMES.development, MONGO_DB_NAMES.production, "admin", "local"]);

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env.local");
  process.exit(1);
}

if (LEGACY_DB_NAME !== "alcoa-admin") {
  console.error(`❌ Unexpected LEGACY_DB_NAME="${LEGACY_DB_NAME}"`);
  process.exit(1);
}

if (PROTECTED.has(LEGACY_DB_NAME)) {
  console.error(`❌ Refusing to drop protected database "${LEGACY_DB_NAME}"`);
  process.exit(1);
}

console.log(`\n🗄️  Legacy database cleanup — target: "${LEGACY_DB_NAME}"\n`);
console.log("   Protected (will NOT be touched):");
console.log(`     • ${MONGO_DB_NAMES.development}`);
console.log(`     • ${MONGO_DB_NAMES.production}\n`);

await mongoose.connect(MONGODB_URI, { dbName: LEGACY_DB_NAME, family: 4 });
const db = mongoose.connection.db;

const collections = await db.listCollections().toArray();
if (collections.length === 0) {
  console.log(`ℹ️  Database "${LEGACY_DB_NAME}" is already empty or does not exist.\n`);
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`Found ${collections.length} collections in "${LEGACY_DB_NAME}":\n`);
for (const { name } of collections.sort((a, b) => a.name.localeCompare(b.name))) {
  const count = await db.collection(name).countDocuments();
  console.log(`   ${name.padEnd(22)} ${count} documents`);
}

if (!confirm) {
  console.log("\n⚠️  Dry run only. To permanently delete this database, run:\n");
  console.log("   npm run db:drop-legacy -- --confirm\n");
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`\n🗑️  Dropping database "${LEGACY_DB_NAME}"...`);
const dropped = await db.dropDatabase();
console.log(`✅ Dropped: ${dropped ? "yes" : "no"}\n`);

await mongoose.disconnect();

// Verify remaining databases on cluster
await mongoose.connect(MONGODB_URI, { family: 4 });
const adminDb = mongoose.connection.db.admin();
const { databases } = await adminDb.listDatabases();
const alcoaDbs = databases
  .map((d) => d.name)
  .filter((n) => n.startsWith("alcoa-admin"))
  .sort();

console.log("Remaining alcoa-admin* databases on cluster:");
for (const name of alcoaDbs) console.log(`   • ${name}`);
console.log();

await mongoose.disconnect();
process.exit(0);
