/**
 * Map quotation line items and surcharges into sales order / invoice line items
 * so converted documents preserve quote totals (delivery, installation, pickup, discount).
 */

export function quotationItemsToOrderItems(items) {
  return (items || []).map((it) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.ratePerUnit) || 0;
    const lineSub = Number(it.subtotal ?? qty * rate);
    const desc =
      [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
      it.description ||
      "Line item";
    return {
      description: desc,
      equipmentType: it.equipmentType || undefined,
      specifications: it.specifications || undefined,
      size: it.size || undefined,
      weight: it.weight != null ? Number(it.weight) : undefined,
      cbm: it.cbm != null ? Number(it.cbm) : undefined,
      quantity: qty,
      unit: it.unit || "Nos",
      unitPrice: rate,
      total: lineSub,
    };
  });
}

/** Extra taxable lines from quotation surcharges (before document VAT). */
export function quotationSurchargeOrderLines(quotation) {
  const lines = [];
  const addCharge = (description, amount) => {
    const n = Number(amount) || 0;
    if (n <= 0) return;
    lines.push({
      description,
      quantity: 1,
      unit: "Job",
      unitPrice: n,
      total: n,
    });
  };

  addCharge("Delivery Charges", quotation.deliveryCharges);
  addCharge("Installation Charges", quotation.installationCharges);
  addCharge("Pickup Charges", quotation.pickupCharges);

  const discount = Number(quotation.discount) || 0;
  if (discount > 0) {
    const lineSubtotal = Number(quotation.subtotal) || 0;
    const discountValue =
      quotation.discountType === "percentage"
        ? (lineSubtotal * discount) / 100
        : discount;
    if (discountValue > 0) {
      lines.push({
        description:
          quotation.discountType === "percentage"
            ? `Discount (${discount}%)`
            : "Discount",
        quantity: 1,
        unit: "Job",
        unitPrice: -discountValue,
        total: -discountValue,
      });
    }
  }

  return lines;
}

/**
 * Build order line items + totals from a quotation snapshot.
 * Uses stored quotation VAT and total when present so PDF totals match.
 */
export function buildSalesOrderPayloadFromQuotation(q) {
  const items = [
    ...quotationItemsToOrderItems(q.items),
    ...quotationSurchargeOrderLines(q),
  ];
  const lineSubtotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
  const vatAmount =
    q.vatAmount != null && q.vatAmount !== ""
      ? Number(q.vatAmount)
      : Math.round((lineSubtotal * Number(q.vatPercentage || 5)) / 100 * 100) / 100;
  const total =
    q.totalAmount != null && q.totalAmount !== ""
      ? Number(q.totalAmount)
      : lineSubtotal + vatAmount;

  return { items, subtotal: lineSubtotal, vatAmount, total };
}
