/**
 * Post-seed verification for alcoa-admin-dev.
 * Run: npm run verify:seed
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getMongoDbName, MONGO_DB_NAMES } from "../lib/mongodb-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const ALLOWED_DB = MONGO_DB_NAMES.development;

const MIN_COUNTS = {
  users: 5,
  bankaccounts: 1,
  vendors: 10,
  customers: 15,
  products: 25,
  quotations: 18,
  salesorders: 8,
  salesinvoices: 10,
  receipts: 5,
  purchaseorders: 10,
  purchaseinvoices: 10,
  payments: 5,
  deliverynotes: 8,
  stockadjustments: 10,
  contactmessages: 8,
  auditlogs: 30,
};

let failed = 0;

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.error(`  ❌ ${msg}`); failed++; }

const dbName = getMongoDbName(MONGODB_URI);
console.log(`\n🔍 Verifying seed in "${dbName}"...\n`);

if (dbName !== ALLOWED_DB) {
  console.error(`❌ Wrong database: "${dbName}". Expected "${ALLOWED_DB}".`);
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI, { dbName, family: 4 });

const db = mongoose.connection.db;
const collections = await db.listCollections().toArray();
const names = collections.map((c) => c.name).sort();
pass(`Found ${names.length} collections`);

for (const [coll, min] of Object.entries(MIN_COUNTS)) {
  const count = await db.collection(coll).countDocuments();
  if (count >= min) pass(`${coll}: ${count} (min ${min})`);
  else fail(`${coll}: ${count} — expected at least ${min}`);
}

const convertedQuote = await db.collection("quotations").findOne({ convertedToOrder: true });
if (convertedQuote) {
  const linkedSO = await db.collection("salesorders").findOne({ quotation: convertedQuote._id });
  if (linkedSO) pass(`Quotation ${convertedQuote.quoteNumber} linked to SO ${linkedSO.orderNumber}`);
  else fail("Converted quotation has no linked sales order");
} else {
  fail("No converted quotation found");
}

const directInvQuote = await db.collection("quotations").findOne({ status: "converted_to_invoice" });
if (directInvQuote) {
  const linkedInv = await db.collection("salesinvoices").findOne({ quotation: directInvQuote._id, salesOrder: { $exists: false } })
    || await db.collection("salesinvoices").findOne({ quotation: directInvQuote._id, salesOrder: null });
  if (linkedInv) pass(`Direct-invoice quotation ${directInvQuote.quoteNumber} → ${linkedInv.invoiceNumber}`);
  else fail("Direct-invoice quotation has no linked sales invoice");
}

const dn = await db.collection("deliverynotes").findOne({ salesOrder: { $exists: true, $ne: null } });
if (dn) pass(`Delivery note ${dn.deliveryNoteNumber} linked to sales order`);
else fail("No delivery note linked to a sales order");

const lowStock = await db.collection("products").findOne({
  isActive: { $ne: false },
  $expr: { $lt: ["$currentStock", "$minStock"] },
});
if (lowStock) pass(`Low stock product: ${lowStock.itemCode} (${lowStock.currentStock} < ${lowStock.minStock})`);
else fail("No low-stock products for dashboard");

const receiptWithAlloc = await db.collection("receipts").findOne({ "allocations.0": { $exists: true } });
if (receiptWithAlloc) pass("Receipts have invoice allocations");
else fail("No receipt allocations found");

await mongoose.disconnect();

console.log(failed ? `\n❌ Verification failed (${failed} issue(s))\n` : "\n✅ All seed checks passed.\n");
process.exit(failed ? 1 : 0);
