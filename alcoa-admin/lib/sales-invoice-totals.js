export function normalizeSalesInvoiceItems(items = []) {
  return (items || [])
    .map((it) => {
      const qty = Math.max(Number(it.quantity) || 0, 0.01);
      const rate = Number(it.unitPrice ?? it.ratePerUnit) || 0;
      const total = Number(it.total ?? it.subtotal ?? qty * rate);
      return {
        product: it.product || undefined,
        description: it.description || it.equipmentType || "Line item",
        equipmentType: it.equipmentType || it.description || undefined,
        specifications: it.specifications || undefined,
        size: it.size || undefined,
        weight: it.weight != null ? Number(it.weight) : undefined,
        cbm: it.cbm != null ? Number(it.cbm) : undefined,
        quantity: qty,
        unit: it.unit || "Nos",
        unitPrice: rate,
        total: total > 0 ? total : qty * rate,
      };
    })
    .filter((it) => it.total > 0);
}

export function computeSalesInvoiceTotals({ items = [], vatAmount = 0, paidAmount = 0 }) {
  const normalizedItems = normalizeSalesInvoiceItems(items);
  const subtotal = normalizedItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const vat = Number(vatAmount) || 0;
  const total = subtotal + vat;
  const paid = Math.max(0, Number(paidAmount) || 0);
  const balance = Math.max(0, total - paid);
  return {
    items: normalizedItems,
    subtotal,
    vatAmount: vat,
    total,
    paidAmount: paid,
    balance,
  };
}

export function paymentStatusFromAmounts({ total = 0, paidAmount = 0, balance }) {
  const paid = Number(paidAmount) || 0;
  const due = balance != null ? Number(balance) : Math.max(0, Number(total || 0) - paid);
  if (Number(total || 0) <= 0) return "unpaid";
  if (due <= 0.0001) return "paid";
  if (paid > 0) return "partially_paid";
  return "unpaid";
}
