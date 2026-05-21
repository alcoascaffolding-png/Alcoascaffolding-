/** Company bank details — same as quotation PDF. */
export const QUOTATION_PDF_BANK_DETAILS = {
  accountName: "Alcoa aluminium scaffolding L.L.C - S.P.C",
  bankName: "ADCB, Musaffah branch, Abu Dhabi",
  accountNumber: "14262375920001",
  iban: "AE42 0030 0142 6237 5920 001",
};

/** Line total including VAT (matches PDF amount column). */
export function itemAmountWithVat(item, defaultVatPct = 5) {
  const taxable = Number(item.taxableAmount ?? item.subtotal ?? 0);
  const vat = Number(item.vatAmount ?? 0);
  if (vat > 0) return taxable + vat;
  const pct = Number(item.vatPercentage ?? defaultVatPct ?? 5);
  return taxable * (1 + pct / 100);
}

export function quotationDisplaySubtotal(quotation) {
  const {
    subtotal = 0,
    deliveryCharges = 0,
    installationCharges = 0,
    pickupCharges = 0,
    discount = 0,
    discountType = "fixed",
  } = quotation;
  const discountValue =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const beforeVAT =
    subtotal +
    Number(deliveryCharges || 0) +
    Number(installationCharges || 0) +
    Number(pickupCharges || 0) -
    Number(discountValue || 0);
  return Math.max(0, beforeVAT);
}
