/**
 * Official company bank details — printed on quotation / invoice PDFs
 * and used as the default primary bank account in the admin module.
 */
export const COMPANY_BANK_DETAILS = {
  accountName: "Alcoa aluminium scaffolding L.L.C - S.P.C",
  bankName: "ADCB, Musaffah branch, Abu Dhabi",
  accountNumber: "14262375920001",
  iban: "AE42 0030 0142 6237 5920 001",
  swiftCode: "ADCBAEAA",
  branch: "Musaffah",
  currency: "AED",
};

/** @deprecated Use COMPANY_BANK_DETAILS — kept for existing imports */
export const QUOTATION_PDF_BANK_DETAILS = COMPANY_BANK_DETAILS;

export const COMPANY_BANK_ACCOUNT_NUMBER = COMPANY_BANK_DETAILS.accountNumber;

/** Default values for the Bank Accounts add form */
export function companyBankAccountFormDefaults() {
  return {
    accountName: COMPANY_BANK_DETAILS.accountName,
    bankName: COMPANY_BANK_DETAILS.bankName,
    accountNumber: COMPANY_BANK_DETAILS.accountNumber,
    iban: COMPANY_BANK_DETAILS.iban,
    swiftCode: COMPANY_BANK_DETAILS.swiftCode,
    branch: COMPANY_BANK_DETAILS.branch,
    currency: COMPANY_BANK_DETAILS.currency,
  };
}

/** Document for seed / upsert into BankAccount collection */
export function companyBankAccountSeedDoc(overrides = {}) {
  return {
    ...COMPANY_BANK_DETAILS,
    openingBalance: 0,
    currentBalance: 0,
    isActive: true,
    isPrimary: true,
    notes: "Primary company account (matches quotation PDF)",
    ...overrides,
  };
}
