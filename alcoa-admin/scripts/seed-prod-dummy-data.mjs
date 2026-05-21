/**
 * Production dummy data: 4 quotations (10/12/15/20 items), 4 sales orders,
 * 4 sales invoices, 3 staff users, contact messages.
 *
 * Run:
 *   $env:MONGODB_DB_NAME="alcoa-admin-prod"; npm run seed:prod-dummy -- --confirm
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
import SalesOrder from "../models/SalesOrder.js";
import SalesInvoice from "../models/SalesInvoice.js";
import ContactMessage from "../models/ContactMessage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SEED_TAG = "prod-dummy-seed-v2";
const confirm = process.argv.includes("--confirm");
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME?.trim() || MONGO_DB_NAMES.production;

const QUOTE_SPECS = [
  { quoteNumber: "QT261019101", itemCount: 10, label: "Business Bay tower" },
  { quoteNumber: "QT261019102", itemCount: 12, label: "Jebel Ali warehouse" },
  { quoteNumber: "QT261019103", itemCount: 15, label: "Sharjah residential" },
  { quoteNumber: "QT261019104", itemCount: 20, label: "Abu Dhabi commercial" },
];

const ORDER_NUMBERS = ["SO261019201", "SO261019202", "SO261019203", "SO261019204"];
const INVOICE_NUMBERS = ["SI261019301", "SI261019302", "SI261019303", "SI261019304"];

const STAFF_USERS = [
  {
    name: "Prod Manager",
    email: "prod.manager@alcoascaffolding.ae",
    password: "Admin@1234",
    role: "manager",
    department: "management",
  },
  {
    name: "Prod Sales",
    email: "prod.sales@alcoascaffolding.ae",
    password: "Admin@1234",
    role: "sales",
    department: "sales",
  },
  {
    name: "Prod Accounts",
    email: "prod.accounts@alcoascaffolding.ae",
    password: "Admin@1234",
    role: "accountant",
    department: "accounts",
  },
];

const CONTACT_MESSAGES = [
  {
    type: "quote",
    name: "Ahmed Hassan Al Mansoori",
    email: "prod.dummy.ahmed@constructco.ae",
    phone: "+971 55 123 4567",
    company: "ConstructCo LLC",
    projectType: "commercial",
    message: "We need scaffolding for a G+12 commercial tower in Business Bay.",
    projectHeight: "42m",
    coverageArea: "1200 sqm",
    duration: "6 months",
    startDate: "2026-05-15",
    status: "responded",
    priority: "high",
  },
  {
    type: "contact",
    name: "Priya Ramachandran",
    email: "prod.dummy.priya@facilities.ae",
    phone: "+971 50 234 5678",
    company: "Facilities Plus LLC",
    projectType: "industrial",
    message: "Looking for ongoing rental of scaffolding for factory maintenance in Sharjah.",
    status: "in_progress",
    priority: "medium",
  },
  {
    type: "quote",
    name: "Mohammed Al Balushi",
    email: "prod.dummy.balushi@vision.ae",
    phone: "+971 56 345 6789",
    company: "Vision Construction",
    projectType: "residential",
    message: "Villa complex project in Jumeirah. Need aluminium towers for interior finishes.",
    projectHeight: "8m",
    coverageArea: "800 sqm",
    duration: "3 months",
    startDate: "2026-06-01",
    status: "new",
    priority: "high",
  },
  {
    type: "contact",
    name: "Rajesh Sharma",
    email: "prod.dummy.rajesh@maintserv.ae",
    phone: "+971 54 456 7890",
    company: "MaintServ UAE",
    projectType: "consultation",
    message: "Evaluating scaffolding providers for a 2-year FM contract.",
    status: "read",
    priority: "urgent",
  },
  {
    type: "quote",
    name: "Fatima Al Zaabi",
    email: "prod.dummy.fatima@emirates-dev.ae",
    phone: "+971 52 567 8901",
    company: "Emirates Development Corp",
    projectType: "commercial",
    message: "Hotel renovation on Sheikh Zayed Road. Rental rates for 8m towers.",
    projectHeight: "30m",
    coverageArea: "2500 sqm",
    duration: "4 months",
    startDate: "2026-05-20",
    status: "responded",
    priority: "high",
  },
  {
    type: "contact",
    name: "James O'Brien",
    email: "prod.dummy.jobrien@gulfpm.ae",
    phone: "+971 55 678 9012",
    company: "Gulf Project Management",
    projectType: "industrial",
    message: "Tank farm inspection project in Mussafah. Please send brochure.",
    status: "closed",
    priority: "medium",
  },
  {
    type: "quote",
    name: "Khalid Bin Saeed",
    email: "prod.dummy.khalid@saeedgroup.ae",
    phone: "+971 50 789 0123",
    company: "Saeed Group LLC",
    projectType: "residential",
    message: "G+4 residential building in Ajman. Complete scaffolding package.",
    projectHeight: "16m",
    coverageArea: "600 sqm",
    duration: "5 months",
    startDate: "2026-07-01",
    status: "new",
    priority: "medium",
  },
  {
    type: "contact",
    name: "Deepak Nair",
    email: "prod.dummy.deepak@uaefm.ae",
    phone: "+971 56 890 1234",
    company: "UAE Facilities Management",
    projectType: "rental",
    message: "Annual scaffolding rental contract — 15 sites across UAE.",
    status: "in_progress",
    priority: "urgent",
  },
];

function buildQuotationItems(count, label) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const qty = 1 + (i % 4);
    const rate = 150 + i * 25;
    const subtotal = qty * rate;
    const vatPct = 5;
    const vatAmount = Math.round((subtotal * vatPct) / 100 * 100) / 100;
    items.push({
      equipmentType: `[Prod] ${label} — Item ${i}`,
      description: "Aluminium scaffolding component",
      quantity: qty,
      unit: "Nos",
      ratePerUnit: rate,
      taxableAmount: subtotal,
      vatPercentage: vatPct,
      vatAmount,
      subtotal,
      weight: 0.5 + i * 0.1,
      cbm: 0.02 + i * 0.005,
    });
  }
  return items;
}

function itemsToSalesLines(items) {
  return items.map((it) => ({
    description: it.equipmentType,
    quantity: it.quantity,
    unit: it.unit || "Nos",
    unitPrice: it.ratePerUnit,
    total: it.subtotal,
  }));
}

function calcTotalsFromItems(items) {
  const subtotal = items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
  const vatAmount = items.reduce((s, it) => s + Number(it.vatAmount || 0), 0);
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI missing");
  process.exit(1);
}

if (!dbName.endsWith("-prod")) {
  console.error(`❌ Set MONGODB_DB_NAME=${MONGO_DB_NAMES.production}`);
  process.exit(1);
}

if (!confirm) {
  console.log("\n⚠️  Production dummy seed requires --confirm\n");
  console.log(`   Database: ${dbName}`);
  console.log("   Run: $env:MONGODB_DB_NAME=\"alcoa-admin-prod\"; npm run seed:prod-dummy -- --confirm\n");
  process.exit(1);
}

process.env.APP_ENV = "production";
process.env.MONGODB_DB_NAME = dbName;

try {
  validateMongoEnvironment();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}

console.log(`\n🌱 Production dummy data → ${dbName}\n`);

await mongoose.connect(MONGODB_URI, { dbName, family: 4 });

let adminUser = await User.findOne({ email: "admin@alcoascaffolding.ae" });
if (!adminUser) {
  adminUser = await User.create({
    name: "Super Admin",
    email: "admin@alcoascaffolding.ae",
    password: "Admin@1234",
    role: "super_admin",
    department: "management",
    isActive: true,
  });
  console.log("   ✅ Admin user created");
}

console.log("👤 Staff users (3)...");
for (const u of STAFF_USERS) {
  const exists = await User.findOne({ email: u.email });
  if (exists) {
    console.log(`   ℹ️  ${u.email} exists`);
    continue;
  }
  await User.create({ ...u, isActive: true, phone: "+971 4 100 0000" });
  console.log(`   ✅ ${u.email}`);
}

console.log("\n🏢 Customers...");
const customerSpecs = [
  { companyName: "[Prod] Gulf Tower Contracting LLC", emirate: "Dubai", email: "gulf.tower@prod-dummy.ae" },
  { companyName: "[Prod] Emirates Site Services", emirate: "Abu Dhabi", email: "emirates.site@prod-dummy.ae" },
  { companyName: "[Prod] Northern Build Co", emirate: "Sharjah", email: "northern.build@prod-dummy.ae" },
  { companyName: "[Prod] Coastal Projects FZE", emirate: "Ajman", email: "coastal.proj@prod-dummy.ae" },
];

const customers = [];
for (const c of customerSpecs) {
  let doc = await Customer.findOne({ companyName: c.companyName });
  if (!doc) {
    doc = await Customer.create({
      companyName: c.companyName,
      displayName: c.companyName.replace("[Prod] ", ""),
      primaryEmail: c.email,
      primaryPhone: "+971 50 111 2233",
      status: "active",
      customerType: "both",
      paymentTerms: "30 Days",
      addresses: [
        {
          type: "office",
          addressLine1: "Industrial Area 12",
          city: c.emirate,
          emirate: c.emirate,
          country: "UAE",
          isPrimary: true,
        },
      ],
      notes: SEED_TAG,
    });
    console.log(`   ✅ ${c.companyName}`);
  } else {
    console.log(`   ℹ️  ${c.companyName}`);
  }
  customers.push(doc);
}

const statuses = ["sent", "approved", "draft", "approved"];
const orderStatuses = ["confirmed", "in_progress", "delivered", "completed"];
const payStatuses = ["unpaid", "partially_paid", "paid", "unpaid"];

console.log("\n📋 Quotations (4)...");
const quotations = [];
for (let i = 0; i < QUOTE_SPECS.length; i++) {
  const spec = QUOTE_SPECS[i];
  let q = await Quotation.findOne({ quoteNumber: spec.quoteNumber });
  if (q) {
    console.log(`   ℹ️  ${spec.quoteNumber} (${spec.itemCount} items) exists`);
    quotations.push(q);
    continue;
  }
  const items = buildQuotationItems(spec.itemCount, spec.label);
  const { subtotal, vatAmount, total } = calcTotalsFromItems(items);
  const cust = customers[i];
  q = await Quotation.create({
    quoteNumber: spec.quoteNumber,
    customer: cust._id,
    customerName: cust.companyName,
    customerEmail: cust.primaryEmail,
    customerPhone: cust.primaryPhone,
    customerAddress: `${cust.addresses?.[0]?.addressLine1 || ""}, ${cust.addresses?.[0]?.emirate || "Dubai"}`,
    status: statuses[i],
    quoteType: "rental",
    subject: `Quotation — ${spec.label}`,
    items,
    subtotal,
    vatPercentage: 5,
    vatAmount,
    totalAmount: total,
    currency: "AED",
    quoteDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 86400000),
    internalNotes: SEED_TAG,
    createdBy: adminUser._id,
  });
  console.log(`   ✅ ${spec.quoteNumber} — ${spec.itemCount} line items`);
  quotations.push(q);
}

console.log("\n🛒 Sales orders (4)...");
const orders = [];
for (let i = 0; i < ORDER_NUMBERS.length; i++) {
  const orderNumber = ORDER_NUMBERS[i];
  let o = await SalesOrder.findOne({ orderNumber });
  const q = quotations[i];
  const salesItems = itemsToSalesLines(q.items);
  const subtotal = salesItems.reduce((s, r) => s + r.total, 0);
  const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
  if (o) {
    console.log(`   ℹ️  ${orderNumber} exists`);
    orders.push(o);
    continue;
  }
  o = await SalesOrder.create({
    orderNumber,
    customer: q.customer,
    customerName: q.customerName,
    customerEmail: q.customerEmail,
    customerPhone: q.customerPhone,
    quotation: q._id,
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 14 * 86400000),
    status: orderStatuses[i],
    items: salesItems,
    subtotal,
    vatAmount,
    total: subtotal + vatAmount,
    currency: "AED",
    notes: SEED_TAG,
    createdBy: adminUser._id,
  });
  console.log(`   ✅ ${orderNumber} ← ${q.quoteNumber}`);
  orders.push(o);
}

console.log("\n🧾 Sales invoices (4)...");
for (let i = 0; i < INVOICE_NUMBERS.length; i++) {
  const invoiceNumber = INVOICE_NUMBERS[i];
  const exists = await SalesInvoice.findOne({ invoiceNumber });
  if (exists) {
    console.log(`   ℹ️  ${invoiceNumber} exists`);
    continue;
  }
  const o = orders[i];
  const paidFrac = i === 2 ? 1 : i === 1 ? 0.5 : 0;
  const paidAmount = Math.round(o.total * paidFrac * 100) / 100;
  const inv = await SalesInvoice.create({
    invoiceNumber,
    customer: o.customer,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    salesOrder: o._id,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 86400000),
    paymentStatus: payStatuses[i],
    items: o.items,
    subtotal: o.subtotal,
    vatAmount: o.vatAmount,
    total: o.total,
    paidAmount,
    balance: Math.max(0, o.total - paidAmount),
    currency: "AED",
    notes: SEED_TAG,
    createdBy: adminUser._id,
  });
  console.log(`   ✅ ${invoiceNumber} ← ${o.orderNumber} (${inv.paymentStatus})`);
}

console.log("\n✉️  Contact messages...");
let msgCreated = 0;
for (const m of CONTACT_MESSAGES) {
  const exists = await ContactMessage.findOne({
    email: m.email,
    adminNotes: SEED_TAG,
  });
  if (exists) continue;
  await ContactMessage.create({ ...m, adminNotes: SEED_TAG });
  msgCreated++;
}
console.log(`   ✅ ${msgCreated} new messages (${CONTACT_MESSAGES.length} total in seed set)`);

console.log("\n═".repeat(50));
console.log("✅ Production dummy data complete.\n");
console.log("Quotations : QT261019101 (10), QT261019102 (12), QT261019103 (15), QT261019104 (20)");
console.log("Orders     : SO261019201 … SO261019204");
console.log("Invoices   : SI261019301 … SI261019304");
console.log("Users      : prod.manager@, prod.sales@, prod.accounts@ (password Admin@1234)\n");

await mongoose.disconnect();
process.exit(0);
