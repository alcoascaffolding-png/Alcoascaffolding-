/**
 * Alcoa Scaffolding — MongoDB Atlas Seed Script
 * Run: npm run seed   (or: node --require ./dns-fix.cjs scripts/seed.mjs)
 *
 * Seeds all collections with realistic UAE scaffolding business data.
 * Safe to run multiple times — clears existing data first (except Users).
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { getMongoDbName } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not found in .env.local"); process.exit(1); }

// ─── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

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
  isActive: { type: Boolean, default: true }, notes: String,
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
  bankDetails: { bankName: String, accountName: String, accountNumber: String, iban: String, swiftCode: String, branch: String },
}, { timestamps: true });

const lineItemSchema = new mongoose.Schema({
  description: String, quantity: Number, unit: { type: String, default: "Nos" },
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
}, { timestamps: true });

const PurchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorName: String,
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" },
  invoiceDate: Date, dueDate: Date, paymentStatus: String,
  subtotal: Number, vatAmount: Number, total: Number,
  paidAmount: Number, balance: Number, currency: { type: String, default: "AED" }, notes: String,
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorName: String,
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "PurchaseInvoice" }],
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

// ─── Raw Data ────────────────────────────────────────────────────────────────

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
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
  { companyName: "Al Futtaim Construction LLC", businessType: "Construction Company", vatReg: "100345678912345", tradeLic: "CN-DXB-2019-45321", emirate: "Dubai", area: "Business Bay", email: "procurement@alfuttaimconstruction.ae", phone: "+971 4 234 5678", status: "active", priority: "vip", source: "Referral", paymentTerms: "30 Days", creditLimit: 250000 },
  { companyName: "Arabtec Holding PJSC", businessType: "Construction Company", vatReg: "100234567891234", tradeLic: "CN-DXB-2015-12345", emirate: "Dubai", area: "Al Quoz", email: "supply@arabtec.ae", phone: "+971 4 345 6789", status: "active", priority: "vip", source: "Phone Call", paymentTerms: "45 Days", creditLimit: 500000 },
  { companyName: "Drake & Scull International", businessType: "Contractor", vatReg: "100456789123456", tradeLic: "CN-DXB-2016-67890", emirate: "Dubai", area: "Deira", email: "orders@drakeandscull.ae", phone: "+971 4 456 7890", status: "active", priority: "high", source: "Website", paymentTerms: "30 Days", creditLimit: 200000 },
  { companyName: "Dutco Balfour Beatty LLC", businessType: "Construction Company", vatReg: "100567891234567", tradeLic: "CN-DXB-2014-34567", emirate: "Dubai", area: "Jebel Ali", email: "logistics@dutco.ae", phone: "+971 4 567 8901", status: "active", priority: "high", source: "Referral", paymentTerms: "30 Days", creditLimit: 300000 },
  { companyName: "Six Construct LLC", businessType: "Construction Company", vatReg: "100678912345678", tradeLic: "CN-ABD-2018-78901", emirate: "Abu Dhabi", area: "Mussafah", email: "procurement@sixconstruct.ae", phone: "+971 2 678 9012", status: "active", priority: "high", source: "Email", paymentTerms: "45 Days", creditLimit: 400000 },
  { companyName: "Al Habtoor Engineering", businessType: "Contractor", vatReg: "100789123456789", tradeLic: "CN-DXB-2017-23456", emirate: "Dubai", area: "Bur Dubai", email: "material@alhabtoor.ae", phone: "+971 4 789 0123", status: "active", priority: "medium", source: "Walk-in", paymentTerms: "15 Days", creditLimit: 150000 },
  { companyName: "Emaar Construction LLC", businessType: "Construction Company", vatReg: "100891234567891", tradeLic: "CN-DXB-2013-89012", emirate: "Dubai", area: "Dubai Silicon Oasis", email: "scaffolding@emaar.ae", phone: "+971 4 890 1234", status: "active", priority: "vip", source: "Referral", paymentTerms: "60 Days", creditLimit: 600000 },
  { companyName: "ALEC Engineering & Contracting", businessType: "Contractor", vatReg: "100912345678912", tradeLic: "CN-DXB-2016-45678", emirate: "Dubai", area: "Jumeirah", email: "equipment@alec.ae", phone: "+971 4 901 2345", status: "active", priority: "high", source: "Website", paymentTerms: "30 Days", creditLimit: 250000 },
  { companyName: "Khansaheb Civil Engineering", businessType: "Construction Company", vatReg: "100123456789123", tradeLic: "CN-DXB-2015-56789", emirate: "Dubai", area: "Al Quoz", email: "hire@khansaheb.ae", phone: "+971 4 012 3456", status: "active", priority: "medium", source: "Phone Call", paymentTerms: "30 Days", creditLimit: 200000 },
  { companyName: "National Projects & Construction", businessType: "Construction Company", vatReg: "100234567891235", tradeLic: "CN-SHJ-2020-12346", emirate: "Sharjah", area: "Industrial Area", email: "rental@npc.ae", phone: "+971 6 234 5679", status: "active", priority: "medium", source: "Social Media", paymentTerms: "15 Days", creditLimit: 100000 },
  { companyName: "Al Bonian Building Contracting", businessType: "Contractor", vatReg: "100345678912346", tradeLic: "CN-AJM-2021-34568", emirate: "Ajman", area: "Al Jurf", email: "info@albonian.ae", phone: "+971 6 345 6780", status: "prospect", priority: "medium", source: "Website", paymentTerms: "Cash", creditLimit: 50000 },
  { companyName: "RAK Properties LLC", businessType: "Construction Company", vatReg: "100456789123457", tradeLic: "CN-RAK-2019-67891", emirate: "Ras Al Khaimah", area: "Al Hamra", email: "projects@rakproperties.ae", phone: "+971 7 456 7891", status: "active", priority: "medium", source: "Email", paymentTerms: "30 Days", creditLimit: 180000 },
  { companyName: "Galadari Engineering Works", businessType: "Contractor", vatReg: "100567891234568", tradeLic: "CN-DXB-2018-78902", emirate: "Dubai", area: "Deira", email: "equipment@galadari.ae", phone: "+971 4 567 8902", status: "active", priority: "low", source: "Referral", paymentTerms: "7 Days", creditLimit: 75000 },
  { companyName: "Shapoorji Pallonji Mideast LLC", businessType: "Construction Company", vatReg: "100678912345679", tradeLic: "CN-ABD-2017-89013", emirate: "Abu Dhabi", area: "Khalifa City", email: "procurement@shapoorji.ae", phone: "+971 2 678 9013", status: "active", priority: "high", source: "Phone Call", paymentTerms: "45 Days", creditLimit: 350000 },
  { companyName: "Al Balooshi Building Contracting", businessType: "Contractor", tradeLic: "CN-FUJ-2022-11223", emirate: "Fujairah", area: "Fujairah City", email: "contact@albalooshi.ae", phone: "+971 9 678 9014", status: "prospect", priority: "low", source: "Walk-in", paymentTerms: "Cash", creditLimit: 25000 },
  { companyName: "Carillion Alawi LLC", businessType: "Facility Management", vatReg: "100891234567892", tradeLic: "CN-DXB-2015-23457", emirate: "Dubai", area: "Business Bay", email: "fm@carillion.ae", phone: "+971 4 890 1235", status: "inactive", priority: "low", source: "Website", paymentTerms: "30 Days", creditLimit: 100000 },
  { companyName: "Hassan Allam Construction", businessType: "Construction Company", vatReg: "100912345678913", tradeLic: "CN-ABD-2016-34569", emirate: "Abu Dhabi", area: "Al Reem Island", email: "scaffolding@hassanallam.ae", phone: "+971 2 901 2346", status: "active", priority: "high", source: "Referral", paymentTerms: "30 Days", creditLimit: 280000 },
  { companyName: "Bin Ladin Group UAE", businessType: "Construction Company", vatReg: "100023456789124", tradeLic: "CN-DXB-2012-45679", emirate: "Dubai", area: "Jumeirah", email: "material@binladin.ae", phone: "+971 4 023 4567", status: "active", priority: "vip", source: "Phone Call", paymentTerms: "60 Days", creditLimit: 750000 },
  { companyName: "Transguard Group LLC", businessType: "Facility Management", vatReg: "100134567891235", tradeLic: "CN-DXB-2020-56790", emirate: "Dubai", area: "Dubai Silicon Oasis", email: "ops@transguard.ae", phone: "+971 4 134 5678", status: "active", priority: "medium", source: "Email", paymentTerms: "15 Days", creditLimit: 120000 },
  { companyName: "Al Shirawi Contracting LLC", businessType: "Contractor", vatReg: "100245678912346", tradeLic: "CN-DXB-2018-67891", emirate: "Dubai", area: "Al Quoz", email: "hire@alshirawi.ae", phone: "+971 4 245 6789", status: "active", priority: "medium", source: "Website", paymentTerms: "30 Days", creditLimit: 160000 },
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

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  const dbName = getMongoDbName(MONGODB_URI);
  console.log("\n🚀 Connecting to MongoDB Atlas...");
  console.log(`   Database: ${dbName}`);
  await mongoose.connect(MONGODB_URI, { dbName, family: 4 });
  console.log("✅ Connected!\n");

  // ── Clear collections (preserve Users) ──────────────────────────────────────
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    BankAccount.deleteMany({}), Vendor.deleteMany({}), Customer.deleteMany({}),
    Product.deleteMany({}), Quotation.deleteMany({}), SalesOrder.deleteMany({}),
    SalesInvoice.deleteMany({}), Receipt.deleteMany({}), PurchaseOrder.deleteMany({}),
    PurchaseInvoice.deleteMany({}), Payment.deleteMany({}), StockAdjustment.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);
  console.log("✅ Collections cleared.\n");

  // ── 1. Users ─────────────────────────────────────────────────────────────────
  console.log("👤 Seeding Users...");
  const existingAdmin = await User.findOne({ email: "admin@alcoascaffolding.ae" });
  let adminUser;
  if (!existingAdmin) {
    adminUser = await User.create({
      name: "Super Admin", email: "admin@alcoascaffolding.ae", password: "Admin@1234",
      role: "super_admin", department: "management", phone: "+971 4 100 0001", isActive: true, lastLogin: new Date(),
    });
    await User.create([
      { name: "Sales Manager", email: "sales@alcoascaffolding.ae", password: "Sales@1234", role: "manager", department: "sales", phone: "+971 4 100 0002", isActive: true },
      { name: "Accounts Officer", email: "accounts@alcoascaffolding.ae", password: "Accounts@1234", role: "accountant", department: "accounts", phone: "+971 4 100 0003", isActive: true },
      { name: "Inventory Officer", email: "inventory@alcoascaffolding.ae", password: "Inventory@1234", role: "inventory", department: "inventory", phone: "+971 4 100 0004", isActive: true },
      { name: "Sales Executive", email: "salexec@alcoascaffolding.ae", password: "SalExec@1234", role: "sales", department: "sales", phone: "+971 50 100 0005", isActive: true },
    ]);
    console.log("   ✅ 5 users created (admin@alcoascaffolding.ae / Admin@1234)");
  } else {
    adminUser = existingAdmin;
    console.log("   ℹ️  Admin user already exists — skipped.");
  }

  // ── 2. Bank Accounts ─────────────────────────────────────────────────────────
  console.log("🏦 Seeding Bank Accounts...");
  const bankAccounts = await BankAccount.insertMany([
    { accountName: "Alcoa Scaffolding - Operations", bankName: "Emirates NBD", accountNumber: "1234567890", iban: "AE070260001234567890123", swiftCode: "EBILAEAD", branch: "Business Bay", currency: "AED", openingBalance: 250000, currentBalance: 387500, notes: "Main operations account" },
    { accountName: "Alcoa Scaffolding - Payroll", bankName: "ADCB", accountNumber: "9876543210", iban: "AE280030000009876543210", swiftCode: "ADCBAEAA", branch: "Deira", currency: "AED", openingBalance: 100000, currentBalance: 145000, notes: "Payroll & staff expenses" },
    { accountName: "Alcoa Scaffolding - USD Account", bankName: "Mashreq Bank", accountNumber: "1122334455", iban: "AE380330000001122334455", swiftCode: "BOMLAEAD", branch: "Al Quoz", currency: "USD", openingBalance: 50000, currentBalance: 62000, notes: "International transactions" },
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
  const firstNames = ["Mohammed", "Ahmed", "Khalid", "Omar", "Sultan", "Rashid", "Saeed", "Hamdan", "Majid", "Sanjay", "Rajesh", "Anil", "Priya", "Deepak", "James", "Robert", "Michael", "David"];
  const lastNames = ["Al Mansoori", "Al Rashidi", "Al Shamsi", "Al Zaabi", "Al Ameri", "Bin Laden", "Kumar", "Sharma", "Singh", "O'Brien", "Smith", "Johnson"];
  const designations = ["Procurement Manager", "Project Manager", "Site Engineer", "Operations Director", "Supply Chain Manager", "Contracts Manager", "General Manager", "Finance Manager"];

  const customers = await Customer.insertMany(CUSTOMERS_DATA.map((c, i) => {
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
        area: area,
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

  // ── 6. Quotations ────────────────────────────────────────────────────────────
  console.log("📋 Seeding Quotations...");
  const quotationStatuses = ["draft", "sent", "viewed", "approved", "rejected", "converted", "sent", "approved", "approved", "sent"];
  const salesExecs = ["Ahmed Al Rashid", "Priya Nair", "Mohammed Hassan", "Rajesh Kumar", "Sarah Al Mansoori"];
  const bankDetail = { bankName: "Emirates NBD", accountName: "Alcoa Aluminium Scaffolding LLC", accountNumber: "1234567890", iban: "AE070260001234567890123", swiftCode: "EBILAEAD", branch: "Business Bay" };

  const quotations = [];
  for (let i = 0; i < 25; i++) {
    const customer = customers[i % customers.length];
    const status = quotationStatuses[i % quotationStatuses.length];
    const qDate = daysAgo(rand(5, 180));
    const validUntil = new Date(qDate.getTime() + 30 * 86400000);
    const numItems = rand(2, 5);
    const items = [];

    for (let j = 0; j < numItems; j++) {
      const prod = products[rand(0, products.length - 1)];
      const qty = rand(1, 20);
      const rate = prod.rentalPrice || prod.sellingPrice;
      const rentalDays = rand(7, 180);
      const taxable = qty * rate * rentalDays / 30;
      const vat = taxable * 0.05;
      items.push({
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

    const subtotal = items.reduce((s, it) => s + it.taxableAmount, 0);
    const delivery = rand(0, 1) ? rand(200, 800) : 0;
    const installation = rand(0, 1) ? rand(300, 1200) : 0;
    const beforeVAT = subtotal + delivery + installation;
    const vatAmt = parseFloat((beforeVAT * 0.05).toFixed(2));
    const total = parseFloat((beforeVAT + vatAmt).toFixed(2));

    quotations.push({
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
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryCharges: delivery,
      installationCharges: installation,
      pickupCharges: delivery ? rand(200, 500) : 0,
      discount: rand(0, 1) ? rand(500, 3000) : 0,
      discountType: "fixed",
      vatPercentage: 5,
      vatAmount: vatAmt,
      totalAmount: total,
      currency: "AED",
      deliveryAddress: {
        addressLine1: customer.addresses?.[0]?.addressLine1 || "Project Site",
        area: customer.addresses?.[0]?.area || "Dubai",
        city: customer.addresses?.[0]?.city || "Dubai",
        emirate: customer.addresses?.[0]?.emirate || "Dubai",
      },
      deliveryDate: daysFromNow(rand(7, 45)),
      notes: `Terms as per agreement. VAT @ 5% applicable.`,
      bankDetails: bankDetail,
      sentDate: ["sent", "viewed", "approved", "converted"].includes(status) ? new Date(qDate.getTime() + 86400000) : undefined,
      viewedDate: ["viewed", "approved", "converted"].includes(status) ? new Date(qDate.getTime() + 2 * 86400000) : undefined,
      createdBy: adminUser._id,
    });
  }
  const createdQuotations = await Quotation.insertMany(quotations);
  console.log(`   ✅ ${createdQuotations.length} quotations created`);

  // ── 7. Sales Orders ──────────────────────────────────────────────────────────
  console.log("🛒 Seeding Sales Orders...");
  const soStatuses = ["confirmed", "in_progress", "delivered", "completed", "completed", "confirmed", "in_progress"];
  const salesOrders = [];
  for (let i = 0; i < 18; i++) {
    const customer = customers[i % customers.length];
    const relatedQuote = createdQuotations[i] || createdQuotations[0];
    const orderDate = daysAgo(rand(5, 150));
    const numItems = rand(1, 4);
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const prod = products[rand(0, products.length - 1)];
      const qty = rand(1, 15);
      const unitPrice = prod.rentalPrice || prod.sellingPrice;
      items.push({ description: prod.name, quantity: qty, unit: prod.unit, unitPrice, total: qty * unitPrice });
    }
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const vatAmount = parseFloat((subtotal * 0.05).toFixed(2));
    salesOrders.push({
      orderNumber: `SO-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      quotation: relatedQuote._id,
      orderDate,
      deliveryDate: new Date(orderDate.getTime() + rand(3, 14) * 86400000),
      status: soStatuses[i % soStatuses.length],
      items, subtotal,
      vatAmount,
      total: parseFloat((subtotal + vatAmount).toFixed(2)),
      currency: "AED",
      notes: "Standard rental order.",
      createdBy: adminUser._id,
    });
  }
  const createdSalesOrders = await SalesOrder.insertMany(salesOrders);
  console.log(`   ✅ ${createdSalesOrders.length} sales orders created`);

  // ── 8. Sales Invoices ────────────────────────────────────────────────────────
  console.log("🧾 Seeding Sales Invoices...");
  const siStatuses = ["paid", "paid", "paid", "partially_paid", "unpaid", "overdue", "paid"];
  const salesInvoices = [];
  for (let i = 0; i < 18; i++) {
    const so = createdSalesOrders[i];
    const customer = customers[i % customers.length];
    const invoiceDate = new Date(so.orderDate.getTime() + rand(1, 5) * 86400000);
    const dueDate = new Date(invoiceDate.getTime() + rand(7, 60) * 86400000);
    const paymentStatus = siStatuses[i % siStatuses.length];
    const paidAmount = paymentStatus === "paid" ? so.total : paymentStatus === "partially_paid" ? parseFloat((so.total * 0.5).toFixed(2)) : 0;
    salesInvoices.push({
      invoiceNumber: `INV-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      salesOrder: so._id,
      invoiceDate, dueDate, paymentStatus,
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
  }
  const createdSalesInvoices = await SalesInvoice.insertMany(salesInvoices);
  console.log(`   ✅ ${createdSalesInvoices.length} sales invoices created`);

  // ── 9. Receipts ──────────────────────────────────────────────────────────────
  console.log("💰 Seeding Receipts...");
  const receipts = [];
  for (let i = 0; i < 12; i++) {
    const inv = createdSalesInvoices[i];
    if (!["paid", "partially_paid"].includes(inv.paymentStatus)) continue;
    const customer = customers[i % customers.length];
    receipts.push({
      receiptNumber: `RCP-2026-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.companyName,
      invoices: [inv._id],
      receiptDate: new Date(inv.invoiceDate.getTime() + rand(1, 30) * 86400000),
      amount: inv.paidAmount,
      paymentMethod: pick(["Bank Transfer", "Cheque", "Cash", "Bank Transfer", "Bank Transfer"]),
      bankAccount: bankAccounts[0]._id,
      reference: `CHQ-${rand(100000, 999999)}`,
      notes: `Payment received for ${inv.invoiceNumber}`,
      createdBy: adminUser._id,
    });
  }
  const createdReceipts = await Receipt.insertMany(receipts);
  console.log(`   ✅ ${createdReceipts.length} receipts created`);

  // ── 10. Purchase Orders ───────────────────────────────────────────────────────
  console.log("📦 Seeding Purchase Orders...");
  const poStatuses = ["received", "received", "confirmed", "partially_received", "sent", "draft"];
  const purchaseOrders = [];
  for (let i = 0; i < 12; i++) {
    const vendor = vendors[i % vendors.length];
    const orderDate = daysAgo(rand(10, 200));
    const numItems = rand(1, 4);
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const prod = products[rand(0, products.length - 1)];
      const qty = rand(5, 50);
      const unitPrice = prod.purchasePrice;
      items.push({ description: prod.name, quantity: qty, unit: prod.unit, unitPrice, total: qty * unitPrice });
    }
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const vatAmount = parseFloat((subtotal * 0.05).toFixed(2));
    purchaseOrders.push({
      poNumber: `PO-2026-${String(i + 1).padStart(4, "0")}`,
      vendor: vendor._id,
      vendorName: vendor.companyName,
      orderDate,
      deliveryDate: new Date(orderDate.getTime() + rand(7, 21) * 86400000),
      status: poStatuses[i % poStatuses.length],
      items, subtotal, vatAmount,
      total: parseFloat((subtotal + vatAmount).toFixed(2)),
      currency: "AED",
      notes: "Standard purchase order.",
      createdBy: adminUser._id,
    });
  }
  const createdPurchaseOrders = await PurchaseOrder.insertMany(purchaseOrders);
  console.log(`   ✅ ${createdPurchaseOrders.length} purchase orders created`);

  // ── 11. Purchase Invoices ─────────────────────────────────────────────────────
  console.log("🧾 Seeding Purchase Invoices...");
  const piStatuses = ["paid", "paid", "paid", "partially_paid", "unpaid", "overdue"];
  const purchaseInvoices = [];
  for (let i = 0; i < 12; i++) {
    const po = createdPurchaseOrders[i];
    const vendor = vendors[i % vendors.length];
    const invoiceDate = new Date(po.orderDate.getTime() + rand(1, 5) * 86400000);
    const dueDate = new Date(invoiceDate.getTime() + rand(7, 45) * 86400000);
    const paymentStatus = piStatuses[i % piStatuses.length];
    const paidAmount = paymentStatus === "paid" ? po.total : paymentStatus === "partially_paid" ? parseFloat((po.total * 0.5).toFixed(2)) : 0;
    purchaseInvoices.push({
      invoiceNumber: `PI-2026-${String(i + 1).padStart(4, "0")}`,
      vendor: vendor._id,
      vendorName: vendor.companyName,
      purchaseOrder: po._id,
      invoiceDate, dueDate, paymentStatus,
      subtotal: po.subtotal,
      vatAmount: po.vatAmount,
      total: po.total,
      paidAmount,
      balance: parseFloat((po.total - paidAmount).toFixed(2)),
      currency: "AED",
      notes: `Invoice for ${po.poNumber}`,
      createdBy: adminUser._id,
    });
  }
  const createdPurchaseInvoices = await PurchaseInvoice.insertMany(purchaseInvoices);
  console.log(`   ✅ ${createdPurchaseInvoices.length} purchase invoices created`);

  // ── 12. Payments (to Vendors) ─────────────────────────────────────────────────
  console.log("💸 Seeding Payments...");
  const payments = [];
  for (let i = 0; i < 8; i++) {
    const pi = createdPurchaseInvoices[i];
    if (!["paid", "partially_paid"].includes(pi.paymentStatus)) continue;
    const vendor = vendors[i % vendors.length];
    payments.push({
      paymentNumber: `PAY-2026-${String(i + 1).padStart(4, "0")}`,
      vendor: vendor._id,
      vendorName: vendor.companyName,
      invoices: [pi._id],
      paymentDate: new Date(pi.invoiceDate.getTime() + rand(1, 30) * 86400000),
      amount: pi.paidAmount,
      paymentMethod: pick(["Bank Transfer", "Cheque", "Bank Transfer"]),
      bankAccount: bankAccounts[0]._id,
      reference: `TXN-${rand(1000000, 9999999)}`,
      notes: `Payment for ${pi.invoiceNumber}`,
      createdBy: adminUser._id,
    });
  }
  const createdPayments = await Payment.insertMany(payments);
  console.log(`   ✅ ${createdPayments.length} payments created`);

  // ── 13. Stock Adjustments ─────────────────────────────────────────────────────
  console.log("📊 Seeding Stock Adjustments...");
  const adjustmentTypes = ["increase", "decrease", "correction", "increase", "decrease"];
  const adjustmentReasons = [
    "New stock received from supplier", "Damaged during transport",
    "Physical count correction", "Returned from customer site",
    "Issued to site — Al Mansoori project", "Loss/theft reported",
    "Stock count variance", "Returned items — cleaning & repair",
  ];
  const stockAdjustments = [];
  for (let i = 0; i < 15; i++) {
    const product = products[i % products.length];
    const adjType = adjustmentTypes[i % adjustmentTypes.length];
    const qty = rand(1, 20);
    const prev = product.currentStock;
    const newStock = adjType === "increase" ? prev + qty : Math.max(0, prev - qty);
    stockAdjustments.push({
      adjustmentNumber: `ADJ-2026-${String(i + 1).padStart(4, "0")}`,
      product: product._id,
      productName: product.name,
      adjustmentType: adjType,
      quantity: adjType === "decrease" ? -qty : qty,
      previousStock: prev,
      newStock,
      reason: pick(adjustmentReasons),
      notes: `Adjustment recorded by inventory officer.`,
      adjustedBy: adminUser._id,
    });
  }
  const createdAdjustments = await StockAdjustment.insertMany(stockAdjustments);
  console.log(`   ✅ ${createdAdjustments.length} stock adjustments created`);

  // ── 14. Contact Messages ──────────────────────────────────────────────────────
  console.log("✉️  Seeding Contact Messages...");
  const createdMessages = await ContactMessage.insertMany(
    CONTACT_MESSAGES_DATA.map((m, i) => ({
      ...m,
      emailSent: m.status !== "new",
      emailSentAt: m.status !== "new" ? daysAgo(rand(1, 30)) : undefined,
      createdAt: daysAgo(rand(1, 60)),
    }))
  );
  console.log(`   ✅ ${createdMessages.length} contact messages created`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log("🎉  SEED COMPLETE — Summary");
  console.log("═".repeat(55));
  console.log(`   👤  Users              : 5`);
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
  console.log(`   📊  Stock Adjustments  : ${createdAdjustments.length}`);
  console.log(`   ✉️   Contact Messages   : ${createdMessages.length}`);
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
