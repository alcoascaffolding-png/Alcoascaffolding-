/**
 * Ensure the official ADCB company bank account exists (matches quotation PDF).
 * Safe to run multiple times — upserts by account number.
 *
 * Development database only — refuses production.
 * Run: npm run bank:ensure-primary
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getMongoDbName, MONGO_DB_NAMES } from "../lib/mongodb-config.js";
import { companyBankAccountSeedDoc, COMPANY_BANK_DETAILS } from "../lib/company-bank-details.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const ALLOWED_DB = MONGO_DB_NAMES.development;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env.local");
  process.exit(1);
}

const dbName = getMongoDbName(MONGODB_URI);
if (dbName !== ALLOWED_DB) {
  console.error(`❌ Refusing to run: target database is "${dbName}".`);
  console.error(`   Only "${ALLOWED_DB}" is allowed. Set MONGODB_DB_NAME=${ALLOWED_DB}`);
  process.exit(1);
}

const bankAccountSchema = new mongoose.Schema(
  {
    accountName: String,
    bankName: String,
    accountNumber: { type: String, unique: true },
    iban: String,
    swiftCode: String,
    branch: String,
    currency: { type: String, default: "AED" },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

const BankAccount =
  mongoose.models.BankAccount || mongoose.model("BankAccount", bankAccountSchema);

console.log("\n🏦 Ensuring primary company bank account (dev only)\n");
console.log(`   Database: ${dbName}`);
console.log(`   Account : ${COMPANY_BANK_DETAILS.accountName}`);
console.log(`   Bank    : ${COMPANY_BANK_DETAILS.bankName}`);
console.log(`   Number  : ${COMPANY_BANK_DETAILS.accountNumber}\n`);

await mongoose.connect(MONGODB_URI, { dbName });

await BankAccount.updateMany(
  { accountNumber: { $ne: COMPANY_BANK_DETAILS.accountNumber } },
  { $set: { isPrimary: false } }
);

const existing = await BankAccount.findOne({
  accountNumber: COMPANY_BANK_DETAILS.accountNumber,
});

const seed = companyBankAccountSeedDoc();

if (existing) {
  existing.accountName = seed.accountName;
  existing.bankName = seed.bankName;
  existing.iban = seed.iban;
  existing.swiftCode = seed.swiftCode;
  existing.branch = seed.branch;
  existing.currency = seed.currency;
  existing.isActive = true;
  existing.isPrimary = true;
  if (!existing.notes) existing.notes = seed.notes;
  await existing.save();
  console.log("✅ Updated existing primary bank account\n");
} else {
  await BankAccount.create(seed);
  console.log("✅ Created primary bank account\n");
}

await mongoose.disconnect();
