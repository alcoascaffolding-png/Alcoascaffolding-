/**
 * Search for a customer across all Alcoa databases (read-only).
 * Run: node --require ./dns-fix.cjs scripts/find-customer.mjs "Oxford Integration"
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const search = (process.argv[2] || "Oxford Integration").trim();
const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const DATABASES = ["alcoa-admin", "alcoa-admin-dev", "alcoa-admin-prod"];

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set");
  process.exit(1);
}

console.log(`\n🔍 Searching for "${search}" across ${DATABASES.length} databases...\n`);

for (const dbName of DATABASES) {
  await mongoose.connect(MONGODB_URI, { dbName, family: 4 });
  const db = mongoose.connection.db;

  const customers = await db.collection("customers").find({
    $or: [{ companyName: regex }, { displayName: regex }],
  }).project({ companyName: 1, displayName: 1, primaryEmail: 1, status: 1 }).limit(5).toArray();

  const quotations = await db.collection("quotations").find({
    customerName: regex,
  }).project({ quoteNumber: 1, customerName: 1, status: 1, totalAmount: 1 }).limit(5).toArray();

  console.log(`━━━ ${dbName} ━━━`);
  if (customers.length) {
    console.log(`  customers (${customers.length} match):`);
    for (const c of customers) console.log(`    • ${c.companyName} | ${c.primaryEmail || "—"} | ${c.status || "—"}`);
  } else {
    console.log("  customers: (none)");
  }
  if (quotations.length) {
    console.log(`  quotations (${quotations.length} sample):`);
    for (const q of quotations) console.log(`    • ${q.quoteNumber} | ${q.customerName} | ${q.status} | AED ${q.totalAmount}`);
  } else {
    console.log("  quotations: (none)");
  }
  console.log();
  await mongoose.disconnect();
}
