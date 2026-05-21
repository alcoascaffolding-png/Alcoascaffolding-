/**
 * Migrate document numbers: QT (quotation), SO (standalone order), SI (standalone invoice).
 * Linked order uses quotation number; linked invoice uses order number.
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
  randomDocumentSuffix,
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

function hasDocumentPrefix(value, prefix) {
  return Boolean(value && new RegExp(`^${prefix}\\d{11}$`).test(value));
}

function allocateNumber(usedSet, baseDate, prefix) {
  for (let i = 0; i < 200; i++) {
    const candidate = formatDocumentNumber(prefix, baseDate, randomDocumentSuffix());
    if (!usedSet.has(candidate)) {
      usedSet.add(candidate);
      return candidate;
    }
  }
  throw new Error(`Could not allocate unique number for date ${baseDate}`);
}

function seedUsedFromExisting(docs, field, usedSet) {
  for (const doc of docs) {
    const v = doc[field];
    if (v && DOCUMENT_NUMBER_REGEX.test(v)) usedSet.add(v);
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
  seedUsedFromExisting(quotations, "quoteNumber", used);
  seedUsedFromExisting(orders, "orderNumber", used);
  seedUsedFromExisting(invoices, "invoiceNumber", used);

  const quoteNewById = new Map();
  const orderNewById = new Map();
  const invoiceNewById = new Map();

  for (const q of quotations) {
    if (hasDocumentPrefix(q.quoteNumber, DOCUMENT_PREFIX.QUOTATION)) {
      quoteNewById.set(String(q._id), q.quoteNumber);
      continue;
    }
    const baseDate = q.quoteDate || q.createdAt || new Date();
    const next = allocateNumber(used, baseDate, DOCUMENT_PREFIX.QUOTATION);
    quoteNewById.set(String(q._id), next);
  }

  const orderByQuotation = new Map();
  for (const o of orders) {
    const qid = o.quotation ? String(o.quotation) : null;
    if (qid) orderByQuotation.set(qid, o);
  }

  for (const o of orders) {
    const qid = o.quotation ? String(o.quotation) : null;
    if (qid && quoteNewById.has(qid)) {
      orderNewById.set(String(o._id), quoteNewById.get(qid));
      continue;
    }
    if (hasDocumentPrefix(o.orderNumber, DOCUMENT_PREFIX.SALES_ORDER)) {
      orderNewById.set(String(o._id), o.orderNumber);
      continue;
    }
    const baseDate = o.orderDate || o.createdAt || new Date();
    orderNewById.set(String(o._id), allocateNumber(used, baseDate, DOCUMENT_PREFIX.SALES_ORDER));
  }

  const invoiceByOrder = new Map();
  for (const inv of invoices) {
    const sid = inv.salesOrder ? String(inv.salesOrder) : null;
    if (sid) invoiceByOrder.set(sid, inv);
  }

  for (const inv of invoices) {
    const sid = inv.salesOrder ? String(inv.salesOrder) : null;
    if (sid && orderNewById.has(sid)) {
      invoiceNewById.set(String(inv._id), orderNewById.get(sid));
      continue;
    }
    if (hasDocumentPrefix(inv.invoiceNumber, DOCUMENT_PREFIX.SALES_INVOICE)) {
      invoiceNewById.set(String(inv._id), inv.invoiceNumber);
      continue;
    }
    const baseDate = inv.invoiceDate || inv.createdAt || new Date();
    invoiceNewById.set(String(inv._id), allocateNumber(used, baseDate, DOCUMENT_PREFIX.SALES_INVOICE));
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
