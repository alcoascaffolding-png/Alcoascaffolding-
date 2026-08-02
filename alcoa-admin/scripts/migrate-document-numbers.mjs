/**
 * Migrate document numbers to PREFIX + ddmmyy + #### (yearly sequential).
 * Each module (QT / SO / SI) keeps an independent sequence — numbers are never
 * shared or copied across types.
 *
 * Already-valid new-format IDs are left unchanged. Legacy PREFIX + YYMMDD + 3
 * random digits and other shapes are reassigned.
 *
 * Run (dry-run):  npm run migrate:document-numbers
 * Apply changes:  npm run migrate:document-numbers -- --apply
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import { pathToFileURL } from "url";
import { getMongoDbName } from "../lib/db.js";
import {
  formatDocumentNumber,
  DOCUMENT_NUMBER_REGEX,
  DOCUMENT_PREFIX,
} from "../lib/document-number.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const APPLY = process.argv.includes("--apply");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function loadModel(name, file) {
  const mod = await import(pathToFileURL(path.join(__dirname, "..", "models", file)));
  return mod.default;
}

/** True when value already matches the current PREFIXddmmyy#### format for this module. */
function hasCurrentFormat(value, prefix) {
  return Boolean(value && new RegExp(`^${prefix}\\d{10}$`).test(String(value)));
}

/**
 * Allocate next yearly sequential number for a module, tracking in-memory used set
 * so batch migration does not collide before writes.
 */
function allocateNumber(usedSet, yearSeqMap, baseDate, prefix) {
  const d = new Date(baseDate);
  const year = d.getFullYear();
  const key = `${prefix}:${year}`;
  let seq = yearSeqMap.get(key) || 0;

  for (let i = 0; i < 10000; i++) {
    seq += 1;
    const candidate = formatDocumentNumber(prefix, d, seq);
    if (!usedSet.has(candidate)) {
      usedSet.add(candidate);
      yearSeqMap.set(key, seq);
      return candidate;
    }
  }
  throw new Error(`Could not allocate unique number for ${prefix} year ${year}`);
}

function seedUsedAndSeqFromExisting(docs, field, prefix, usedSet, yearSeqMap) {
  const newFmtByYear = (year) => {
    const yy = String(year).slice(-2);
    return new RegExp(`^${prefix}\\d{4}${yy}\\d{4}$`);
  };

  for (const doc of docs) {
    const v = doc[field];
    if (!v) continue;
    const s = String(v);
    if (DOCUMENT_NUMBER_REGEX.test(s) && s.startsWith(prefix)) {
      usedSet.add(s);
      // Extract year from ddmmyy (positions 6-7 after prefix are yy)
      const yy = s.slice(6, 8);
      const year = 2000 + parseInt(yy, 10);
      const seq = parseInt(s.slice(-4), 10) || 0;
      if (newFmtByYear(year).test(s)) {
        const key = `${prefix}:${year}`;
        const prev = yearSeqMap.get(key) || 0;
        if (seq > prev) yearSeqMap.set(key, seq);
      }
    }
  }
}

async function main() {
  console.log(APPLY ? "🔧 APPLY mode — writing to database\n" : "👀 DRY RUN — pass --apply to write\n");

  const dbName = getMongoDbName(MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { dbName });

  const Quotation = await loadModel("Quotation", "Quotation.js");
  const SalesOrder = await loadModel("SalesOrder", "SalesOrder.js");
  const SalesInvoice = await loadModel("SalesInvoice", "SalesInvoice.js");

  const [quotations, orders, invoices] = await Promise.all([
    Quotation.find({}).sort({ quoteDate: 1, createdAt: 1 }).lean(),
    SalesOrder.find({}).sort({ orderDate: 1, createdAt: 1 }).lean(),
    SalesInvoice.find({}).sort({ invoiceDate: 1, createdAt: 1 }).lean(),
  ]);

  const used = new Set();
  const yearSeq = new Map();

  seedUsedAndSeqFromExisting(quotations, "quoteNumber", DOCUMENT_PREFIX.QUOTATION, used, yearSeq);
  seedUsedAndSeqFromExisting(orders, "orderNumber", DOCUMENT_PREFIX.SALES_ORDER, used, yearSeq);
  seedUsedAndSeqFromExisting(invoices, "invoiceNumber", DOCUMENT_PREFIX.SALES_INVOICE, used, yearSeq);

  const quoteNewById = new Map();
  const orderNewById = new Map();
  const invoiceNewById = new Map();

  for (const q of quotations) {
    if (hasCurrentFormat(q.quoteNumber, DOCUMENT_PREFIX.QUOTATION)) {
      quoteNewById.set(String(q._id), q.quoteNumber);
      continue;
    }
    const baseDate = q.quoteDate || q.createdAt || new Date();
    quoteNewById.set(
      String(q._id),
      allocateNumber(used, yearSeq, baseDate, DOCUMENT_PREFIX.QUOTATION)
    );
  }

  for (const o of orders) {
    if (hasCurrentFormat(o.orderNumber, DOCUMENT_PREFIX.SALES_ORDER)) {
      orderNewById.set(String(o._id), o.orderNumber);
      continue;
    }
    const baseDate = o.orderDate || o.createdAt || new Date();
    orderNewById.set(
      String(o._id),
      allocateNumber(used, yearSeq, baseDate, DOCUMENT_PREFIX.SALES_ORDER)
    );
  }

  for (const inv of invoices) {
    if (hasCurrentFormat(inv.invoiceNumber, DOCUMENT_PREFIX.SALES_INVOICE)) {
      invoiceNewById.set(String(inv._id), inv.invoiceNumber);
      continue;
    }
    const baseDate = inv.invoiceDate || inv.createdAt || new Date();
    invoiceNewById.set(
      String(inv._id),
      allocateNumber(used, yearSeq, baseDate, DOCUMENT_PREFIX.SALES_INVOICE)
    );
  }

  let quoteUpdates = 0;
  let orderUpdates = 0;
  let invoiceUpdates = 0;

  console.log("── Quotations ──");
  for (const q of quotations) {
    const id = String(q._id);
    const next = quoteNewById.get(id);
    if (next !== q.quoteNumber) {
      console.log(`  ${q.quoteNumber} → ${next}`);
      quoteUpdates++;
      if (APPLY) await Quotation.updateOne({ _id: q._id }, { $set: { quoteNumber: next } });
    }
  }

  console.log("\n── Sales orders ──");
  for (const o of orders) {
    const id = String(o._id);
    const next = orderNewById.get(id);
    if (next !== o.orderNumber) {
      console.log(`  ${o.orderNumber} → ${next}`);
      orderUpdates++;
      if (APPLY) await SalesOrder.updateOne({ _id: o._id }, { $set: { orderNumber: next } });
    }
  }

  console.log("\n── Sales invoices ──");
  for (const inv of invoices) {
    const id = String(inv._id);
    const next = invoiceNewById.get(id);
    if (next !== inv.invoiceNumber) {
      console.log(`  ${inv.invoiceNumber} → ${next}`);
      invoiceUpdates++;
      if (APPLY) await SalesInvoice.updateOne({ _id: inv._id }, { $set: { invoiceNumber: next } });
    }
  }

  console.log(
    `\nSummary: ${quoteUpdates} quotation(s), ${orderUpdates} order(s), ${invoiceUpdates} invoice(s) to update.`
  );
  if (!APPLY) {
    console.log("No changes written. Re-run with: npm run migrate:document-numbers -- --apply");
  } else {
    console.log("✅ Database updated.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
