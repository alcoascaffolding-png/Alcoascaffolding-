/**
 * Backfill: for every quotation with status "converted", ensure a linked sales order exists.
 * Safe to run on production (idempotent).
 *
 *   $env:MONGODB_DB_NAME="alcoa-admin-prod"; $env:APP_ENV="production"
 *   npm run backfill:converted -- --confirm
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMongoDbName,
  validateMongoEnvironment,
} from "../lib/mongodb-config.js";
import User from "../models/User.js";
import Quotation from "../models/Quotation.js";
import SalesOrder from "../models/SalesOrder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const confirm = process.argv.includes("--confirm");
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME?.trim() || getMongoDbName();

function quotationItemsToOrderItems(items) {
  return (items || []).map((it) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.ratePerUnit) || 0;
    const lineSub = Number(it.subtotal ?? qty * rate);
    const desc =
      [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
      it.description ||
      "Line item";
    return {
      description: desc,
      quantity: qty,
      unit: it.unit || "Nos",
      unitPrice: rate,
      total: lineSub,
    };
  });
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing");
  process.exit(1);
}

if (!confirm) {
  console.log("\n⚠️  Backfill converted quotations requires --confirm\n");
  console.log(`   Database: ${dbName}`);
  console.log(
    '   Run: $env:MONGODB_DB_NAME="alcoa-admin-prod"; $env:APP_ENV="production"; npm run backfill:converted -- --confirm\n'
  );
  process.exit(1);
}

process.env.MONGODB_DB_NAME = dbName;
if (!process.env.APP_ENV) process.env.APP_ENV = dbName.endsWith("-prod") ? "production" : "development";

try {
  validateMongoEnvironment();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}

console.log(`\n🔄 Backfill converted → sales orders (${dbName})\n`);

await mongoose.connect(MONGODB_URI, { dbName, family: 4 });

const adminUser =
  (await User.findOne({ email: "admin@alcoascaffolding.ae" }).select("_id").lean()) ||
  (await User.findOne({ role: "super_admin" }).select("_id").lean());
const createdBy = adminUser?._id;

const converted = await Quotation.find({ status: "converted" })
  .select("_id quoteNumber customerName items subtotal vatAmount vatPercentage customer customerEmail customerPhone quoteDate deliveryDate validUntil currency notes")
  .lean();

console.log(`   Found ${converted.length} converted quotation(s)\n`);

let created = 0;
let linked = 0;
let failed = 0;

for (const q of converted) {
  try {
    let existing = await SalesOrder.findOne({ quotation: q._id }).lean();
    if (!existing && q.quoteNumber) {
      existing = await SalesOrder.findOne({ orderNumber: q.quoteNumber }).lean();
      if (existing && !existing.quotation) {
        await SalesOrder.findByIdAndUpdate(existing._id, { quotation: q._id });
      }
    }

    if (existing) {
      linked++;
      await Quotation.findByIdAndUpdate(q._id, {
        $set: { convertedToOrder: true, convertedAt: new Date() },
      });
      console.log(`   ℹ️  Linked SO ${existing.orderNumber} ← ${q.quoteNumber}`);
      continue;
    }

    if (!q.items?.length) {
      failed++;
      console.error(`   ❌ ${q.quoteNumber}: no line items`);
      continue;
    }

    const items = quotationItemsToOrderItems(q.items);
    const lineSubtotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
    const vatAmount =
      Number(q.vatAmount) ||
      Math.round((lineSubtotal * Number(q.vatPercentage || 5)) / 100 * 100) / 100;

    const order = await SalesOrder.create({
      orderNumber: q.quoteNumber,
      customer: q.customer,
      customerName: q.customerName,
      customerEmail: q.customerEmail,
      customerPhone: q.customerPhone,
      quotation: q._id,
      orderDate: q.quoteDate || new Date(),
      deliveryDate: q.deliveryDate || q.validUntil || undefined,
      status: "confirmed",
      items,
      subtotal: lineSubtotal,
      vatAmount,
      total: lineSubtotal + vatAmount,
      currency: q.currency || "AED",
      notes: q.notes || undefined,
      createdBy,
    });

    await Quotation.findByIdAndUpdate(q._id, {
      $set: { convertedToOrder: true, convertedAt: new Date() },
    });

    created++;
    console.log(`   ✅ Created SO ${order.orderNumber} ← ${q.quoteNumber}`);
  } catch (err) {
    failed++;
    console.error(`   ❌ ${q.quoteNumber}: ${err.message}`);
  }
}

console.log(`\nDone: ${created} created, ${linked} already linked, ${failed} failed\n`);
await mongoose.disconnect();
