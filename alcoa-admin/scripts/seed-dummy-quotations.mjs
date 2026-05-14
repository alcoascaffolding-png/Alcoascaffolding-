import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB, getMongoDbName } from "../lib/db.js";
import Customer from "../models/Customer.js";
import Quotation from "../models/Quotation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const VAT_PERCENTAGE = 5;

const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountName: "Alcoa Aluminium Scaffolding LLC",
  accountNumber: "1234567890",
  iban: "AE070260001234567890123",
  swiftCode: "EBILAEAD",
  branch: "Business Bay",
};

const TERMS_AND_CONDITIONS = `1. All prices quoted are in AED (UAE Dirhams) unless otherwise stated.
2. This quotation is valid for 30 days from the date of issue.
3. Payment terms are as mentioned in this quotation.
4. Delivery terms are subject to site access and material availability.
5. Equipment remains the property of ALCOA until full payment is received.
6. Any damage or loss of rented items will be charged separately.
7. VAT is applicable as per UAE law.`;

const ITEM_CATALOG = [
  {
    code: "ALU-LDR-001",
    equipmentType: "Aluminium Extension Ladder - 6m",
    description: "Aluminium Extension Ladder - 6m",
    specifications: "EN131 Standard, SWL 150kg, Anti-slip rubber feet",
    size: "Extended: 6m, Closed: 3.3m",
    weight: 12,
    cbm: 0.08,
    unit: "Nos",
    ratePerUnit: 60,
  },
  {
    code: "ALU-LDR-002",
    equipmentType: "Aluminium Step Ladder - 8 Step",
    description: "Aluminium Step Ladder - 8 Step",
    specifications: "EN131 Standard, SWL 150kg, Platform with handrails",
    size: "Height: 2.4m",
    weight: 8,
    cbm: 0.05,
    unit: "Nos",
    ratePerUnit: 30,
  },
  {
    code: "ALU-LDR-003",
    equipmentType: "Platform Ladder - 3 Step",
    description: "Platform Ladder - 3 Step",
    specifications: "EN131 Standard, SWL 150kg, Wide anti-slip steps",
    size: "3 step platform ladder",
    weight: 6,
    cbm: 0.03,
    unit: "Nos",
    ratePerUnit: 25,
  },
  {
    code: "ALU-SF-003",
    equipmentType: "Aluminium Scaffolding Tower - 8m",
    description: "Aluminium Scaffolding Tower - 8m",
    specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, Stabilisers included",
    size: "0.75m x 1.85m x 8m",
    weight: 185,
    cbm: 0.65,
    unit: "Set",
    ratePerUnit: 560,
  },
  {
    code: "ALU-SF-004",
    equipmentType: "Aluminium Scaffolding Tower - 10m",
    description: "Aluminium Scaffolding Tower - 10m",
    specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, Double width platform",
    size: "0.75m x 1.85m x 10m",
    weight: 230,
    cbm: 0.78,
    unit: "Set",
    ratePerUnit: 700,
  },
  {
    code: "STL-SF-001",
    equipmentType: "Steel Scaffolding System - Standard Bay",
    description: "Steel Scaffolding System - Standard Bay",
    specifications: "Hot-dip galvanised, BS EN 12810 Standard, SWL 750kg/m²",
    size: "1.2m x 2m",
    weight: 320,
    cbm: 0.92,
    unit: "Set",
    ratePerUnit: 180,
  },
  {
    code: "STL-SF-002",
    equipmentType: "Steel Scaffolding Tube - 6m",
    description: "Steel Scaffolding Tube - 6m",
    specifications: "48.3mm OD, Hot-dip galvanised, BS EN 10025",
    size: "6m length",
    weight: 21,
    cbm: 0.02,
    unit: "Nos",
    ratePerUnit: 8,
  },
  {
    code: "STL-SF-003",
    equipmentType: "Steel Scaffolding Coupler - Swivel",
    description: "Steel Scaffolding Coupler - Swivel",
    specifications: "Drop forged, BS EN 74-1, SWL 6.25kN",
    size: "Standard swivel coupler",
    weight: 1.2,
    cbm: 0.001,
    unit: "Nos",
    ratePerUnit: 1.5,
  },
  {
    code: "ACC-PLK-001",
    equipmentType: "Aluminium Platform Board - 3m",
    description: "Aluminium Platform Board - 3m",
    specifications: "Anti-slip punched surface, Grade 6082 Aluminium",
    size: "3000mm x 450mm",
    weight: 9,
    cbm: 0.04,
    unit: "Nos",
    ratePerUnit: 45,
  },
  {
    code: "ACC-PLK-002",
    equipmentType: "Timber Scaffold Board - 3.9m",
    description: "Timber Scaffold Board - 3.9m",
    specifications: "BS 2482 compliant, BSI Kitemarked",
    size: "3900mm x 225mm x 38mm",
    weight: 15,
    cbm: 0.05,
    unit: "Nos",
    ratePerUnit: 15,
  },
  {
    code: "ACC-WHL-001",
    equipmentType: "Scaffold Tower Wheel - 200mm",
    description: "Scaffold Tower Wheel - 200mm",
    specifications: "With brake, 200kg load rating",
    size: "200mm wheel",
    weight: 3,
    cbm: 0.01,
    unit: "Nos",
    ratePerUnit: 6,
  },
  {
    code: "ACC-OBG-001",
    equipmentType: "Outrigger / Base Guard Set",
    description: "Outrigger / Base Guard Set",
    specifications: "4-piece set, adjustable, EN1004 compliant",
    size: "500mm - 900mm",
    weight: 18,
    cbm: 0.08,
    unit: "Set",
    ratePerUnit: 20,
  },
  {
    code: "SAF-HRN-001",
    equipmentType: "Full Body Safety Harness",
    description: "Full Body Safety Harness",
    specifications: "EN361, EN358 certified, adjustable polyester webbing",
    size: "Universal size",
    weight: 1.5,
    cbm: 0.01,
    unit: "Nos",
    ratePerUnit: 12,
  },
  {
    code: "SAF-HLM-001",
    equipmentType: "Safety Helmet - White",
    description: "Safety Helmet - White",
    specifications: "EN397, ABS shell, ratchet adjustment",
    size: "Standard",
    weight: 0.4,
    cbm: 0.004,
    unit: "Nos",
    ratePerUnit: 3,
  },
  {
    code: "SAF-NET-001",
    equipmentType: "Safety Net - 6m x 10m",
    description: "Safety Net - 6m x 10m",
    specifications: "EN1263-1, HDPE, 100mm mesh",
    size: "6m x 10m",
    weight: 22,
    cbm: 0.12,
    unit: "Nos",
    ratePerUnit: 30,
  },
  {
    code: "ALU-SF-001",
    equipmentType: "Aluminium Scaffolding Tower - 3m",
    description: "Aluminium Scaffolding Tower - 3m",
    specifications: "Grade 6082-T6 Aluminium, EN1004 Standard",
    size: "0.75m x 1.85m x 3m",
    weight: 85,
    cbm: 0.28,
    unit: "Set",
    ratePerUnit: 250,
  },
  {
    code: "ALU-SF-002",
    equipmentType: "Aluminium Scaffolding Tower - 5m",
    description: "Aluminium Scaffolding Tower - 5m",
    specifications: "Grade 6082-T6 Aluminium, EN1004 Standard",
    size: "0.75m x 1.85m x 5m",
    weight: 130,
    cbm: 0.41,
    unit: "Set",
    ratePerUnit: 380,
  },
  {
    code: "ALU-SF-EXT-001",
    equipmentType: "Stairway Tower Extension Frame",
    description: "Stairway Tower Extension Frame",
    specifications: "Built-in stairway access, 0.75m x 1.85m frame",
    size: "0.75m x 1.85m",
    weight: 24,
    cbm: 0.09,
    unit: "Nos",
    ratePerUnit: 85,
  },
  {
    code: "STL-BASE-001",
    equipmentType: "Adjustable Base Plate - Heavy Duty",
    description: "Adjustable Base Plate - Heavy Duty",
    specifications: "M38 spindle, hot-dip galvanised",
    size: "150mm x 150mm plate",
    weight: 4.5,
    cbm: 0.008,
    unit: "Nos",
    ratePerUnit: 4,
  },
  {
    code: "ALU-SF-005",
    equipmentType: "Aluminium Scaffolding Tower - 12m",
    description: "Aluminium Scaffolding Tower - 12m",
    specifications: "Grade 6082-T6 Aluminium, EN1004 Standard, Double width platform",
    size: "0.75m x 1.85m x 12m",
    weight: 280,
    cbm: 0.96,
    unit: "Set",
    ratePerUnit: 900,
  },
];

const CUSTOMER_FIXTURES = [
  {
    companyName: "Northstar Facade Contracting LLC",
    tradeLicenseNumber: "CN-DXB-2024-55101",
    vatRegistrationNumber: "100551019876543",
    businessType: "Contractor",
    primaryEmail: "procurement@northstarfacade.ae",
    primaryPhone: "+971 4 555 1201",
    primaryWhatsApp: "+971 50 555 1201",
    paymentTerms: "30 Days",
    priority: "high",
    source: "Other",
    status: "active",
    customerType: "rental",
    goodsCount: 10,
    salesExecutive: "Sarah Al Mansoori",
    preparedBy: "Sarah Al Mansoori",
    projectDuration: "2 months",
    subjectSuffix: "Commercial Tower Facade Access",
    projectSite: "Northstar Tower, Business Bay",
    emirate: "Dubai",
    area: "Business Bay",
    addressLine1: "Office 1402, Prism Tower",
    addressLine2: "Business Bay",
    contactPerson: {
      name: "Khalid Rahman",
      designation: "Procurement Manager",
      email: "khalid.rahman@northstarfacade.ae",
      phone: "+971 50 555 1201",
    },
    catalogOffset: 0,
  },
  {
    companyName: "Blue Horizon Interior Fitout LLC",
    tradeLicenseNumber: "CN-DXB-2023-66214",
    vatRegistrationNumber: "100662149876543",
    businessType: "Construction Company",
    primaryEmail: "quotes@bluehorizonfitout.ae",
    primaryPhone: "+971 4 662 1402",
    primaryWhatsApp: "+971 52 662 1402",
    paymentTerms: "15 Days",
    priority: "medium",
    source: "Other",
    status: "active",
    customerType: "rental",
    goodsCount: 12,
    salesExecutive: "Rajesh Kumar",
    preparedBy: "Rajesh Kumar",
    projectDuration: "3 months",
    subjectSuffix: "Hotel Renovation Access Works",
    projectSite: "Marina Crown Hotel, Dubai Marina",
    emirate: "Dubai",
    area: "Jumeirah",
    addressLine1: "Office 602, Al Thuraya Tower",
    addressLine2: "Dubai Internet City",
    contactPerson: {
      name: "Priya Menon",
      designation: "Projects Coordinator",
      email: "priya.menon@bluehorizonfitout.ae",
      phone: "+971 52 662 1402",
    },
    catalogOffset: 3,
  },
  {
    companyName: "Emirates Industrial Access Solutions LLC",
    tradeLicenseNumber: "CN-ABD-2022-77831",
    vatRegistrationNumber: "100778319876543",
    businessType: "Construction Company",
    primaryEmail: "operations@emiratesaccess.ae",
    primaryPhone: "+971 2 778 3103",
    primaryWhatsApp: "+971 55 778 3103",
    paymentTerms: "45 Days",
    priority: "high",
    source: "Other",
    status: "active",
    customerType: "both",
    goodsCount: 15,
    salesExecutive: "Ahmed Al Rashid",
    preparedBy: "Ahmed Al Rashid",
    projectDuration: "4 months",
    subjectSuffix: "Refinery Maintenance Shutdown",
    projectSite: "Mussafah Industrial Plant, Abu Dhabi",
    emirate: "Abu Dhabi",
    area: "Mussafah",
    addressLine1: "Warehouse 18, ICAD 1",
    addressLine2: "Mussafah Industrial Area",
    contactPerson: {
      name: "Omar Al Hammadi",
      designation: "Site Logistics Manager",
      email: "omar.hammadi@emiratesaccess.ae",
      phone: "+971 55 778 3103",
    },
    catalogOffset: 5,
  },
  {
    companyName: "Desert Peak Maintenance Services LLC",
    tradeLicenseNumber: "CN-SHJ-2024-88420",
    vatRegistrationNumber: "100884209876543",
    businessType: "Facility Management",
    primaryEmail: "maintenance@desertpeakms.ae",
    primaryPhone: "+971 6 884 2004",
    primaryWhatsApp: "+971 54 884 2004",
    paymentTerms: "30 Days",
    priority: "vip",
    source: "Other",
    status: "active",
    customerType: "rental",
    goodsCount: 20,
    salesExecutive: "Mohammed Hassan",
    preparedBy: "Mohammed Hassan",
    projectDuration: "6 months",
    subjectSuffix: "Multi-Site Building Maintenance Contract",
    projectSite: "Sharjah & Northern Emirates Maintenance Program",
    emirate: "Sharjah",
    area: "Industrial Area",
    addressLine1: "Office 207, Al Majaz Business Centre",
    addressLine2: "Industrial Area 4",
    contactPerson: {
      name: "James D'Souza",
      designation: "Contracts Manager",
      email: "james.dsouza@desertpeakms.ae",
      phone: "+971 54 884 2004",
    },
    catalogOffset: 0,
  },
];

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCustomerAddress(def) {
  return [def.addressLine1, def.addressLine2, def.area, def.emirate, "UAE"]
    .filter(Boolean)
    .join(", ");
}

function buildItem(template, itemIndex) {
  const quantity = 2 + (itemIndex % 5) * 2;
  const ratePerUnit = template.ratePerUnit;
  const taxableAmount = round2(quantity * ratePerUnit);
  const vatAmount = round2((taxableAmount * VAT_PERCENTAGE) / 100);

  return {
    equipmentType: template.equipmentType,
    equipmentCode: template.code,
    description: template.description,
    specifications: template.specifications,
    size: template.size,
    weight: template.weight,
    cbm: template.cbm,
    quantity,
    unit: template.unit,
    rentalDuration: { value: 30 + (itemIndex % 4) * 15, unit: "day" },
    ratePerUnit,
    taxableAmount,
    vatPercentage: VAT_PERCENTAGE,
    vatAmount,
    subtotal: taxableAmount,
  };
}

function buildQuotationPayload(customer, fixture, index) {
  const items = Array.from({ length: fixture.goodsCount }, (_, itemIndex) =>
    buildItem(ITEM_CATALOG[(fixture.catalogOffset + itemIndex) % ITEM_CATALOG.length], itemIndex)
  );

  const subtotal = round2(items.reduce((sum, item) => sum + item.subtotal, 0));
  const deliveryCharges = round2(180 + fixture.goodsCount * 22);
  const installationCharges = round2(120 + fixture.goodsCount * 38);
  const pickupCharges = round2(90 + fixture.goodsCount * 14);
  const discount = fixture.goodsCount >= 15 ? round2(150 + fixture.goodsCount * 12) : 0;
  const beforeVat = round2(subtotal + deliveryCharges + installationCharges + pickupCharges - discount);
  const vatAmount = round2((beforeVat * VAT_PERCENTAGE) / 100);
  const totalAmount = round2(beforeVat + vatAmount);
  const quoteDate = addDays(new Date(), -(index * 5 + 3));
  const validUntil = addDays(quoteDate, 30);
  const status = ["draft", "sent", "viewed", "approved"][index] || "draft";
  const marker = `seed:dummy-quotation:${slugify(fixture.companyName)}`;

  return {
    customer: customer._id,
    customerName: customer.companyName,
    customerAddress: buildCustomerAddress(fixture),
    customerEmail: fixture.primaryEmail,
    customerPhone: fixture.primaryPhone,
    customerTRN: fixture.vatRegistrationNumber,
    contactPersonName: fixture.contactPerson.name,
    contactPersonDesignation: fixture.contactPerson.designation,
    contactPersonEmail: fixture.contactPerson.email,
    contactPersonPhone: fixture.contactPerson.phone,
    quoteDate,
    validUntil,
    quoteType: "rental",
    status,
    subject: `Scaffolding Rental for ${fixture.companyName} - ${fixture.subjectSuffix}`,
    salesExecutive: fixture.salesExecutive,
    preparedBy: fixture.preparedBy,
    paymentTerms: fixture.paymentTerms,
    deliveryTerms: "7-10 days from date of order",
    projectDuration: fixture.projectDuration,
    items,
    subtotal,
    deliveryCharges,
    installationCharges,
    pickupCharges,
    discount,
    discountType: "fixed",
    vatPercentage: VAT_PERCENTAGE,
    vatAmount,
    totalAmount,
    currency: "AED",
    deliveryAddress: {
      addressLine1: fixture.projectSite,
      addressLine2: fixture.addressLine2,
      area: fixture.area,
      city: fixture.emirate,
      emirate: fixture.emirate,
      landmark: "Access point to be confirmed by site team",
    },
    deliveryDate: addDays(quoteDate, 7),
    notes: "Dummy quotation seeded for PDF and multi-page quotation testing.",
    internalNotes: marker,
    termsAndConditions: TERMS_AND_CONDITIONS,
    bankDetails: BANK_DETAILS,
    sentDate: ["sent", "viewed", "approved", "converted"].includes(status) ? addDays(quoteDate, 1) : undefined,
    viewedDate: ["viewed", "approved", "converted"].includes(status) ? addDays(quoteDate, 2) : undefined,
  };
}

async function upsertCustomer(fixture) {
  const customerDoc = {
    companyName: fixture.companyName,
    displayName: fixture.companyName,
    tradeLicenseNumber: fixture.tradeLicenseNumber,
    vatRegistrationNumber: fixture.vatRegistrationNumber,
    businessType: fixture.businessType,
    primaryEmail: fixture.primaryEmail,
    primaryPhone: fixture.primaryPhone,
    primaryWhatsApp: fixture.primaryWhatsApp,
    paymentTerms: fixture.paymentTerms,
    creditLimit: 150000 + fixture.goodsCount * 5000,
    currentBalance: 0,
    currency: "AED",
    status: fixture.status,
    customerType: fixture.customerType,
    rating: 4,
    priority: fixture.priority,
    customerSince: addDays(new Date(), -180),
    notes: "Dummy customer seeded for quotation testing.",
    internalNotes: "seed:dummy-quotation-customer",
    source: fixture.source,
    tags: ["dummy-seed", "quotation-test", `goods-${fixture.goodsCount}`],
    contactPersons: [
      {
        name: fixture.contactPerson.name,
        designation: fixture.contactPerson.designation,
        email: fixture.contactPerson.email,
        phone: fixture.contactPerson.phone,
        whatsapp: fixture.contactPerson.phone,
        isPrimary: true,
        role: "primary",
      },
    ],
    addresses: [
      {
        type: "office",
        addressLine1: fixture.addressLine1,
        addressLine2: fixture.addressLine2,
        area: fixture.area,
        city: fixture.emirate,
        emirate: fixture.emirate,
        country: "UAE",
        landmark: fixture.projectSite,
        isPrimary: true,
      },
    ],
  };

  return Customer.findOneAndUpdate(
    { companyName: fixture.companyName },
    customerDoc,
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );
}

async function seedDummyQuotations() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found. Please set it in .env.local");
  }

  const dbName = getMongoDbName(process.env.MONGODB_URI);
  console.log(`Connecting to MongoDB database: ${dbName}`);
  await connectDB();
  console.log("Connected.");

  const markers = CUSTOMER_FIXTURES.map((fixture) => `seed:dummy-quotation:${slugify(fixture.companyName)}`);
  const deleted = await Quotation.deleteMany({ internalNotes: { $in: markers } });
  console.log(`Removed ${deleted.deletedCount} previous dummy quotations.`);

  const createdQuotes = [];

  for (let index = 0; index < CUSTOMER_FIXTURES.length; index += 1) {
    const fixture = CUSTOMER_FIXTURES[index];
    const customer = await upsertCustomer(fixture);

    const quotationPayload = buildQuotationPayload(customer, fixture, index);
    quotationPayload.quoteNumber = await Quotation.generateQuoteNumber();

    const quotation = new Quotation(quotationPayload);
    quotation.calculateTotals();
    await quotation.save();

    createdQuotes.push({
      customerName: fixture.companyName,
      quoteNumber: quotation.quoteNumber,
      goodsCount: fixture.goodsCount,
    });

    console.log(
      `Created quotation ${quotation.quoteNumber} for ${fixture.companyName} with ${fixture.goodsCount} goods.`
    );
  }

  console.log("\nDummy quotation seed complete:");
  for (const quote of createdQuotes) {
    console.log(`- ${quote.quoteNumber} | ${quote.customerName} | ${quote.goodsCount} goods`);
  }
}

seedDummyQuotations()
  .catch((error) => {
    console.error("Dummy quotation seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
