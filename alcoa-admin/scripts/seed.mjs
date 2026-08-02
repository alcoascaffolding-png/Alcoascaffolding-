/**
 * Alcoa Scaffolding — MongoDB Atlas Seed Script (dev only)
 * Run: npm run seed   (or: node --require ./dns-fix.cjs scripts/seed.mjs)
 *
 * Resets and seeds alcoa-admin-dev with realistic interconnected UAE scaffolding data.
 * Refuses to run on any database other than alcoa-admin-dev.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { getMongoDbName, validateMongoEnvironment, MONGO_DB_NAMES } from "../lib/mongodb-config.js";
import { companyBankAccountSeedDoc, COMPANY_BANK_DETAILS } from "../lib/company-bank-details.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const ALLOWED_DB = MONGO_DB_NAMES.development;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not found in .env.local"); process.exit(1); }

// ─── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

function buildQuotationItems(products, numItems) {
  const items = [];
  for (let j = 0; j < numItems; j++) {
    const prod = products[rand(0, products.length - 1)];
    const qty = rand(1, 20);
    const rate = prod.rentalPrice || prod.sellingPrice;
    const rentalDays = rand(7, 180);
    const taxable = (qty * rate * rentalDays) / 30;
    const vat = taxable * 0.05;
    items.push({
      product: prod._id,
      equipmentType: prod.name,
      equipmentCode: prod.itemCode,
      description: prod.description || prod.name,
      specifications: prod.specifications,
      size: prod.dimensions,
      quantity: qty,
      unit: prod.unit,
      rentalDuration: { value: rentalDays, unit: "day" },
      ratePerUnit: rate,
      taxableAmount: parseFloat(taxable.toFixed(2)),
      vatPercentage: 5,
      vatAmount: parseFloat(vat.toFixed(2)),
      subtotal: parseFloat((taxable + vat).toFixed(2)),
    });
  }
  return items;
}

function quotationTotals(items, delivery = 0, installation = 0) {
  const subtotal = items.reduce((s, it) => s + it.taxableAmount, 0);
  const beforeVAT = subtotal + delivery + installation;
  const vatAmount = parseFloat((beforeVAT * 0.05).toFixed(2));
  const totalAmount = parseFloat((beforeVAT + vatAmount).toFixed(2));
  return { subtotal: parseFloat(subtotal.toFixed(2)), vatAmount, totalAmount };
}

function quoteItemsToSalesLines(quoteItems, products) {
  return quoteItems.map((it) => {
    const prod = products.find((p) => p.itemCode === it.equipmentCode) || products[0];
    const unitPrice = it.ratePerUnit || prod.rentalPrice || prod.sellingPrice;
    const qty = it.quantity;
    return {
      product: prod._id,
      description: it.description || prod.name,
      equipmentType: it.equipmentType,
      quantity: qty,
      unit: it.unit || prod.unit,
      unitPrice,
      total: parseFloat((qty * unitPrice).toFixed(2)),
    };
  });
}

function buildSalesLineItems(products, numItems) {
  const items = [];
  for (let j = 0; j < numItems; j++) {
    const prod = products[rand(0, products.length - 1)];
    const qty = rand(1, 15);
    const unitPrice = prod.rentalPrice || prod.sellingPrice;
    items.push({
      product: prod._id,
      description: prod.name,
      equipmentType: prod.name,
      quantity: qty,
      unit: prod.unit,
      unitPrice,
      total: parseFloat((qty * unitPrice).toFixed(2)),
    });
  }
  return items;
}

function salesLinesTotals(items) {
  const subtotal = parseFloat(items.reduce((s, it) => s + it.total, 0).toFixed(2));
  const vatAmount = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));
  return { subtotal, vatAmount, total };
}

// ─── Schemas (inline — avoids circular import issues in script context) ──────

const contactPersonSchema = new mongoose.Schema({
  name: String, designation: String, email: String, phone: String,
  whatsapp: String, isPrimary: { type: Boolean, default: false },
  role: { type: String, default: "other" },
}, { _id: true });

const addressSchema = new mongoose.Schema({
  type: { type: String, default: "office" },
  addressLine1: String, addressLine2: String, area: String,
  city: String, emirate: String, country: { type: String, default: "UAE" },
  poBox: String, isPrimary: { type: Boolean, default: false },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: String, department: String, phone: String, isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const BankAccountSchema = new mongoose.Schema({
  accountName: String, bankName: String, accountNumber: { type: String, unique: true },
  iban: String, swiftCode: String, branch: String,
  currency: { type: String, default: "AED" },
  openingBalance: Number, currentBalance: Number,
  isActive: { type: Boolean, default: true },
  isPrimary: { type: Boolean, default: false },
  notes: String,
}, { timestamps: true });

const VendorSchema = new mongoose.Schema({
  vendorCode: { type: String, unique: true }, companyName: String,
  contactPerson: String, email: String, phone: String, whatsapp: String,
  address: String, emirate: String, country: { type: String, default: "UAE" },
  tradeLicenseNumber: String, vatNumber: String,
  paymentTerms: String, creditLimit: Number, currentBalance: Number,
  status: { type: String, default: "active" }, category: String, notes: String,
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  companyName: String, displayName: String, tradeLicenseNumber: String,
  vatRegistrationNumber: String, businessType: String, industry: String, website: String,
  contactPersons: [contactPersonSchema], addresses: [addressSchema],
  primaryEmail: String, primaryPhone: String, primaryWhatsApp: String,
  paymentTerms: String, creditLimit: Number, currentBalance: Number,
  currency: { type: String, default: "AED" },
  status: String, customerType: String, rating: Number, priority: String,
  customerSince: Date, lastOrderDate: Date, totalOrders: Number, totalRevenue: Number,
  notes: String, tags: [String], source: String,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, unique: true }, name: String, description: String,
  category: String, unit: { type: String, default: "Nos" },
  sellingPrice: Number, rentalPrice: Number, purchasePrice: Number,
  currentStock: Number, minStock: Number, maxStock: Number,
  specifications: String, dimensions: String, weight: Number,
  isActive: { type: Boolean, default: true }, notes: String,
}, { timestamps: true });

const quotationItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  equipmentType: String, equipmentCode: String, description: String,
  specifications: String, size: String, quantity: Number, unit: { type: String, default: "Nos" },
  rentalDuration: { value: Number, unit: String },
  ratePerUnit: Number, taxableAmount: Number,
  vatPercentage: { type: Number, default: 5 }, vatAmount: Number, subtotal: Number,
}, { _id: true });

const QuotationSchema = new mongoose.Schema({
  quoteNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: String, customerAddress: String, customerEmail: String,
  customerPhone: String, customerTRN: String,
  contactPersonName: String, contactPersonDesignation: String,
  quoteDate: Date, validUntil: Date,
  quoteType: { type: String, default: "rental" },
  status: { type: String, default: "draft" },
  subject: String, salesExecutive: String, preparedBy: String,
  paymentTerms: String, deliveryTerms: String, projectDuration: String,
  items: [quotationItemSchema],
  subtotal: Number, deliveryCharges: Number, installationCharges: Number,
  pickupCharges: Number, discount: Number, discountType: String,
  vatPercentage: { type: Number, default: 5 }, vatAmount: Number, totalAmount: Number,
  currency: { type: String, default: "AED" },
  deliveryAddress: { addressLine1: String, area: String, city: String, emirate: String },
  deliveryDate: Date, notes: String,
  convertedToOrder: { type: Boolean, default: false },
  convertedToInvoice: { type: Boolean, default: false },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" },
  convertedAt: Date,
  bankDetails: { bankName: String, accountName: String, accountNumber: String, iban: String, swiftCode: String, branch: String },
}, { timestamps: true });

const lineItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  description: String, equipmentType: String, quantity: Number, unit: { type: String, default: "Nos" },
  unitPrice: Number, total: Number,
}, { _id: true });

const SalesOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: String,
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
  orderDate: Date, deliveryDate: Date, status: String,
  items: [lineItemSchema], subtotal: Number, vatAmount: Number, total: Number,
  currency: { type: String, default: "AED" }, notes: String,
}, { timestamps: true });

const SalesInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: String,
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" },
  invoiceDate: Date, dueDate: Date, paymentStatus: String,
  items: [lineItemSchema], subtotal: Number, vatAmount: Number, total: Number,
  paidAmount: Number, balance: Number, currency: { type: String, default: "AED" }, notes: String,
}, { timestamps: true });

const ReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: String,
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" }],
  allocations: [{ invoice: { type: mongoose.Schema.Types.ObjectId, ref: "SalesInvoice" }, amount: Number }],
  receiptDate: Date, amount: Number, paymentMethod: String,
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
  reference: String, notes: String,
}, { timestamps: true });

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorName: String, orderDate: Date, deliveryDate: Date, status: String,
  items: [lineItemSchema], subtotal: Number, vatAmount: Number, total: Number,
  currency: { type: String, default: "AED" }, notes: String,
  stockApplied: { type: Boolean, default: false },
}, { timestamps: true });

const PurchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorName: String,
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" },
  invoiceDate: Date, dueDate: Date, paymentStatus: String,
  items: [lineItemSchema],
  subtotal: Number, vatAmount: Number, total: Number,
  paidAmount: Number, balance: Number, currency: { type: String, default: "AED" }, notes: String,
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorName: String,
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "PurchaseInvoice" }],
  allocations: [{ invoice: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseInvoice" }, amount: Number }],
  paymentDate: Date, amount: Number, paymentMethod: String,
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
  reference: String, notes: String,
}, { timestamps: true });

const StockAdjustmentSchema = new mongoose.Schema({
  adjustmentNumber: { type: String, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productName: String, adjustmentType: String,
  quantity: Number, previousStock: Number, newStock: Number,
  reason: String, notes: String,
}, { timestamps: true });

const ContactMessageSchema = new mongoose.Schema({
  type: String, name: String, email: String, phone: String, company: String,
  projectType: String, message: String, projectHeight: String,
  coverageArea: String, duration: String, startDate: String,
  status: { type: String, default: "new" },
  priority: { type: String, default: "medium" },
  adminNotes: String, emailSent: Boolean,
}, { timestamps: true });

const deliveryLineItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  description: String, equipmentType: String, specifications: String, size: String,
  quantity: Number, unit: { type: String, default: "Nos" },
}, { _id: true });

const DeliveryNoteSchema = new mongoose.Schema({
  deliveryNoteNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: String, customerEmail: String, customerPhone: String, customerAddress: String,
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
  deliveryDate: Date, deliveryAddress: String,
  driverName: String, vehicleNumber: String,
  contactPersonName: String, contactPersonPhone: String,
  status: { type: String, default: "draft" },
  noteType: { type: String, default: "delivery" },
  items: [deliveryLineItemSchema],
  stockApplied: { type: Boolean, default: false },
  notes: String,
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userEmail: String,
  action: String,
  resource: String,
  resourceId: String,
  summary: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// ─── Models ──────────────────────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const BankAccount = mongoose.models.BankAccount || mongoose.model("BankAccount", BankAccountSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", QuotationSchema);
const SalesOrder = mongoose.models.SalesOrder || mongoose.model("SalesOrder", SalesOrderSchema);
const SalesInvoice = mongoose.models.SalesInvoice || mongoose.model("SalesInvoice", SalesInvoiceSchema);
const Receipt = mongoose.models.Receipt || mongoose.model("Receipt", ReceiptSchema);
const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", PurchaseOrderSchema);
const PurchaseInvoice = mongoose.models.PurchaseInvoice || mongoose.model("PurchaseInvoice", PurchaseInvoiceSchema);
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
const StockAdjustment = mongoose.models.StockAdjustment || mongoose.model("StockAdjustment", StockAdjustmentSchema);
const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
const DeliveryNote = mongoose.models.DeliveryNote || mongoose.model("DeliveryNote", DeliveryNoteSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

// ─── Raw Data ────────────────────────────────────────────────────────────────

const AREAS_BY_EMIRATE = {
  Dubai: ["Business Bay", "Deira", "Bur Dubai", "Jumeirah", "Al Quoz", "Dubai Silicon Oasis", "Jebel Ali"],
  "Abu Dhabi": ["Khalifa City", "Mussafah", "Al Reem Island", "Yas Island", "Al Nahyan"],
  Sharjah: ["Al Nahda", "Industrial Area", "Al Majaz", "Al Taawun"],
  Ajman: ["Al Jurf", "Al Rashidiya", "Ajman Industrial"],
  "Ras Al Khaimah": ["Al Hamra", "Seih Al Harf Industrial", "Nakheel"],
  Fujairah: ["Fujairah City", "Dibba", "Khor Fakkan"],
  "Umm Al Quwain": ["Umm Al Quwain City"],
};

const CUSTOMERS_DATA = [
  { companyName: "Al Futtaim Construction LLC", businessType: "Construction Company", vatReg: "100345678912345", tradeLic: "CN-DXB-2019-45321", emirate: "Dubai", email: "procurement@alfuttaimconstruction.ae", phone: "+971 4 234 5678", status: "active", priority: "vip", source: "Referral", paymentTerms: "30 Days", creditLimit: 250000 },
  { companyName: "Arabtec Holding PJSC", businessType: "Construction Company", vatReg: "100234567891234", tradeLic: "CN-DXB-2015-12345", emirate: "Dubai", email: "supply@arabtec.ae", phone: "+971 4 345 6789", status: "active", priority: "vip", source: "Phone Call", paymentTerms: "45 Days", creditLimit: 500000 },
  { companyName: "Drake & Scull International", businessType: "Contractor", vatReg: "100456789123456", tradeLic: "CN-DXB-2016-67890", emirate: "Dubai", email: "orders@drakeandscull.ae", phone: "+971 4 456 7890", status: "active", priority: "high", source: "Website", paymentTerms: "30 Days", creditLimit: 200000 },
  { companyName: "Dutco Balfour Beatty LLC", businessType: "Construction Company", vatReg: "100567891234567", tradeLic: "CN-DXB-2014-34567", emirate: "Dubai", email: "logistics@dutco.ae", phone: "+971 4 567 8901", status: "active", priority: "high", source: "Referral", paymentTerms: "30 Days", creditLimit: 300000 },
  { companyName: "Six Construct LLC", businessType: "Construction Company", vatReg: "100678912345678", tradeLic: "CN-ABD-2018-78901", emirate: "Abu Dhabi", email: "procurement@sixconstruct.ae", phone: "+971 2 678 9012", status: "active", priority: "high", source: "Email", paymentTerms: "45 Days", creditLimit: 400000 },
  { companyName: "Al Habtoor Engineering", businessType: "Contractor", vatReg: "100789123456789", tradeLic: "CN-DXB-2017-23456", emirate: "Dubai", email: "material@alhabtoor.ae", phone: "+971 4 789 0123", status: "active", priority: "medium", source: "Walk-in", paymentTerms: "15 Days", creditLimit: 150000 },
  { companyName: "Emaar Construction LLC", businessType: "Construction Company", vatReg: "100891234567891", tradeLic: "CN-DXB-2013-89012", emirate: "Dubai", email: "scaffolding@emaar.ae", phone: "+971 4 890 1234", status: "active", priority: "vip", source: "Referral", paymentTerms: "60 Days", creditLimit: 600000 },
  { companyName: "ALEC Engineering & Contracting", businessType: "Contractor", vatReg: "100912345678912", tradeLic: "CN-DXB-2016-45678", emirate: "Dubai", email: "equipment@alec.ae", phone: "+971 4 901 2345", status: "active", priority: "high", source: "Website", paymentTerms: "30 Days", creditLimit: 250000 },
  { companyName: "Khansaheb Civil Engineering", businessType: "Construction Company", vatReg: "100123456789123", tradeLic: "CN-DXB-2015-56789", emirate: "Dubai", email: "hire@khansaheb.ae", phone: "+971 4 012 3456", status: "active", priority: "medium", source: "Phone Call", paymentTerms: "30 Days", creditLimit: 200000 },
  { companyName: "National Projects & Construction", businessType: "Construction Company", vatReg: "100234567891235", tradeLic: "CN-SHJ-2020-12346", emirate: "Sharjah", email: "rental@npc.ae", phone: "+971 6 234 5679", status: "active", priority: "medium", source: "Social Media", paymentTerms: "15 Days", creditLimit: 100000 },
  { companyName: "Al Bonian Building Contracting", businessType: "Contractor", vatReg: "100345678912346", tradeLic: "CN-AJM-2021-34568", emirate: "Ajman", email: "info@albonian.ae", phone: "+971 6 345 6780", status: "prospect", priority: "medium", source: "Website", paymentTerms: "Cash", creditLimit: 50000 },
  { companyName: "RAK Properties LLC", businessType: "Construction Company", vatReg: "100456789123457", tradeLic: "CN-RAK-2019-67891", emirate: "Ras Al Khaimah", email: "projects@rakproperties.ae", phone: "+971 7 456 7891", status: "active", priority: "medium", source: "Email", paymentTerms: "30 Days", creditLimit: 180000 },
  { companyName: "Galadari Engineering Works", businessType: "Contractor", vatReg: "100567891234568", tradeLic: "CN-DXB-2018-78902", emirate: "Dubai", email: "equipment@galadari.ae", phone: "+971 4 567 8902", status: "active", priority: "low", source: "Referral", paymentTerms: "7 Days", creditLimit: 75000 },
  { companyName: "Shapoorji Pallonji Mideast LLC", businessType: "Construction Company", vatReg: "100678912345679", tradeLic: "CN-ABD-2017-89013", emirate: "Abu Dhabi", email: "procurement@shapoorji.ae", phone: "+971 2 678 9013", status: "active", priority: "high", source: "Phone Call", paymentTerms: "45 Days", creditLimit: 350000 },
  { companyName: "Hassan Allam Construction", businessType: "Construction Company", vatReg: "100912345678913", tradeLic: "CN-ABD-2016-34569", emirate: "Abu Dhabi", email: "scaffolding@hassanallam.ae", phone: "+971 2 901 2346", status: "active", priority: "high", source: "Referral", paymentTerms: "30 Days", creditLimit: 280000 },
];

const VENDORS_DATA = [
  { vendorCode: "VND-001", companyName: "Gulf Scaffolding Supplies LLC", contactPerson: "Mohammed Al Rashid", email: "sales@gulfscaffolding.ae", phone: "+971 4 111 2233", emirate: "Dubai", category: "Supplier", paymentTerms: "30 Days", creditLimit: 200000, vatNumber: "100111222333444" },
  { vendorCode: "VND-002", companyName: "Emirates Steel Trading LLC", contactPerson: "Rashid Al Maktoum", email: "orders@emiratessteel.ae", phone: "+971 4 222 3344", emirate: "Dubai", category: "Manufacturer", paymentTerms: "45 Days", creditLimit: 500000, vatNumber: "100222333444555" },
  { vendorCode: "VND-003", companyName: "Al Madina Hardware Trading", contactPerson: "Hassan Khalid", email: "procurement@almadinahardware.ae", phone: "+971 6 333 4455", emirate: "Sharjah", category: "Distributor", paymentTerms: "Cash", creditLimit: 50000, vatNumber: "100333444555666" },
  { vendorCode: "VND-004", companyName: "Safety First Equipment LLC", contactPerson: "Ahmed Qureshi", email: "info@safetyfirstuae.ae", phone: "+971 4 444 5566", emirate: "Dubai", category: "Supplier", paymentTerms: "15 Days", creditLimit: 100000, vatNumber: "100444555666777" },
  { vendorCode: "VND-005", companyName: "Aluminium World FZE", contactPerson: "Priya Nair", email: "supply@aluminiumworld.ae", phone: "+971 6 555 6677", emirate: "Sharjah", category: "Manufacturer", paymentTerms: "30 Days", creditLimit: 300000, vatNumber: "100555666777888" },
  { vendorCode: "VND-006", companyName: "Jebel Ali Industrial Supplies", contactPerson: "Khalid Ibrahim", email: "sales@jebelaliiind.ae", phone: "+971 4 666 7788", emirate: "Dubai", category: "Distributor", paymentTerms: "Cash", creditLimit: 80000, vatNumber: "100666777888999" },
  { vendorCode: "VND-007", companyName: "International Tools & Equipment LLC", contactPerson: "Sanjay Kumar", email: "orders@intltools.ae", phone: "+971 2 777 8899", emirate: "Abu Dhabi", category: "Supplier", paymentTerms: "30 Days", creditLimit: 150000, vatNumber: "100777888999000" },
  { vendorCode: "VND-008", companyName: "Delta Steel & Aluminium", contactPerson: "Omar Abdullah", email: "info@deltasteel.ae", phone: "+971 4 888 9900", emirate: "Dubai", category: "Manufacturer", paymentTerms: "60 Days", creditLimit: 400000, vatNumber: "100888999000111" },
  { vendorCode: "VND-009", companyName: "Prime Scaffold Components FZE", contactPerson: "Fatima Al Ketbi", email: "orders@primescaffold.ae", phone: "+971 4 999 0011", emirate: "Dubai", category: "Supplier", paymentTerms: "30 Days", creditLimit: 175000, vatNumber: "100999000111222" },
  { vendorCode: "VND-010", companyName: "Northern Emirates Trading Co", contactPerson: "Rajesh Menon", email: "supply@northernemirates.ae", phone: "+971 7 000 1122", emirate: "Ras Al Khaimah", category: "Distributor", paymentTerms: "15 Days", creditLimit: 90000, vatNumber: "100000111222333" },
];

const PRODUCTS_DATA = [
  { itemCode: "ALU-SF-001", name: "Aluminium Scaffolding Tower - 3m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 3500, rentalPrice: 250, purchasePrice: 2200, currentStock: 45, minStock: 10, maxStock: 80, dimensions: "0.75m x 1.85m x 3m", weight: 85, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, SWL 200kg/platform" },
  { itemCode: "ALU-SF-002", name: "Aluminium Scaffolding Tower - 5m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 5200, rentalPrice: 380, purchasePrice: 3300, currentStock: 30, minStock: 8, maxStock: 50, dimensions: "0.75m x 1.85m x 5m", weight: 130, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, SWL 200kg/platform" },
  { itemCode: "ALU-SF-003", name: "Aluminium Scaffolding Tower - 8m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 7800, rentalPrice: 560, purchasePrice: 4900, currentStock: 20, minStock: 5, maxStock: 35, dimensions: "0.75m x 1.85m x 8m", weight: 185, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, SWL 200kg/platform, Stabilisers included" },
  { itemCode: "ALU-SF-004", name: "Aluminium Scaffolding Tower - 10m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 9500, rentalPrice: 700, purchasePrice: 6000, currentStock: 15, minStock: 4, maxStock: 25, dimensions: "0.75m x 1.85m x 10m", weight: 230, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, SWL 200kg/platform" },
  { itemCode: "ALU-SF-005", name: "Aluminium Scaffolding Tower - 12m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 12000, rentalPrice: 900, purchasePrice: 7500, currentStock: 10, minStock: 3, maxStock: 18, dimensions: "0.75m x 1.85m x 12m", weight: 280, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, Double width platform" },
  { itemCode: "STL-SF-001", name: "Steel Scaffolding System - Standard Bay", category: "Steel Scaffolding", unit: "Set", sellingPrice: 2800, rentalPrice: 180, purchasePrice: 1600, currentStock: 60, minStock: 15, maxStock: 100, dimensions: "1.2m x 2.0m", weight: 320, specifications: "Hot-dip galvanised, BS EN 12810 Standard, SWL 750kg/m²" },
  { itemCode: "STL-SF-002", name: "Steel Scaffolding Tube - 6m", category: "Steel Scaffolding", unit: "Nos", sellingPrice: 120, rentalPrice: 8, purchasePrice: 75, currentStock: 500, minStock: 100, maxStock: 800, dimensions: "48.3mm OD x 6000mm", weight: 21, specifications: "Grade S235, Hot-dip galvanised BS EN 10025" },
  { itemCode: "STL-SF-003", name: "Steel Scaffolding Coupler - Swivel", category: "Steel Scaffolding", unit: "Nos", sellingPrice: 18, rentalPrice: 1.5, purchasePrice: 10, currentStock: 2000, minStock: 500, maxStock: 3000, specifications: "Drop forged, BS EN 74-1, SWL 6.25kN" },
  { itemCode: "ALU-LDR-001", name: "Aluminium Extension Ladder - 6m", category: "Ladders", unit: "Nos", sellingPrice: 850, rentalPrice: 60, purchasePrice: 520, currentStock: 35, minStock: 8, maxStock: 50, dimensions: "Extended: 6m, Closed: 3.3m", weight: 12, specifications: "EN131 Standard, SWL 150kg, Anti-slip rubber feet" },
  { itemCode: "ALU-LDR-002", name: "Aluminium Step Ladder - 8 Step", category: "Ladders", unit: "Nos", sellingPrice: 420, rentalPrice: 30, purchasePrice: 260, currentStock: 50, minStock: 10, maxStock: 70, dimensions: "Height: 2.4m", weight: 8, specifications: "EN131 Standard, SWL 150kg, Platform with handrails" },
  { itemCode: "ALU-LDR-003", name: "Platform Ladder - 3 Step", category: "Ladders", unit: "Nos", sellingPrice: 380, rentalPrice: 25, purchasePrice: 230, currentStock: 40, minStock: 8, maxStock: 60, specifications: "EN131 Standard, SWL 150kg, Wide anti-slip steps" },
  { itemCode: "ACC-PLK-001", name: "Aluminium Platform Board - 3m", category: "Accessories", unit: "Nos", sellingPrice: 650, rentalPrice: 45, purchasePrice: 400, currentStock: 80, minStock: 20, maxStock: 120, dimensions: "3000mm x 450mm x 25mm", weight: 9, specifications: "Grade 6082 Aluminium, Anti-slip punched surface" },
  { itemCode: "ACC-PLK-002", name: "Timber Scaffold Board - 3.9m", category: "Accessories", unit: "Nos", sellingPrice: 220, rentalPrice: 15, purchasePrice: 130, currentStock: 200, minStock: 50, maxStock: 300, dimensions: "3900mm x 225mm x 38mm", weight: 15, specifications: "Regularised softwood BS 2482, BSI Kitemarked" },
  { itemCode: "ACC-WHL-001", name: "Scaffold Tower Wheel - 200mm", category: "Accessories", unit: "Nos", sellingPrice: 95, rentalPrice: 6, purchasePrice: 58, currentStock: 120, minStock: 30, maxStock: 200, specifications: "With brake, 200mm diameter, Load rating 200kg each" },
  { itemCode: "ACC-OBG-001", name: "Outrigger / Base Guard Set", category: "Accessories", unit: "Set", sellingPrice: 280, rentalPrice: 20, purchasePrice: 170, currentStock: 55, minStock: 12, maxStock: 80, specifications: "4-piece set, adjustable 500mm-900mm, EN1004 compliant" },
  { itemCode: "SAF-HRN-001", name: "Full Body Safety Harness", category: "Safety Equipment", unit: "Nos", sellingPrice: 180, rentalPrice: 12, purchasePrice: 105, currentStock: 75, minStock: 15, maxStock: 100, specifications: "EN361, EN358 certified, Adjustable, Polyester webbing" },
  { itemCode: "SAF-HLM-001", name: "Safety Helmet - White", category: "Safety Equipment", unit: "Nos", sellingPrice: 35, rentalPrice: 3, purchasePrice: 20, currentStock: 200, minStock: 50, maxStock: 300, specifications: "EN397, ABS shell, 4-point suspension, ratchet adjustment" },
  { itemCode: "SAF-NET-001", name: "Safety Net - 6m x 10m", category: "Safety Equipment", unit: "Nos", sellingPrice: 450, rentalPrice: 30, purchasePrice: 270, currentStock: 30, minStock: 8, maxStock: 50, dimensions: "6m x 10m", specifications: "EN1263-1, HDPE, 100mm mesh, with edge rope and tie cords" },
  { itemCode: "ALU-SF-EXT-001", name: "Stairway Tower Extension Frame", category: "Aluminium Scaffolding", unit: "Nos", sellingPrice: 1200, rentalPrice: 85, purchasePrice: 750, currentStock: 25, minStock: 6, maxStock: 40, specifications: "0.75m x 1.85m frame with built-in stairway access" },
  { itemCode: "STL-BASE-001", name: "Adjustable Base Plate - Heavy Duty", category: "Steel Scaffolding", unit: "Nos", sellingPrice: 65, rentalPrice: 4, purchasePrice: 38, currentStock: 300, minStock: 80, maxStock: 500, specifications: "150x150mm plate, M38 spindle, 600mm adjustment range, hot-dip galvanised" },
  { itemCode: "ALU-SF-006", name: "Aluminium Scaffolding Tower - 6m", category: "Aluminium Scaffolding", unit: "Set", sellingPrice: 6200, rentalPrice: 450, purchasePrice: 3900, currentStock: 22, minStock: 6, maxStock: 40, dimensions: "0.75m x 1.85m x 6m", weight: 155, specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, SWL 200kg/platform" },
  { itemCode: "STL-SF-004", name: "Steel Ledger - 2.5m", category: "Steel Scaffolding", unit: "Nos", sellingPrice: 95, rentalPrice: 7, purchasePrice: 58, currentStock: 350, minStock: 80, maxStock: 600, dimensions: "48.3mm OD x 2500mm", weight: 9, specifications: "Hot-dip galvanised, BS EN 12810" },
  { itemCode: "ACC-TOE-001", name: "Toe Board Set - 2.5m", category: "Accessories", unit: "Set", sellingPrice: 145, rentalPrice: 10, purchasePrice: 88, currentStock: 90, minStock: 20, maxStock: 150, specifications: "Timber toe boards with metal clips, BS 2482 compliant" },
  { itemCode: "SAF-LNY-001", name: "Safety Lanyard with Shock Absorber", category: "Safety Equipment", unit: "Nos", sellingPrice: 95, rentalPrice: 7, purchasePrice: 55, currentStock: 60, minStock: 15, maxStock: 100, specifications: "EN355, 1.8m adjustable, twin-leg option" },
  { itemCode: "ACC-FAN-001", name: "Scaffold Fan Access Platform", category: "Accessories", unit: "Nos", sellingPrice: 890, rentalPrice: 65, purchasePrice: 540, currentStock: 18, minStock: 4, maxStock: 30, specifications: "Fan-shaped access platform for corner work, aluminium" },
];

const CONTACT_MESSAGES_DATA = [
  { type: "quote", name: "Ahmed Hassan Al Mansoori", email: "ahmed.mansoori@constructco.ae", phone: "+971 55 123 4567", company: "ConstructCo LLC", projectType: "commercial", message: "We need scaffolding for a G+12 commercial tower in Business Bay. Project starts next month.", projectHeight: "42m", coverageArea: "1200 sqm", duration: "6 months", startDate: "2026-05-15", status: "responded", priority: "high" },
  { type: "contact", name: "Priya Ramachandran", email: "priya.r@facilities.ae", phone: "+971 50 234 5678", company: "Facilities Plus LLC", projectType: "industrial", message: "Looking for ongoing rental of scaffolding for factory maintenance in Sharjah Industrial Area.", status: "in_progress", priority: "medium" },
  { type: "quote", name: "Mohammed Al Balushi", email: "m.balushi@vision.ae", phone: "+971 56 345 6789", company: "Vision Construction", projectType: "residential", message: "Villa complex project in Jumeirah. Need aluminium towers for interior finishes.", projectHeight: "8m", coverageArea: "800 sqm", duration: "3 months", startDate: "2026-06-01", status: "new", priority: "high" },
  { type: "contact", name: "Rajesh Sharma", email: "rajesh@maintserv.ae", phone: "+971 54 456 7890", company: "MaintServ UAE", projectType: "consultation", message: "We are evaluating scaffolding providers for a 2-year FM contract. Would like a meeting.", status: "read", priority: "urgent" },
  { type: "quote", name: "Fatima Al Zaabi", email: "fatima.z@emirates-dev.ae", phone: "+971 52 567 8901", company: "Emirates Development Corp", projectType: "commercial", message: "Hotel renovation project on Sheikh Zayed Road. Enquiring about rental rates for 8m towers.", projectHeight: "30m", coverageArea: "2500 sqm", duration: "4 months", startDate: "2026-05-20", status: "responded", priority: "high" },
  { type: "contact", name: "James O'Brien", email: "jobrien@gulfpm.ae", phone: "+971 55 678 9012", company: "Gulf Project Management", projectType: "industrial", message: "Tank farm inspection project in Mussafah. Need heavy duty scaffolding. Please send brochure.", status: "closed", priority: "medium" },
  { type: "quote", name: "Khalid Bin Saeed", email: "khalid.saeed@saeedgroup.ae", phone: "+971 50 789 0123", company: "Saeed Group LLC", projectType: "residential", message: "G+4 residential building in Ajman. Looking for complete scaffolding package including safety nets.", projectHeight: "16m", coverageArea: "600 sqm", duration: "5 months", startDate: "2026-07-01", status: "new", priority: "medium" },
  { type: "contact", name: "Deepak Nair", email: "deepak.n@uaefm.ae", phone: "+971 56 890 1234", company: "UAE Facilities Management", projectType: "rental", message: "Annual scaffolding rental contract inquiry. We have 15 sites across UAE.", status: "in_progress", priority: "urgent" },
  { type: "quote", name: "Salem Al Ameri", email: "salem@alamerisolutions.ae", phone: "+971 54 901 2345", company: "Al Ameri Solutions", projectType: "emergency", message: "Urgent — need scaffolding for emergency facade repairs on a residential tower in Dubai Marina.", projectHeight: "25m", coverageArea: "400 sqm", duration: "2 weeks", startDate: "2026-04-25", status: "read", priority: "urgent" },
  { type: "contact", name: "Amira Al Shamsi", email: "amira@shamsigroup.ae", phone: "+971 52 012 3456", company: "Shamsi Group", projectType: "commercial", message: "Office fitout project in DIFC. Need internal scaffolding towers for ceiling works.", status: "new", priority: "low" },
];

const PENDING_QUOTE_STATUSES = ["draft", "sent", "viewed", "approved", "rejected", "draft", "sent", "viewed"];
const SO_STATUSES = ["confirmed", "in_progress", "delivered", "completed", "invoiced", "confirmed", "in_progress", "delivered", "completed"];
const SI_STATUSES = ["paid", "paid", "paid", "partially_paid", "unpaid", "overdue", "paid", "partially_paid", "unpaid", "paid", "paid", "overdue"];
const PO_STATUSES = ["received", "received", "received", "confirmed", "partially_received", "sent", "draft", "received", "confirmed", "partially_received", "sent", "draft"];
const PI_STATUSES = ["paid", "paid", "paid", "partially_paid", "unpaid", "overdue", "paid", "partially_paid", "unpaid", "paid", "overdue", "paid"];
const DN_STATUSES = ["draft", "ready", "dispatched", "in_transit", "delivered", "delivered", "dispatched", "in_transit", "ready", "delivered"];
const DRIVERS = ["Rashid Hassan", "Suresh Kumar", "Ali Mohammed", "Vikram Singh", "Omar Farooq"];
const VEHICLES = ["DXB-A-12345", "DXB-B-67890", "SHJ-C-11223", "AUH-D-44556", "DXB-E-77889"];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  const dbName = getMongoDbName(MONGODB_URI);
  if (dbName !== ALLOWED_DB) {
    console.error(`❌ Refusing seed: target database is "${dbName}".`);
    console.error(`   Only "${ALLOWED_DB}" is allowed. Set MONGODB_DB_NAME=${ALLOWED_DB}`);
    process.exit(1);
  }
  try {
    validateMongoEnvironment({ strict: false });
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
  console.log("\n🚀 Connecting to MongoDB Atlas...");
  console.log(`   Database: ${dbName} (dev only)`);
  await mongoose.connect(MONGODB_URI, { dbName, family: 4 });
  console.log("✅ Connected!\n");

  // ── Clear all 16 collections ────────────────────────────────────────────────
  console.log("🗑️  Clearing existing data (all collections)...");
  await Promise.all([
    User.deleteMany({}),
    BankAccount.deleteMany({}), Vendor.deleteMany({}), Customer.deleteMany({}),
    Product.deleteMany({}), Quotation.deleteMany({}), SalesOrder.deleteMany({}),
    SalesInvoice.deleteMany({}), Receipt.deleteMany({}), PurchaseOrder.deleteMany({}),
    PurchaseInvoice.deleteMany({}), Payment.deleteMany({}), StockAdjustment.deleteMany({}),
    ContactMessage.deleteMany({}), DeliveryNote.deleteMany({}), AuditLog.deleteMany({}),
  ]);
  console.log("✅ All collections cleared.\n");

  // ── 1. Users ─────────────────────────────────────────────────────────────────
  console.log("👤 Seeding Users...");
  const adminUser = await User.create({
    name: "Super Admin", email: "admin@alcoascaffolding.ae", password: "Admin@1234",
    role: "super_admin", department: "management", phone: "+971 4 100 0001", isActive: true, lastLogin: new Date(),
  });
  const staffUsers = await User.create([
    { name: "Sales Manager", email: "sales@alcoascaffolding.ae", password: "Sales@1234", role: "manager", department: "sales", phone: "+971 4 100 0002", isActive: true },
    { name: "Accounts Officer", email: "accounts@alcoascaffolding.ae", password: "Accounts@1234", role: "accountant", department: "accounts", phone: "+971 4 100 0003", isActive: true },
    { name: "Inventory Officer", email: "inventory@alcoascaffolding.ae", password: "Inventory@1234", role: "inventory", department: "inventory", phone: "+971 4 100 0004", isActive: true },
    { name: "Sales Executive", email: "salexec@alcoascaffolding.ae", password: "SalExec@1234", role: "sales", department: "sales", phone: "+971 50 100 0005", isActive: true },
  ]);
  const allUsers = [adminUser, ...staffUsers];
  console.log("   ✅ 5 users created (admin@alcoascaffolding.ae / Admin@1234)");

  // ── 2. Bank Accounts ─────────────────────────────────────────────────────────
  console.log("🏦 Seeding Bank Accounts...");
  const bankAccounts = await BankAccount.insertMany([
    companyBankAccountSeedDoc({
      openingBalance: 250000,
      currentBalance: 387500,
    }),
  ]);
  console.log(`   ✅ ${bankAccounts.length} bank accounts created`);

  // ── 3. Vendors ───────────────────────────────────────────────────────────────
  console.log("🏭 Seeding Vendors...");
  const vendors = await Vendor.insertMany(VENDORS_DATA.map((v) => ({
    ...v,
    address: `Warehouse ${rand(1, 50)}, ${pick(["Al Quoz", "Jebel Ali", "Industrial Area 17"])}`,
    status: "active",
    currentBalance: randFloat(0, 80000),
    createdBy: adminUser._id,
  })));
  console.log(`   ✅ ${vendors.length} vendors created`);

  // ── 4. Customers ─────────────────────────────────────────────────────────────
  console.log("👥 Seeding Customers...");
  const firstNames = ["Mohammed", "Ahmed", "Khalid", "Omar", "Sultan", "Rashid", "Saeed", "Hamdan", "Majid", "Sanjay", "Rajesh", "Anil", "Priya", "Deepak", "James"];
  const lastNames = ["Al Mansoori", "Al Rashidi", "Al Shamsi", "Al Zaabi", "Al Ameri", "Kumar", "Sharma", "Singh", "O'Brien", "Smith"];
  const designations = ["Procurement Manager", "Project Manager", "Site Engineer", "Operations Director", "Supply Chain Manager", "Contracts Manager", "General Manager", "Finance Manager"];

  const customers = await Customer.insertMany(CUSTOMERS_DATA.map((c) => {
    const contactFN = pick(firstNames);
    const contactLN = pick(lastNames);
    const areaList = AREAS_BY_EMIRATE[c.emirate] || ["City Center"];
    const area = pick(areaList);
    return {
      companyName: c.companyName,
      displayName: c.companyName,
      tradeLicenseNumber: c.tradeLic,
      vatRegistrationNumber: c.vatReg,
      businessType: c.businessType,
      primaryEmail: c.email,
      primaryPhone: c.phone,
      primaryWhatsApp: c.phone,
      contactPersons: [{
        name: `${contactFN} ${contactLN}`,
        designation: pick(designations),
        email: c.email,
        phone: c.phone,
        whatsapp: c.phone,
        isPrimary: true,
        role: "primary",
      }],
      addresses: [{
        type: "office",
        addressLine1: `Office ${rand(100, 999)}, ${pick(["Tower A", "Building B", "Block C", "Plaza", "Centre"])}`,
        area,
        city: c.emirate,
        emirate: c.emirate,
        country: "UAE",
        isPrimary: true,
      }],
      paymentTerms: c.paymentTerms,
      creditLimit: c.creditLimit,
      currentBalance: randFloat(0, c.creditLimit * 0.4),
      status: c.status,
      customerType: pick(["rental", "sales", "both"]),
      rating: rand(3, 5),
      priority: c.priority,
      customerSince: daysAgo(rand(100, 1095)),
      totalOrders: rand(2, 45),
      totalRevenue: randFloat(10000, c.creditLimit * 0.8),
      source: c.source,
      tags: pick([["construction", "uae"], ["high-value"], ["rental"], ["regular"], []]),
      notes: `Active customer with ${c.paymentTerms} payment terms.`,
      createdBy: adminUser._id,
    };
  }));
  console.log(`   ✅ ${customers.length} customers created`);

  // ── 5. Products ──────────────────────────────────────────────────────────────
  console.log("📦 Seeding Products...");
  const products = await Product.insertMany(PRODUCTS_DATA.map((p) => ({
    ...p, createdBy: adminUser._id,
  })));
  console.log(`   ✅ ${products.length} products created`);

  const salesExecs = ["Ahmed Al Rashid", "Priya Nair", "Mohammed Hassan", "Rajesh Kumar", "Sarah Al Mansoori"];
  const bankDetail = {
    bankName: COMPANY_BANK_DETAILS.bankName,
    accountName: COMPANY_BANK_DETAILS.accountName,
    accountNumber: COMPANY_BANK_DETAILS.accountNumber,
    iban: COMPANY_BANK_DETAILS.iban,
    swiftCode: COMPANY_BANK_DETAILS.swiftCode,
    branch: COMPANY_BANK_DETAILS.branch,
  };

  function buildQuoteDoc(i, customer, status, extra = {}) {
    const qDate = daysAgo(rand(5, 180));
    const validUntil = new Date(qDate.getTime() + 30 * 86400000);
    const numItems = rand(2, 5);
    const items = buildQuotationItems(products, numItems);
    const delivery = rand(0, 1) ? rand(200, 800) : 0;
    const installation = rand(0, 1) ? rand(300, 1200) : 0;
    const totals = quotationTotals(items, delivery, installation);
    return {
      quoteNumber: `QT-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      customerEmail: customer.primaryEmail,
      customerPhone: customer.primaryPhone,
      customerTRN: customer.vatRegistrationNumber,
      contactPersonName: customer.contactPersons[0]?.name,
      contactPersonDesignation: customer.contactPersons[0]?.designation,
      quoteDate: qDate,
      validUntil,
      quoteType: pick(["rental", "rental", "sales", "both"]),
      status,
      subject: `Scaffolding Rental for ${customer.companyName} - ${pick(["Commercial Tower", "Villa Complex", "Industrial Project", "Hotel Renovation", "Residential Building"])}`,
      salesExecutive: pick(salesExecs),
      preparedBy: pick(salesExecs),
      paymentTerms: customer.paymentTerms || "Cash/CDC",
      deliveryTerms: "7-10 days from date of order",
      projectDuration: `${rand(1, 6)} months`,
      items,
      subtotal: totals.subtotal,
      deliveryCharges: delivery,
      installationCharges: installation,
      pickupCharges: delivery ? rand(200, 500) : 0,
      discount: rand(0, 1) ? rand(500, 3000) : 0,
      discountType: "fixed",
      vatPercentage: 5,
      vatAmount: totals.vatAmount,
      totalAmount: totals.totalAmount,
      currency: "AED",
      deliveryAddress: {
        addressLine1: customer.addresses?.[0]?.addressLine1 || "Project Site",
        area: customer.addresses?.[0]?.area || "Dubai",
        city: customer.addresses?.[0]?.city || "Dubai",
        emirate: customer.addresses?.[0]?.emirate || "Dubai",
      },
      deliveryDate: daysFromNow(rand(7, 45)),
      notes: "Terms as per agreement. VAT @ 5% applicable.",
      bankDetails: bankDetail,
      createdBy: adminUser._id,
      ...extra,
    };
  }

  // ── 6. Quotations (20: 8 pending, 9 SO-converted, 3 invoice-converted) ───────
  console.log("📋 Seeding Quotations...");
  const quotationDocs = [];
  let qi = 0;
  for (let p = 0; p < PENDING_QUOTE_STATUSES.length; p++) {
    quotationDocs.push(buildQuoteDoc(qi++, customers[p % customers.length], PENDING_QUOTE_STATUSES[p]));
  }
  for (let c = 0; c < 9; c++) {
    quotationDocs.push(buildQuoteDoc(qi++, customers[(c + 8) % customers.length], "converted_to_sales_order", {
      convertedToOrder: true,
      convertedAt: daysAgo(rand(1, 30)),
    }));
  }
  for (let c = 0; c < 3; c++) {
    quotationDocs.push(buildQuoteDoc(qi++, customers[(c + 5) % customers.length], "converted_to_invoice", {
      convertedToInvoice: true,
      convertedAt: daysAgo(rand(1, 20)),
    }));
  }
  const createdQuotations = await Quotation.insertMany(quotationDocs);
  console.log(`   ✅ ${createdQuotations.length} quotations created`);

  // ── 7. Sales Orders (from converted quotations) ──────────────────────────────
  console.log("🛒 Seeding Sales Orders...");
  const convertedToSO = createdQuotations.filter((q) => q.status === "converted_to_sales_order");
  const salesOrderDocs = convertedToSO.map((quote, i) => {
    const customer = customers.find((c) => c._id.equals(quote.customer)) || customers[0];
    const items = quoteItemsToSalesLines(quote.items, products);
    const totals = salesLinesTotals(items);
    const orderDate = daysAgo(rand(5, 120));
    return {
      orderNumber: `SO-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      customerEmail: customer.primaryEmail,
      customerPhone: customer.primaryPhone,
      customerTRN: customer.vatRegistrationNumber,
      quotation: quote._id,
      orderDate,
      deliveryDate: new Date(orderDate.getTime() + rand(3, 14) * 86400000),
      status: SO_STATUSES[i % SO_STATUSES.length],
      items,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      currency: "AED",
      paymentTerms: customer.paymentTerms,
      deliveryTerms: "7-10 days from date of order",
      notes: `Converted from ${quote.quoteNumber}`,
      createdBy: adminUser._id,
    };
  });
  const createdSalesOrders = await SalesOrder.insertMany(salesOrderDocs);
  console.log(`   ✅ ${createdSalesOrders.length} sales orders created`);

  // ── 8. Sales Invoices (from SOs + direct from quotations) ────────────────────
  console.log("🧾 Seeding Sales Invoices...");
  const salesInvoiceDocs = [];
  let invIdx = 0;

  createdSalesOrders.forEach((so, i) => {
    const customer = customers.find((c) => c._id.equals(so.customer)) || customers[0];
    const quote = createdQuotations.find((q) => q._id.equals(so.quotation));
    const invoiceDate = new Date(so.orderDate.getTime() + rand(1, 5) * 86400000);
    const dueDate = new Date(invoiceDate.getTime() + rand(7, 60) * 86400000);
    const paymentStatus = SI_STATUSES[i % SI_STATUSES.length];
    const paidAmount = paymentStatus === "paid" ? so.total : paymentStatus === "partially_paid" ? parseFloat((so.total * 0.5).toFixed(2)) : 0;
    salesInvoiceDocs.push({
      invoiceNumber: `INV-2026-${String(++invIdx).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      quotation: quote?._id,
      salesOrder: so._id,
      invoiceDate,
      dueDate,
      paymentStatus,
      items: so.items,
      subtotal: so.subtotal,
      vatAmount: so.vatAmount,
      total: so.total,
      paidAmount,
      balance: parseFloat((so.total - paidAmount).toFixed(2)),
      currency: "AED",
      notes: `Invoice for ${so.orderNumber}`,
      createdBy: adminUser._id,
    });
  });

  const directInvoiceQuotes = createdQuotations.filter((q) => q.status === "converted_to_invoice");
  const directInvoices = [];
  directInvoiceQuotes.forEach((quote, i) => {
    const customer = customers.find((c) => c._id.equals(quote.customer)) || customers[0];
    const items = quoteItemsToSalesLines(quote.items, products);
    const totals = salesLinesTotals(items);
    const invoiceDate = daysAgo(rand(3, 60));
    const dueDate = new Date(invoiceDate.getTime() + rand(7, 45) * 86400000);
    const paymentStatus = ["paid", "partially_paid", "unpaid"][i % 3];
    const paidAmount = paymentStatus === "paid" ? totals.total : paymentStatus === "partially_paid" ? parseFloat((totals.total * 0.5).toFixed(2)) : 0;
    const invDoc = {
      invoiceNumber: `INV-2026-${String(++invIdx).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      quotation: quote._id,
      invoiceDate,
      dueDate,
      paymentStatus,
      items,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      paidAmount,
      balance: parseFloat((totals.total - paidAmount).toFixed(2)),
      currency: "AED",
      notes: `Direct invoice from ${quote.quoteNumber}`,
      createdBy: adminUser._id,
    };
    salesInvoiceDocs.push(invDoc);
    directInvoices.push({ quote, invDoc });
  });

  const createdSalesInvoices = await SalesInvoice.insertMany(salesInvoiceDocs);

  for (const { quote, invDoc } of directInvoices) {
    const savedInv = createdSalesInvoices.find((inv) => inv.invoiceNumber === invDoc.invoiceNumber);
    await Quotation.updateOne({ _id: quote._id }, { $set: { invoiceId: savedInv._id } });
  }
  console.log(`   ✅ ${createdSalesInvoices.length} sales invoices created`);

  // ── 9. Receipts ──────────────────────────────────────────────────────────────
  console.log("💰 Seeding Receipts...");
  const receiptDocs = [];
  let rcpIdx = 0;
  for (const inv of createdSalesInvoices) {
    if (!["paid", "partially_paid"].includes(inv.paymentStatus)) continue;
    const customer = customers.find((c) => c._id.equals(inv.customer)) || customers[0];
    receiptDocs.push({
      receiptNumber: `RCP-2026-${String(++rcpIdx).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      invoices: [inv._id],
      allocations: [{ invoice: inv._id, amount: inv.paidAmount }],
      receiptDate: new Date(inv.invoiceDate.getTime() + rand(1, 30) * 86400000),
      amount: inv.paidAmount,
      paymentMethod: pick(["Bank Transfer", "Cheque", "Cash", "Bank Transfer"]),
      bankAccount: bankAccounts[0]._id,
      reference: `CHQ-${rand(100000, 999999)}`,
      notes: `Payment received for ${inv.invoiceNumber}`,
      createdBy: adminUser._id,
    });
  }
  const createdReceipts = await Receipt.insertMany(receiptDocs);
  console.log(`   ✅ ${createdReceipts.length} receipts created`);

  // ── 10. Purchase Orders ───────────────────────────────────────────────────────
  console.log("📦 Seeding Purchase Orders...");
  const purchaseOrderDocs = [];
  for (let i = 0; i < 12; i++) {
    const vendor = vendors[i % vendors.length];
    const orderDate = daysAgo(rand(10, 200));
    const items = buildSalesLineItems(products, rand(1, 4)).map((it) => ({
      ...it,
      unitPrice: products.find((p) => p._id.equals(it.product))?.purchasePrice || it.unitPrice,
      total: parseFloat((it.quantity * (products.find((p) => p._id.equals(it.product))?.purchasePrice || it.unitPrice)).toFixed(2)),
    }));
    const subtotal = parseFloat(items.reduce((s, it) => s + it.total, 0).toFixed(2));
    const vatAmount = parseFloat((subtotal * 0.05).toFixed(2));
    const status = PO_STATUSES[i % PO_STATUSES.length];
    purchaseOrderDocs.push({
      poNumber: (() => {
        const dd = String(orderDate.getDate()).padStart(2, "0");
        const mm = String(orderDate.getMonth() + 1).padStart(2, "0");
        const yy = String(orderDate.getFullYear()).slice(-2);
        return `PO${dd}${mm}${yy}${String(i + 1).padStart(4, "0")}`;
      })(),
      vendor: vendor._id,
      vendorName: vendor.companyName,
      orderDate,
      deliveryDate: new Date(orderDate.getTime() + rand(7, 21) * 86400000),
      status,
      stockApplied: status === "received",
      items,
      subtotal,
      vatAmount,
      total: parseFloat((subtotal + vatAmount).toFixed(2)),
      currency: "AED",
      notes: "Standard purchase order.",
      createdBy: adminUser._id,
    });
  }
  const createdPurchaseOrders = await PurchaseOrder.insertMany(purchaseOrderDocs);
  console.log(`   ✅ ${createdPurchaseOrders.length} purchase orders created`);

  // ── 11. Purchase Invoices ─────────────────────────────────────────────────────
  console.log("🧾 Seeding Purchase Invoices...");
  const purchaseInvoiceDocs = createdPurchaseOrders.map((po, i) => {
    const vendor = vendors[i % vendors.length];
    const invoiceDate = new Date(po.orderDate.getTime() + rand(1, 5) * 86400000);
    const dueDate = new Date(invoiceDate.getTime() + rand(7, 45) * 86400000);
    const paymentStatus = PI_STATUSES[i % PI_STATUSES.length];
    const paidAmount = paymentStatus === "paid" ? po.total : paymentStatus === "partially_paid" ? parseFloat((po.total * 0.5).toFixed(2)) : 0;
    return {
      invoiceNumber: (() => {
        const dd = String(invoiceDate.getDate()).padStart(2, "0");
        const mm = String(invoiceDate.getMonth() + 1).padStart(2, "0");
        const yy = String(invoiceDate.getFullYear()).slice(-2);
        return `PI${dd}${mm}${yy}${String(i + 1).padStart(4, "0")}`;
      })(),
      vendor: vendor._id,
      vendorName: vendor.companyName,
      purchaseOrder: po._id,
      invoiceDate,
      dueDate,
      paymentStatus,
      items: po.items,
      subtotal: po.subtotal,
      vatAmount: po.vatAmount,
      total: po.total,
      paidAmount,
      balance: parseFloat((po.total - paidAmount).toFixed(2)),
      currency: "AED",
      notes: `Invoice for ${po.poNumber}`,
      createdBy: adminUser._id,
    };
  });
  const createdPurchaseInvoices = await PurchaseInvoice.insertMany(purchaseInvoiceDocs);
  console.log(`   ✅ ${createdPurchaseInvoices.length} purchase invoices created`);

  // ── 12. Payments (to Vendors) ─────────────────────────────────────────────────
  console.log("💸 Seeding Payments...");
  const paymentDocs = [];
  let payIdx = 0;
  for (const pi of createdPurchaseInvoices) {
    if (!["paid", "partially_paid"].includes(pi.paymentStatus)) continue;
    const vendor = vendors.find((v) => v._id.equals(pi.vendor)) || vendors[0];
    paymentDocs.push({
      paymentNumber: `PAY-2026-${String(++payIdx).padStart(4, "0")}`,
      vendor: vendor._id,
      vendorName: vendor.companyName,
      invoices: [pi._id],
      allocations: [{ invoice: pi._id, amount: pi.paidAmount }],
      paymentDate: new Date(pi.invoiceDate.getTime() + rand(1, 30) * 86400000),
      amount: pi.paidAmount,
      paymentMethod: pick(["Bank Transfer", "Cheque", "Bank Transfer"]),
      bankAccount: bankAccounts[0]._id,
      reference: `TXN-${rand(1000000, 9999999)}`,
      notes: `Payment for ${pi.invoiceNumber}`,
      createdBy: adminUser._id,
    });
  }
  const createdPayments = await Payment.insertMany(paymentDocs);
  console.log(`   ✅ ${createdPayments.length} payments created`);

  // ── 13. Delivery Notes ────────────────────────────────────────────────────────
  console.log("🚚 Seeding Delivery Notes...");
  const deliveryNoteDocs = [];
  const dnSourceOrders = createdSalesOrders.slice(0, 10);
  dnSourceOrders.forEach((so, i) => {
    const customer = customers.find((c) => c._id.equals(so.customer)) || customers[0];
    const quote = createdQuotations.find((q) => q._id.equals(so.quotation));
    const status = DN_STATUSES[i % DN_STATUSES.length];
    const dnItems = so.items.map((it) => ({
      product: it.product,
      description: it.description,
      equipmentType: it.equipmentType,
      quantity: it.quantity,
      unit: it.unit,
    }));
    deliveryNoteDocs.push({
      deliveryNoteNumber: `DN-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      customerEmail: customer.primaryEmail,
      customerPhone: customer.primaryPhone,
      customerAddress: customer.addresses?.[0]?.addressLine1,
      salesOrder: so._id,
      quotation: quote?._id,
      deliveryDate: so.deliveryDate || daysFromNow(rand(1, 14)),
      deliveryAddress: `${customer.addresses?.[0]?.addressLine1 || "Site"}, ${customer.addresses?.[0]?.area || "Dubai"}`,
      driverName: pick(DRIVERS),
      vehicleNumber: pick(VEHICLES),
      contactPersonName: customer.contactPersons[0]?.name,
      contactPersonPhone: customer.primaryPhone,
      status,
      noteType: "delivery",
      items: dnItems,
      stockApplied: status === "delivered",
      notes: `Delivery for ${so.orderNumber}`,
      createdBy: adminUser._id,
    });
  });
  const createdDeliveryNotes = await DeliveryNote.insertMany(deliveryNoteDocs);
  console.log(`   ✅ ${createdDeliveryNotes.length} delivery notes created`);

  // ── 14. Stock Adjustments ─────────────────────────────────────────────────────
  console.log("📊 Seeding Stock Adjustments...");
  const adjustmentTypes = ["increase", "decrease", "correction", "increase", "decrease"];
  const adjustmentReasons = [
    "New stock received from supplier", "Damaged during transport",
    "Physical count correction", "Returned from customer site",
    "Issued to site — Al Mansoori project", "Loss/theft reported",
    "Stock count variance", "Returned items — cleaning & repair",
  ];
  const stockMap = new Map(products.map((p) => [p._id.toString(), p.currentStock]));
  const stockAdjustmentDocs = [];
  for (let i = 0; i < 15; i++) {
    const product = products[i % products.length];
    const adjType = adjustmentTypes[i % adjustmentTypes.length];
    const qty = rand(1, 20);
    const prev = stockMap.get(product._id.toString()) ?? product.currentStock;
    const newStock = adjType === "increase" ? prev + qty : Math.max(0, prev - qty);
    stockMap.set(product._id.toString(), newStock);
    stockAdjustmentDocs.push({
      adjustmentNumber: `ADJ-2026-${String(i + 1).padStart(4, "0")}`,
      product: product._id,
      productName: product.name,
      adjustmentType: adjType,
      quantity: adjType === "decrease" ? -qty : qty,
      previousStock: prev,
      newStock,
      reason: pick(adjustmentReasons),
      notes: "Adjustment recorded by inventory officer.",
      adjustedBy: adminUser._id,
    });
  }
  const createdAdjustments = await StockAdjustment.insertMany(stockAdjustmentDocs);
  console.log(`   ✅ ${createdAdjustments.length} stock adjustments created`);

  // ── 15. Stock reconciliation ──────────────────────────────────────────────────
  console.log("🔄 Reconciling product stock...");
  for (const po of createdPurchaseOrders) {
    if (!po.stockApplied) continue;
    for (const it of po.items) {
      if (!it.product) continue;
      const key = it.product.toString();
      stockMap.set(key, (stockMap.get(key) || 0) + it.quantity);
    }
  }
  for (const dn of createdDeliveryNotes) {
    if (!dn.stockApplied) continue;
    for (const it of dn.items) {
      if (!it.product) continue;
      const key = it.product.toString();
      stockMap.set(key, Math.max(0, (stockMap.get(key) || 0) - it.quantity));
    }
  }
  // Force a few products below minStock for dashboard low-stock card
  const lowStockTargets = [products[2], products[4], products[18]];
  for (const p of lowStockTargets) {
    stockMap.set(p._id.toString(), Math.max(1, Math.floor(p.minStock * 0.4)));
  }
  const stockBulkOps = [...stockMap.entries()].map(([id, qty]) => ({
    updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { currentStock: qty } } },
  }));
  if (stockBulkOps.length) await Product.bulkWrite(stockBulkOps);
  console.log(`   ✅ Stock updated for ${stockBulkOps.length} products`);

  // ── 16. Contact Messages ──────────────────────────────────────────────────────
  console.log("✉️  Seeding Contact Messages...");
  const createdMessages = await ContactMessage.insertMany(
    CONTACT_MESSAGES_DATA.map((m) => ({
      ...m,
      emailSent: m.status !== "new",
      emailSentAt: m.status !== "new" ? daysAgo(rand(1, 30)) : undefined,
      createdAt: daysAgo(rand(1, 60)),
    }))
  );
  console.log(`   ✅ ${createdMessages.length} contact messages created`);

  // ── 17. Audit Logs ────────────────────────────────────────────────────────────
  console.log("📜 Seeding Audit Logs...");
  const auditEntries = [];
  const auditActions = ["create", "update", "status_change", "send_email"];
  const auditResources = [
    { resource: "quotation", docs: createdQuotations, label: (d) => d.quoteNumber },
    { resource: "sales_order", docs: createdSalesOrders, label: (d) => d.orderNumber },
    { resource: "sales_invoice", docs: createdSalesInvoices, label: (d) => d.invoiceNumber },
    { resource: "delivery_note", docs: createdDeliveryNotes, label: (d) => d.deliveryNoteNumber },
    { resource: "purchase_order", docs: createdPurchaseOrders, label: (d) => d.poNumber },
    { resource: "customer", docs: customers.slice(0, 8), label: (d) => d.companyName },
    { resource: "product", docs: products.slice(0, 8), label: (d) => d.itemCode },
  ];
  for (let i = 0; i < 42; i++) {
    const bucket = auditResources[i % auditResources.length];
    const doc = bucket.docs[i % bucket.docs.length];
    const actor = pick(allUsers);
    const action = auditActions[i % auditActions.length];
    auditEntries.push({
      user: actor._id,
      userEmail: actor.email,
      action,
      resource: bucket.resource,
      resourceId: doc._id.toString(),
      summary: `${action} ${bucket.resource} ${bucket.label(doc)}`,
      metadata: { status: doc.status || doc.paymentStatus || undefined },
      createdAt: daysAgo(rand(1, 90)),
    });
  }
  const createdAuditLogs = await AuditLog.insertMany(auditEntries);
  console.log(`   ✅ ${createdAuditLogs.length} audit log entries created`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log("🎉  SEED COMPLETE — Summary");
  console.log("═".repeat(55));
  console.log(`   👤  Users              : ${allUsers.length}`);
  console.log(`   🏦  Bank Accounts      : ${bankAccounts.length}`);
  console.log(`   🏭  Vendors            : ${vendors.length}`);
  console.log(`   👥  Customers          : ${customers.length}`);
  console.log(`   📦  Products           : ${products.length}`);
  console.log(`   📋  Quotations         : ${createdQuotations.length}`);
  console.log(`   🛒  Sales Orders       : ${createdSalesOrders.length}`);
  console.log(`   🧾  Sales Invoices     : ${createdSalesInvoices.length}`);
  console.log(`   💰  Receipts           : ${createdReceipts.length}`);
  console.log(`   📦  Purchase Orders    : ${createdPurchaseOrders.length}`);
  console.log(`   🧾  Purchase Invoices  : ${createdPurchaseInvoices.length}`);
  console.log(`   💸  Payments           : ${createdPayments.length}`);
  console.log(`   🚚  Delivery Notes     : ${createdDeliveryNotes.length}`);
  console.log(`   📊  Stock Adjustments  : ${createdAdjustments.length}`);
  console.log(`   ✉️   Contact Messages   : ${createdMessages.length}`);
  console.log(`   📜  Audit Logs         : ${createdAuditLogs.length}`);
  console.log("═".repeat(55));
  console.log("\n🔑  Admin Login:");
  console.log("    Email    : admin@alcoascaffolding.ae");
  console.log("    Password : Admin@1234");
  console.log("\n");

  await mongoose.disconnect();
  process.exit(0);
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  seed().catch((err) => {
    console.error("❌ Seed failed:", err.message);
    console.error(err.stack);
    mongoose.disconnect();
    process.exit(1);
  });
}
