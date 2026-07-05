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

/** Bank block for detail pages from saved quotation fields. */
export function displayBankDetailsFromDocument(doc) {
  return bankDetailsFromSnapshot(doc?.bankDetails) || { ...COMPANY_BANK_DETAILS };
}

/**
 * Resolve bank details for PDF: quotation snapshot → primary BankAccount → company default.
 */
export async function resolveQuotationBankDetailsForPdf(quotation) {
  const fromDoc = bankDetailsFromSnapshot(quotation?.bankDetails);
  if (fromDoc) return fromDoc;

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");

  const primary =
    (await BankAccount.findOne({ isPrimary: true, isActive: { $ne: false } }).lean()) ||
    (await BankAccount.findOne({
      accountNumber: COMPANY_BANK_ACCOUNT_NUMBER,
      isActive: { $ne: false },
    }).lean()) ||
    (await BankAccount.findOne({ isActive: { $ne: false } })
      .sort({ createdAt: 1 })
      .lean());

  if (primary) {
    const mapped = bankDetailsFromSnapshot(bankAccountToQuotationBankDetails(primary));
    if (mapped) return mapped;
  }

  return { ...COMPANY_BANK_DETAILS };
}
