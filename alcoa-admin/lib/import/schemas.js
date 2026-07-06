/**
 * Import column schemas aligned with database models.
 * Product/vendor category enums are filled at runtime from the Categories collection.
 */

const CUSTOMER_STATUS = ["active", "inactive", "blocked", "prospect"];
const CUSTOMER_TYPES = ["rental", "sales", "both"];
const PAYMENT_TERMS = ["Cash", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "Custom"];
const BUSINESS_TYPES = [
  "Construction Company",
  "Contractor",
  "Facility Management",
  "Government",
  "Individual",
  "Other",
];
const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];
const VENDOR_STATUS = ["active", "inactive", "blocked"];
const VENDOR_PAYMENT_TERMS = ["Cash", "7 Days", "15 Days", "30 Days", "60 Days", "Custom"];
const MESSAGE_TYPES = ["contact", "quote"];
const MESSAGE_STATUS = ["new", "read", "in_progress", "responded", "closed"];
const MESSAGE_PRIORITY = ["low", "medium", "high", "urgent"];
const PROJECT_TYPES = ["residential", "commercial", "industrial", "emergency", "rental", "consultation", ""];

export const IMPORT_SCHEMAS = {
  products: {
    resource: "products",
    label: "Products",
    sheetName: "Products",
    columns: [
      { key: "itemCode", header: "Item Code", required: true, type: "string" },
      { key: "name", header: "Name", required: true, type: "string" },
      { key: "category", header: "Category", type: "enum", enumValues: [] },
      { key: "unit", header: "Unit", type: "string", default: "Nos" },
      {
        key: "sellingPrice",
        header: "Selling Price (AED)",
        aliases: ["Selling Price", "Selling Price AED"],
        type: "number",
        min: 0,
        default: 0,
      },
      {
        key: "rentalPrice",
        header: "Rental Price/Day (AED)",
        aliases: ["Rental Price", "Rental Price Day AED"],
        type: "number",
        min: 0,
        default: 0,
      },
      {
        key: "purchasePrice",
        header: "Purchase Price (AED)",
        aliases: ["Purchase Price"],
        type: "number",
        min: 0,
        default: 0,
      },
      { key: "currentStock", header: "Stock", aliases: ["Current Stock"], type: "number", min: 0, default: 0 },
      { key: "minStock", header: "Min Stock", type: "number", min: 0, default: 0 },
      { key: "reorderLevel", header: "Reorder Level", type: "number", min: 0, default: 0 },
      { key: "maxStock", header: "Max Stock", type: "number", min: 0, default: 0 },
      {
        key: "preferredVendorCode",
        header: "Preferred Vendor Code",
        aliases: ["Vendor Code"],
        type: "fk",
      },
      {
        key: "isActive",
        header: "Status",
        aliases: ["Active", "Is Active"],
        type: "boolean",
        default: true,
      },
      { key: "description", header: "Description", type: "string" },
    ],
  },

  vendors: {
    resource: "vendors",
    label: "Vendors",
    sheetName: "Vendors",
    columns: [
      { key: "vendorCode", header: "Vendor Code", type: "string" },
      { key: "companyName", header: "Company Name", required: true, type: "string" },
      { key: "contactPerson", header: "Contact Person", type: "string" },
      { key: "email", header: "Email", type: "email" },
      { key: "phone", header: "Phone", type: "string" },
      { key: "emirate", header: "Emirate", type: "enum", enumValues: EMIRATES },
      { key: "vatNumber", header: "VAT/TRN", aliases: ["VAT Number", "TRN"], type: "string" },
      { key: "tradeLicenseNumber", header: "Trade License", type: "string" },
      { key: "paymentTerms", header: "Payment Terms", type: "enum", enumValues: VENDOR_PAYMENT_TERMS, default: "Cash" },
      { key: "category", header: "Category", type: "enum", enumValues: [], default: "Supplier" },
      { key: "creditLimit", header: "Credit Limit", type: "number", min: 0, default: 0 },
      { key: "status", header: "Status", type: "enum", enumValues: VENDOR_STATUS, default: "active" },
      { key: "notes", header: "Notes", type: "string" },
    ],
  },

  customers: {
    resource: "customers",
    label: "Customers",
    sheetName: "Customers",
    columns: [
      { key: "companyName", header: "Company Name", required: true, type: "string" },
      { key: "contactName", header: "Contact Name", required: true, type: "string" },
      { key: "contactPhone", header: "Contact Phone", required: true, type: "string" },
      { key: "contactEmail", header: "Contact Email", type: "email" },
      {
        key: "businessType",
        header: "Business Type",
        type: "enum",
        enumValues: BUSINESS_TYPES,
        default: "Construction Company",
      },
      { key: "status", header: "Status", type: "enum", enumValues: CUSTOMER_STATUS, default: "prospect" },
      { key: "customerType", header: "Customer Type", type: "enum", enumValues: CUSTOMER_TYPES, default: "both" },
      { key: "paymentTerms", header: "Payment Terms", type: "enum", enumValues: PAYMENT_TERMS, default: "Cash" },
      { key: "addressLine1", header: "Address Line 1", type: "string" },
      { key: "city", header: "City", type: "string" },
      { key: "emirate", header: "Emirate", type: "enum", enumValues: EMIRATES },
      { key: "tradeLicenseNumber", header: "Trade License", type: "string" },
      { key: "vatRegistrationNumber", header: "VAT/TRN", aliases: ["VAT Registration Number"], type: "string" },
      { key: "notes", header: "Notes", type: "string" },
    ],
  },

  "bank-accounts": {
    resource: "bank-accounts",
    label: "Bank Accounts",
    sheetName: "Bank Accounts",
    columns: [
      { key: "accountName", header: "Account Name", required: true, type: "string" },
      { key: "bankName", header: "Bank Name", required: true, type: "string" },
      { key: "accountNumber", header: "Account Number", required: true, type: "string" },
      { key: "iban", header: "IBAN", type: "string" },
      { key: "swiftCode", header: "Swift Code", aliases: ["SWIFT Code"], type: "string" },
      { key: "branch", header: "Branch", type: "string" },
      { key: "currency", header: "Currency", type: "string", default: "AED" },
      {
        key: "openingBalance",
        header: "Opening Balance",
        type: "number",
        default: 0,
      },
      {
        key: "isPrimary",
        header: "Primary",
        aliases: ["Is Primary", "Default"],
        type: "boolean",
        default: false,
      },
      { key: "notes", header: "Notes", type: "string" },
    ],
  },

  "contact-messages": {
    resource: "contact-messages",
    label: "Contact Messages",
    sheetName: "Contact Messages",
    columns: [
      { key: "type", header: "Type", required: true, type: "enum", enumValues: MESSAGE_TYPES },
      { key: "name", header: "Name", required: true, type: "string" },
      { key: "email", header: "Email", required: true, type: "email" },
      { key: "phone", header: "Phone", required: true, type: "string" },
      { key: "company", header: "Company", type: "string" },
      { key: "projectType", header: "Project Type", type: "enum", enumValues: PROJECT_TYPES },
      { key: "message", header: "Message", type: "string" },
      { key: "status", header: "Status", type: "enum", enumValues: MESSAGE_STATUS, default: "new" },
      { key: "priority", header: "Priority", type: "enum", enumValues: MESSAGE_PRIORITY, default: "medium" },
    ],
  },
};

export const IMPORTABLE_RESOURCES = Object.keys(IMPORT_SCHEMAS);

export function getImportSchema(resource) {
  return IMPORT_SCHEMAS[resource] || null;
}
