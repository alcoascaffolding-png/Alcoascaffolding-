/**
 * Copy all collections from legacy database "alcoa-admin" → "alcoa-admin-dev".
 *
 * MongoDB Atlas cannot rename a database in place. This script clones data on the same cluster.
 *
 * Run (dry-run first):
 *   npm run db:migrate-rename
 *   npm run db:migrate-rename -- --apply
 *
 * Env:
 *   MONGODB_URI          — cluster connection string (no DB path, or any DB on cluster)
 *   MONGODB_SOURCE_DB    — default: alcoa-admin
 *   MONGODB_TARGET_DB    — default: alcoa-admin-dev
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { LEGACY_DB_NAME, MONGO_DB_NAMES } from "../lib/mongodb-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const SOURCE_DB = process.env.MONGODB_SOURCE_DB?.trim() || LEGACY_DB_NAME;
const TARGET_DB = process.env.MONGODB_TARGET_DB?.trim() || MONGO_DB_NAMES.development;
const apply = process.argv.includes("--apply");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env.local");
  process.exit(1);
}

if (SOURCE_DB === TARGET_DB) {
  console.error("❌ Source and target database names must differ");
  process.exit(1);
}

console.log("\n📦 MongoDB database migration (copy)\n");
console.log(`   Cluster URI : (from MONGODB_URI)`);
console.log(`   Source      : ${SOURCE_DB}`);
console.log(`   Target      : ${TARGET_DB}`);
console.log(`   Mode        : ${apply ? "APPLY (writes data)" : "DRY RUN (read only)"}\n`);

await mongoose.connect(MONGODB_URI, { family: 4 });
const client = mongoose.connection.getClient();
const sourceDb = client.db(SOURCE_DB);
const targetDb = client.db(TARGET_DB);

const collections = await sourceDb.listCollections().toArray();
if (!collections.length) {
  console.warn(`⚠️  No collections in "${SOURCE_DB}". Nothing to copy.`);
  await mongoose.disconnect();
  process.exit(0);
}

let totalDocs = 0;
for (const { name } of collections) {
  const count = await sourceDb.collection(name).countDocuments();
  totalDocs += count;
  console.log(`   • ${name}: ${count} document(s)`);
}

console.log(`\n   Total: ${totalDocs} documents across ${collections.length} collection(s)\n`);

if (!apply) {
  console.log("Dry run complete. Re-run with --apply to copy into the target database.\n");
  console.log("After apply:");
  console.log(`   1. Set MONGODB_DB_NAME=${TARGET_DB} in .env.local`);
  console.log("   2. Run: npm run db:test");
  console.log(`   3. In Atlas, keep "${SOURCE_DB}" as backup until verified, then drop if desired.\n`);
  await mongoose.disconnect();
  process.exit(0);
}

if (TARGET_DB.endsWith("-prod")) {
  console.error("❌ Refusing to --apply into a *-prod database. Use seed:prod-sample for production.");
  await mongoose.disconnect();
  process.exit(1);
}

for (const { name } of collections) {
  const sourceColl = sourceDb.collection(name);
  const targetColl = targetDb.collection(name);
  const docs = await sourceColl.find({}).toArray();
  await targetColl.deleteMany({});
  if (docs.length) {
    await targetColl.insertMany(docs, { ordered: false });
  }
  const indexes = await sourceColl.indexes();
  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const { key, name: idxName, unique, sparse, expireAfterSeconds } = idx;
    const opts = { name: idxName };
    if (unique) opts.unique = true;
    if (sparse) opts.sparse = true;
    if (expireAfterSeconds != null) opts.expireAfterSeconds = expireAfterSeconds;
    try {
      await targetColl.createIndex(key, opts);
    } catch {
      /* index may already exist with different options */
    }
  }
  console.log(`   ✅ ${name} → ${docs.length} doc(s)`);
}

console.log(`\n✅ Migration complete: ${SOURCE_DB} → ${TARGET_DB}`);
console.log(`   Update .env.local: MONGODB_DB_NAME=${TARGET_DB}\n`);

await mongoose.disconnect();
process.exit(0);
