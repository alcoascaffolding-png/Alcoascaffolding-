/**
 * Maps a Customer document (as returned from `/api/customers`, lean) onto quotation form fields.
 */

import { COMPANY_BANK_ACCOUNT_NUMBER } from "@/lib/company-bank-details";

/** Normalize quotation `customer` ref (ObjectId string or populated doc) for form select value. */
export function getLinkedCustomerId(customerRef) {
  if (customerRef == null || customerRef === "") return "__none__";
  if (typeof customerRef === "string") {
    const id = customerRef.trim();
    return id || "__none__";
  }
  if (typeof customerRef === "object") {
    if (customerRef._id != null) return String(customerRef._id);
    if (customerRef.id != null) return String(customerRef.id);
  }
  return "__none__";
}

export function getPrimaryContact(customer) {
  if (!customer?.contactPersons?.length) return null;
  return customer.contactPersons.find((p) => p.isPrimary) || customer.contactPersons[0];
}

export function getPrimaryAddress(customer) {
  if (!customer?.addresses?.length) return null;
  return customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
}

/** Multi-line address for quotation PDF / form */
export function formatCustomerAddressLines(addr) {
  if (!addr) return "";
  const line1 = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ");
  const line2 = [addr.area, addr.city, addr.emirate].filter(Boolean).join(", ");
  const line3 = addr.poBox ? `P.O. Box ${addr.poBox}` : "";
  const line4 = addr.country && String(addr.country).trim() && addr.country !== "UAE" ? addr.country : "";
  return [line1, line2, line3, line4].filter(Boolean).join("\n");
}

/** First active bank row from admin bank accounts list (prefers primary / PDF account). */
export function pickDefaultBankAccount(bankItems) {
  if (!bankItems?.length) return null;
  return (
    bankItems.find((b) => b.isPrimary === true) ||
    bankItems.find((b) => String(b.accountNumber) === COMPANY_BANK_ACCOUNT_NUMBER) ||
    bankItems.find((b) => b.isActive !== false) ||
    bankItems[0]
  );
}

export function bankAccountToQuotationBankDetails(b) {
  if (!b) return null;
  return {
    bankName: b.bankName || "",
    accountName: b.accountName || "",
    accountNumber: b.accountNumber || "",
    iban: b.iban || "",
    swiftCode: b.swiftCode || "",
  };
}

/** Match a bank account row to saved quotation bankDetails (account number or IBAN). */
export function findBankAccountIdForDetails(bankItems, bankDetails) {
  if (!bankItems?.length || !bankDetails) return "";
  const num = String(bankDetails.accountNumber || "").trim();
  if (num) {
    const byNum = bankItems.find((b) => String(b.accountNumber || "").trim() === num);
    if (byNum) return String(byNum._id);
  }
  const iban = String(bankDetails.iban || "").replace(/\s+/g, "");
  if (iban) {
    const byIban = bankItems.find(
      (b) => String(b.iban || "").replace(/\s+/g, "") === iban
    );
    if (byIban) return String(byIban._id);
  }
  return "";
}

/**
 * @param {Record<string, unknown>} c - Customer lean document
 * @returns {Record<string, string | undefined>} patch keys matching quotationSchema top-level fields
 */
export function customerSnapshotToQuotationFormPatch(c) {
  if (!c) return {};
  const pc = getPrimaryContact(c);
  const pa = getPrimaryAddress(c);

  const email =
    (c.primaryEmail && String(c.primaryEmail).trim()) ||
    (pc?.email && String(pc.email).trim()) ||
    "";

  const phone =
    (c.primaryPhone && String(c.primaryPhone).trim()) ||
    (c.primaryWhatsApp && String(c.primaryWhatsApp).trim()) ||
    (pc?.phone && String(pc.phone).trim()) ||
    "";

  const patch = {
    customerName: (c.companyName && String(c.companyName).trim()) || "",
    customerEmail: email,
    customerPhone: phone,
    customerTRN: (c.vatRegistrationNumber && String(c.vatRegistrationNumber).trim()) || "",
    contactPersonName: (pc?.name && String(pc.name).trim()) || "",
    customerAddress: formatCustomerAddressLines(pa),
  };

  if (c.paymentTerms) {
    patch.paymentTerms = String(c.paymentTerms).trim();
  }

  const ct = c.customerType;
  if (ct === "rental" || ct === "sales" || ct === "both") {
    patch.quoteType = ct;
  }

  return patch;
}

/** True if all main bank fields are blank */
export function isQuotationBankDetailsEmpty(bd) {
  if (!bd) return true;
  return (
    !String(bd.bankName || "").trim() &&
    !String(bd.accountName || "").trim() &&
    !String(bd.accountNumber || "").trim() &&
    !String(bd.iban || "").trim() &&
    !String(bd.swiftCode || "").trim()
  );
}
