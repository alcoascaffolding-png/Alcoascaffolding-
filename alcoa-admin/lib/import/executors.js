import { connectDB } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { assertValidCategory } from "@/lib/category-service";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import Customer from "@/models/Customer";
import BankAccount from "@/models/BankAccount";
import ContactMessage from "@/models/ContactMessage";

const VENDOR_CODE_PREFIX = "VND";

async function resolveVendorIdByCode(code, cache) {
  if (!code) return undefined;
  const key = String(code).trim().toUpperCase();
  if (cache.has(key)) return cache.get(key);

  const vendor = await Vendor.findOne({
    vendorCode: { $regex: new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  })
    .select("_id")
    .lean();

  const id = vendor?._id || null;
  cache.set(key, id);
  return id;
}

function rowError(rowNumber, message) {
  return { row: rowNumber, message };
}

export async function importProducts(rows, userId) {
  const vendorCache = new Map();
  const result = { created: 0, updated: 0, failed: 0, errors: [] };

  for (const { rowNumber, data } of rows) {
    try {
      const preferredVendorCode = data.preferredVendorCode;
      let preferredVendor;

      if (preferredVendorCode) {
        preferredVendor = await resolveVendorIdByCode(preferredVendorCode, vendorCache);
        if (!preferredVendor) {
          result.failed++;
          result.errors.push(
            rowError(
              rowNumber,
              `Row ${rowNumber}: Vendor code "${preferredVendorCode}" was not found. Import vendors first or leave the column empty.`
            )
          );
          continue;
        }
      }

      const category = data.category
        ? await assertValidCategory("product", data.category, { allowEmpty: true })
        : undefined;

      const payload = {
        itemCode: data.itemCode.trim(),
        name: data.name.trim(),
        category,
        unit: data.unit || "Nos",
        sellingPrice: data.sellingPrice ?? 0,
        rentalPrice: data.rentalPrice ?? 0,
        purchasePrice: data.purchasePrice ?? 0,
        currentStock: data.currentStock ?? 0,
        minStock: data.minStock ?? 0,
        reorderLevel: data.reorderLevel ?? 0,
        maxStock: data.maxStock ?? 0,
        preferredVendor,
        isActive: data.isActive !== false,
        description: data.description || undefined,
      };

      const existing = await Product.findOne({ itemCode: payload.itemCode });
      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: payload });
        result.updated++;
      } else {
        await Product.create({ ...payload, createdBy: userId });
        result.created++;
      }
    } catch (err) {
      result.failed++;
      if (err.code === 11000) {
        result.errors.push(rowError(rowNumber, `Row ${rowNumber}: Duplicate item code "${data.itemCode}".`));
      } else {
        result.errors.push(rowError(rowNumber, `Row ${rowNumber}: ${err.message}`));
      }
    }
  }

  return result;
}

export async function importVendors(rows, userId) {
  const result = { created: 0, updated: 0, failed: 0, errors: [] };

  const vendors = await Vendor.find({
    vendorCode: { $regex: `^${VENDOR_CODE_PREFIX}-\\d+$` },
  })
    .select("vendorCode")
    .lean();

  let maxCode = vendors.reduce((highest, vendor) => {
    const match = String(vendor.vendorCode || "").match(/^VND-(\d+)$/);
    const n = match ? Number(match[1]) : 0;
    return Number.isFinite(n) && n > highest ? n : highest;
  }, 0);

  for (const { rowNumber, data } of rows) {
    try {
      let vendorCode = data.vendorCode?.trim();
      if (!vendorCode) {
        maxCode += 1;
        vendorCode = `${VENDOR_CODE_PREFIX}-${String(maxCode).padStart(3, "0")}`;
      }

      const category = await assertValidCategory("vendor", data.category || "Supplier");

      const payload = {
        vendorCode,
        companyName: data.companyName.trim(),
        contactPerson: data.contactPerson || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        emirate: data.emirate || undefined,
        vatNumber: data.vatNumber || undefined,
        tradeLicenseNumber: data.tradeLicenseNumber || undefined,
        paymentTerms: data.paymentTerms || "Cash",
        category,
        creditLimit: data.creditLimit ?? 0,
        status: data.status || "active",
        notes: data.notes || undefined,
      };

      const existing = await Vendor.findOne({ vendorCode: payload.vendorCode });
      if (existing) {
        await Vendor.updateOne({ _id: existing._id }, { $set: payload });
        result.updated++;
      } else {
        await Vendor.create({ ...payload, createdBy: userId });
        result.created++;
      }
    } catch (err) {
      result.failed++;
      if (err.code === 11000) {
        result.errors.push(
          rowError(rowNumber, `Row ${rowNumber}: Vendor code "${data.vendorCode}" already exists.`)
        );
      } else {
        result.errors.push(rowError(rowNumber, `Row ${rowNumber}: ${err.message}`));
      }
    }
  }

  return result;
}

export async function importCustomers(rows, userId) {
  const result = { created: 0, updated: 0, failed: 0, errors: [] };

  for (const { rowNumber, data } of rows) {
    try {
      const contactPersons = [
        {
          name: data.contactName.trim(),
          phone: data.contactPhone.trim(),
          email: data.contactEmail || undefined,
          isPrimary: true,
          role: "primary",
        },
      ];

      const addresses = [];
      if (data.addressLine1?.trim() && data.city?.trim() && data.emirate) {
        addresses.push({
          type: "office",
          addressLine1: data.addressLine1.trim(),
          city: data.city.trim(),
          emirate: data.emirate,
          country: "UAE",
          isPrimary: true,
        });
      }

      const payload = {
        companyName: data.companyName.trim(),
        displayName: data.companyName.trim(),
        businessType: data.businessType || "Construction Company",
        status: data.status || "prospect",
        customerType: data.customerType || "both",
        paymentTerms: data.paymentTerms || "Cash",
        tradeLicenseNumber: data.tradeLicenseNumber || undefined,
        vatRegistrationNumber: data.vatRegistrationNumber || undefined,
        notes: data.notes || undefined,
        contactPersons,
        addresses,
        primaryEmail: data.contactEmail || undefined,
        primaryPhone: data.contactPhone.trim(),
        createdBy: userId,
      };

      await Customer.create(payload);
      result.created++;
    } catch (err) {
      result.failed++;
      result.errors.push(rowError(rowNumber, `Row ${rowNumber}: ${err.message}`));
    }
  }

  return result;
}

export async function importBankAccounts(rows, userId) {
  const result = { created: 0, updated: 0, failed: 0, errors: [] };

  for (const { rowNumber, data } of rows) {
    try {
      const payload = {
        accountName: data.accountName.trim(),
        bankName: data.bankName.trim(),
        accountNumber: data.accountNumber.trim(),
        iban: data.iban || undefined,
        swiftCode: data.swiftCode || undefined,
        branch: data.branch || undefined,
        currency: data.currency || "AED",
        openingBalance: data.openingBalance ?? 0,
        currentBalance: data.openingBalance ?? 0,
        isPrimary: !!data.isPrimary,
        notes: data.notes || undefined,
      };

      const existing = await BankAccount.findOne({ accountNumber: payload.accountNumber });
      if (existing) {
        await BankAccount.updateOne({ _id: existing._id }, { $set: payload });
        result.updated++;
      } else {
        await BankAccount.create({ ...payload, createdBy: userId });
        result.created++;
      }

      if (payload.isPrimary) {
        await BankAccount.updateMany(
          { accountNumber: { $ne: payload.accountNumber } },
          { $set: { isPrimary: false } }
        );
      }
    } catch (err) {
      result.failed++;
      if (err.code === 11000) {
        result.errors.push(
          rowError(rowNumber, `Row ${rowNumber}: Account number "${data.accountNumber}" already exists.`)
        );
      } else {
        result.errors.push(rowError(rowNumber, `Row ${rowNumber}: ${err.message}`));
      }
    }
  }

  return result;
}

export async function importContactMessages(rows) {
  const result = { created: 0, updated: 0, failed: 0, errors: [] };

  for (const { rowNumber, data } of rows) {
    try {
      await ContactMessage.create({
        type: data.type,
        name: data.name.trim(),
        email: data.email,
        phone: data.phone.trim(),
        company: data.company || undefined,
        projectType: data.projectType || "",
        message: data.message || undefined,
        status: data.status || "new",
        priority: data.priority || "medium",
      });
      result.created++;
    } catch (err) {
      result.failed++;
      result.errors.push(rowError(rowNumber, `Row ${rowNumber}: ${err.message}`));
    }
  }

  return result;
}

const EXECUTORS = {
  products: importProducts,
  vendors: importVendors,
  customers: importCustomers,
  "bank-accounts": importBankAccounts,
  "contact-messages": importContactMessages,
};

export async function executeImport(resource, validatedRows, userId) {
  await connectDB();
  const fn = EXECUTORS[resource];
  if (!fn) throw new Error(`Import not supported for ${resource}`);

  const result = await fn(validatedRows, userId);

  if (userId && (result.created > 0 || result.updated > 0)) {
    logAudit({
      userId,
      action: "import",
      resource,
      summary: `Imported ${result.created} created, ${result.updated} updated (${result.failed} failed)`,
    });
  }

  return result;
}
