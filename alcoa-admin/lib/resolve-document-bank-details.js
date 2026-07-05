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

/** Fetch the primary / PDF-default bank account from the database (live). */
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

/** Live primary bank details — used as the global default across all modules/PDFs. */
export async function resolvePrimaryBankDetails() {
  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const primary = await fetchPrimaryBankAccount(BankAccount);
  if (primary) {
    const mapped = bankDetailsFromSnapshot(bankAccountToQuotationBankDetails(primary));
    if (mapped) return mapped;
  }
  return { ...COMPANY_BANK_DETAILS };
}

async function resolveBankAccountById(BankAccount, accountId) {
  if (!accountId) return null;
  const linked = await BankAccount.findById(accountId).lean();
  if (!linked || linked.isActive === false) return null;
  return bankDetailsFromSnapshot(bankAccountToQuotationBankDetails(linked));
}

/**
 * Resolve bank details for any sales document (quotation, SO, SI, etc.).
 *
 * Priority:
 * 1. Explicit bankAccount on the document (user picked in quotation form)
 * 2. Explicit bankAccount on linked quotation (for SO/SI)
 * 3. Live primary bank account from Bank Accounts (updates reflect everywhere)
 * 4. Static company fallback
 */
export async function resolveDocumentBankDetails(doc) {
  if (!doc) return resolvePrimaryBankDetails();

  await connectDB();
  const { default: BankAccount } = await import("@/models/BankAccount");
  const { default: Quotation } = await import("@/models/Quotation");
  const { default: SalesOrder } = await import("@/models/SalesOrder");

  const directId = bankAccountIdFromDoc(doc);
  if (directId) {
    const fromDirect = await resolveBankAccountById(BankAccount, directId);
    if (fromDirect) return fromDirect;
  }

  let quotationId = doc?.quotation?._id || doc?.quotation;
  if (!quotationId && doc?.salesOrder) {
    const soId = doc.salesOrder?._id || doc.salesOrder;
    const order = await SalesOrder.findById(soId).select("quotation").lean();
    quotationId = order?.quotation;
  }

  if (quotationId) {
    const q = await Quotation.findById(quotationId).select("bankAccount").lean();
    const qBankId = bankAccountIdFromDoc(q);
    if (qBankId) {
      const fromQuote = await resolveBankAccountById(BankAccount, qBankId);
      if (fromQuote) return fromQuote;
    }
  }

  return resolvePrimaryBankDetails();
}

/** Attach resolvedBankDetails + pdfBankDetails for API responses and PDF generation. */
export async function enrichDocumentWithBankDetails(doc) {
  const resolvedBankDetails = await resolveDocumentBankDetails(doc);
  return { ...doc, resolvedBankDetails, pdfBankDetails: resolvedBankDetails };
}

/** @deprecated Use resolveDocumentBankDetails */
export async function resolveQuotationBankDetailsForPdf(quotation) {
  return resolveDocumentBankDetails(quotation);
}

/** Detail pages — prefer API-enriched resolvedBankDetails. */
export function displayBankDetailsFromDocument(doc) {
  if (doc?.resolvedBankDetails) return { ...doc.resolvedBankDetails };
  return { ...COMPANY_BANK_DETAILS };
}
