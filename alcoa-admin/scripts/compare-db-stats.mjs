/**
 * Compare quotation stats across all Alcoa databases (read-only).
 * Run: node --require ./dns-fix.cjs scripts/compare-db-stats.mjs
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASES = ["alcoa-admin", "alcoa-admin-dev", "alcoa-admin-prod"];

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set");
  process.exit(1);
}

console.log("\n📊 Comparing databases against production dashboard (83 quotes, ~AED 46.1M)\n");

for (const dbName of DATABASES) {
  await mongoose.connect(MONGODB_URI, { dbName, family: 4 });
  const db = mongoose.connection.db;

  const [quotationStats, customerCount, oxford] = await Promise.all([
    db.collection("quotations").aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $in: ["$status", ["draft", "sent"]] }, 1, 0],
            },
          },
          accepted: {
            $sum: {
              $cond: [{ $in: ["$status", ["accepted", "approved"]] }, 1, 0],
            },
          },
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]).toArray(),
    db.collection("customers").countDocuments(),
    db.collection("quotations").findOne(
      { customerName: /Oxford Integration/i },
      { projection: { quoteNumber: 1, customerName: 1, totalAmount: 1, status: 1 } }
    ),
  ]);

  const stats = quotationStats[0] || { total: 0, pending: 0, accepted: 0, totalValue: 0 };
  const collections = await db.listCollections().toArray();

  console.log(`━━━ ${dbName} ━━━`);
  console.log(`  Collections: ${collections.length}`);
  console.log(`  Customers:   ${customerCount}`);
  console.log(`  Quotations:  total=${stats.total} | pending=${stats.pending} | accepted=${stats.accepted}`);
  console.log(`  Total value: AED ${(stats.totalValue || 0).toLocaleString("en-AE", { minimumFractionDigits: 2 })}`);
  if (oxford) {
    console.log(`  Oxford:      ${oxford.quoteNumber} | AED ${oxford.totalAmount} | ${oxford.status}`);
  } else {
    console.log(`  Oxford:      (not found)`);
  }

  const match =
    stats.total === 83 &&
    stats.pending === 70 &&
    stats.accepted === 3 &&
    oxford?.quoteNumber === "QT260704886";
  if (match) console.log(`  ✅ MATCHES production dashboard`);
  console.log();

  await mongoose.disconnect();
}
