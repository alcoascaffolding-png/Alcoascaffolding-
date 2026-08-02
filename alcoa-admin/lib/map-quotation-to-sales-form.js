import { pickStructuredLineItemFields } from "@/lib/sales-line-item-structured";

/** Statuses that must not be offered as a conversion source. */
export const QUOTATION_CONVERSION_EXCLUDED_STATUSES = [
  "converted",
  "converted_to_sales_order",
  "converted_to_invoice",
  "rejected",
  "expired",
  "draft",
  "sent",
  "viewed",
];

/** Only Accepted (and legacy approved) quotations can be converted. */
export const QUOTATION_CONVERTIBLE_STATUSES = ["accepted", "approved"];

export function isQuotationConvertibleStatus(status) {
  return QUOTATION_CONVERTIBLE_STATUSES.includes(String(status || ""));
}

export function getLinkedId(ref) {
  if (ref == null) return null;
  if (typeof ref === "object") return ref._id != null ? String(ref._id) : null;
  return String(ref);
}

/**
 * Quotation line items -> sales order / invoice form rows.
 * Quotations store `ratePerUnit`; sales documents store `unitPrice`.
 */
export function quotationItemsToFormLines(items) {
  return (items || []).map((it) => ({
    description:
      [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
      it.description ||
      it.equipmentType ||
      "Line item",
    productId: it.product ? String(it.product) : "",
    quantity: Number(it.quantity) || 1,
    unit: it.unit || "Nos",
    unitPrice: Number(it.ratePerUnit) || 0,
    ...pickStructuredLineItemFields({
      equipmentType: it.equipmentType,
      specifications: it.specifications,
      size: it.size,
      weight: it.weight,
      cbm: it.cbm,
    }),
  }));
}

/** Customer snapshot + commercial terms carried from a quotation onto a sales document. */
export function quotationToSalesFormPatch(q) {
  return {
    customer: getLinkedId(q?.customer),
    customerName: q?.customerName || "",
    customerAddress: q?.customerAddress || "",
    customerEmail: q?.customerEmail || "",
    customerPhone: q?.customerPhone || "",
    customerTRN: q?.customerTRN || "",
    vatPercentage: Number(q?.vatPercentage ?? 5),
    deliveryCharges: Number(q?.deliveryCharges) || 0,
    installationCharges: Number(q?.installationCharges) || 0,
    pickupCharges: Number(q?.pickupCharges) || 0,
    discount: Number(q?.discount) || 0,
    discountType: q?.discountType || "fixed",
    notes: q?.notes || "",
  };
}

/** Dropdown options for picking a source quotation, keeping the already-linked one visible. */
export function buildQuotationSourceOptions(quotationList, linkedQuotationId) {
  const eligible = (quotationList || []).filter((q) => {
    if (linkedQuotationId && String(q._id) === String(linkedQuotationId)) return true;
    if (QUOTATION_CONVERSION_EXCLUDED_STATUSES.includes(q.status)) return false;
    return isQuotationConvertibleStatus(q.status);
  });
  return [
    { value: "__none__", label: "— None —" },
    ...eligible.map((q) => ({
      value: String(q._id),
      label: `${q.quoteNumber} — ${q.customerName} (${String(q.status || "").replace(/_/g, " ")})`,
    })),
  ];
}
