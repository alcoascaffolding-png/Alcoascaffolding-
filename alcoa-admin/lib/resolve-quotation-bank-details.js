import { connectDB } from "@/lib/db";
import {
  COMPANY_BANK_DETAILS,
  COMPANY_BANK_ACCOUNT_NUMBER,
} from "@/lib/company-bank-details";
import { bankAccountToQuotationBankDetails } from "@/lib/map-customer-to-quotation";

/** Normalize bank snapshot object for PDF / UI display. */
export function bankDetailsFromSnapshot(bankDetails) {
  if (!bankDetails || typeof bankDetails !== "object") return null;

  const accountName = String(bankDetails.accountName || "").trim();
  const bankName = String(bankDetails.bankName || "").trim();
  const accountNumber = String(bankDetails.accountNumber || "").trim();
  const iban = String(bankDetails.iban || "").trim();
  const swiftCode = String(bankDetails.swiftCode || "").trim();
  const branch = String(bankDetails.branch || "").trim();

  if (!accountName && !bankName && !accountNumber && !iban) return null;

  return { accountName, bankName, accountNumber, iban, swiftCode, branch };
}

function bankAccountIdFromDoc(doc) {
  const raw = doc?.bankAccount;
  if (!raw) return null;
  if (typeof raw === "object" && raw._id) return String(raw._id);
  return String(raw);
}

/** Fetch the primary / PDF-default bank account from the database. */
export async function fetchPrimaryBankAccount(BankAccount) {
  return (
    (await BankAccount.findOne({ isPrimary: true, isActive: { $ne: false } }).lean()) ||
    (await BankAccount.findOne({
      accountNumber: COMPANY_BANK_ACCOUNT_NUMBER,
      isActive: { $ne: false },
    }).lean()) ||
    (await BankAccount.findOne({ isActive: { $ne: false } })
      .sort({ createdAt: 1 })
      .lean())
  );
}

/**
 * Resolve bank details for quotation display & PDF:
 * 1. Explicit bankAccount on quotation (user picked in form)
 * 2. Primary bank account from Bank Accounts module (live data)
 * 3. Legacy bankDetails snapshot
 * 4. Company default constant
 */
export async function resolveQuotationBankDetailsForPdf(quotation) {
  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");

  const linkedId = bankAccountIdFromDoc(quotation);
  if (linkedId) {
    const linked = await BankAccount.findById(linkedId).lean();
    if (linked && linked.isActive !== false) {
      const mapped = bankDetailsFromSnapshot(bankAccountToQuotationBankDetails(linked));
      if (mapped) return mapped;
    }
  }

  const primary = await fetchPrimaryBankAccount(BankAccount);
  if (primary) {
    const mapped = bankDetailsFromSnapshot(bankAccountToQuotationBankDetails(primary));
    if (mapped) return mapped;
  }

  const fromDoc = bankDetailsFromSnapshot(quotation?.bankDetails);
  if (fromDoc) return fromDoc;

  return { ...COMPANY_BANK_DETAILS };
}

/** Sync helper for detail pages when API already attached resolvedBankDetails. */
export function displayBankDetailsFromDocument(doc) {
  if (doc?.resolvedBankDetails) return { ...doc.resolvedBankDetails };
  return bankDetailsFromSnapshot(doc?.bankDetails) || { ...COMPANY_BANK_DETAILS };
}
