/**
 * Insert minimal sample data into the PRODUCTION database for smoke testing.
 * Does NOT wipe existing data — upserts tagged sample records only.
 *
 * Run:
 *   MONGODB_DB_NAME=alcoa-admin-prod npm run seed:prod-sample -- --confirm
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
import Customer from "../models/Customer.js";
import Quotation from "../models/Quotation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const confirm = process.argv.includes("--confirm");
const SAMPLE_TAG = "prod-sample-seed-v1";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing");
  process.exit(1);
}

const dbName = getMongoDbName(MONGODB_URI);

if (!dbName.endsWith("-prod") && process.env.MONGODB_DB_NAME !== MONGO_DB_NAMES.production) {
  console.error(
    `❌ Target database is "${dbName}". Set MONGODB_DB_NAME=${MONGO_DB_NAMES.production} for production sample seed.`
  );
  process.exit(1);
}

if (!confirm) {
  console.log("\n⚠️  Production sample seed requires --confirm\n");
  console.log(`   Database: ${dbName}`);
  console.log("   Run: npm run seed:prod-sample -- --confirm\n");
  process.exit(1);
}

process.env.APP_ENV = "production";

try {
  validateMongoEnvironment();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}

console.log(`\n🌱 Production sample seed → ${dbName}\n`);

await mongoose.connect(MONGODB_URI, { dbName, family: 4 });

const adminEmail = "prod-test-admin@alcoascaffolding.ae";
let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = await User.create({
    name: "Production Test Admin",
    email: adminEmail,
    password: "ChangeMe-Prod-Test-2026!",
    role: "super_admin",
    isActive: true,
  });
  console.log("   ✅ Sample admin user created");
} else {
  console.log("   ℹ️  Sample admin already exists (skipped)");
}

const companyName = "[Sample] Production Test Customer LLC";
let customer = await Customer.findOne({ companyName });
if (!customer) {
  customer = await Customer.create({
    companyName,
    displayName: "Prod Test Customer",
    primaryEmail: "prod-test-customer@example.com",
    primaryPhone: "+971 50 000 0001",
    status: "active",
    notes: SAMPLE_TAG,
  });
  console.log("   ✅ Sample customer created");
} else {
  console.log("   ℹ️  Sample customer already exists (skipped)");
}

const quoteNumber = "QT260519001";
let quote = await Quotation.findOne({ quoteNumber });
if (!quote) {
  const subtotal = 1000;
  const vatAmount = 50;
  quote = await Quotation.create({
    quoteNumber,
    customer: customer._id,
    customerName: customer.companyName,
    customerEmail: customer.primaryEmail,
    customerPhone: customer.primaryPhone,
    status: "draft",
    quoteType: "rental",
    subtotal,
    vatAmount,
    totalAmount: subtotal + vatAmount,
    currency: "AED",
    items: [
      {
        equipmentType: "[Sample] Aluminium scaffolding tower — production smoke test",
        quantity: 1,
        unit: "Set",
        ratePerUnit: 1000,
        taxableAmount: 1000,
        vatPercentage: 5,
        vatAmount: 50,
        subtotal: 1000,
      },
    ],
    notes: SAMPLE_TAG,
    quoteDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 86400000),
  });
  console.log(`   ✅ Sample quotation ${quoteNumber} created`);
} else {
  console.log(`   ℹ️  Quotation ${quoteNumber} already exists (skipped)`);
}

console.log("\n✅ Production sample seed finished.");
console.log("   Verify in Atlas → Data Explorer →", dbName);
console.log("   Admin login (if new):", adminEmail, "/ ChangeMe-Prod-Test-2026!\n");

await mongoose.disconnect();
process.exit(0);
