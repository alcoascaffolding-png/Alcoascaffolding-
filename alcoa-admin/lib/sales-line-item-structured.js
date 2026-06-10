/** Optional quotation-style fields carried on SO / invoice line items for PDF rendering. */
export function pickStructuredLineItemFields(item) {
  if (!item) return {};
  const out = {};
  if (item.equipmentType) out.equipmentType = item.equipmentType;
  if (item.specifications) out.specifications = item.specifications;
  if (item.size) out.size = item.size;
  if (item.weight != null && item.weight !== "") out.weight = Number(item.weight);
  if (item.cbm != null && item.cbm !== "") out.cbm = Number(item.cbm);
  return out;
}

export function mapExistingLineItemToForm(it) {
  return {
    description: it.description || "",
    quantity: it.quantity,
    unit: it.unit || "Nos",
    unitPrice: it.unitPrice,
    ...pickStructuredLineItemFields(it),
  };
}

export function buildLineItemSavePayload(item) {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.unitPrice) || 0;
  return {
    description: item.description,
    quantity: qty,
    unit: item.unit || "Nos",
    unitPrice: rate,
    total: qty * rate,
    ...pickStructuredLineItemFields(item),
  };
}
