/**
 * Map a Product catalogue record to quotation line-item form fields.
 * @param {object} product
 * @param {"rental"|"sales"|"service"|"both"|string} quoteType
 */
export function mapProductToQuotationLine(product, quoteType = "rental") {
  if (!product) return null;

  const useSalePrice = quoteType === "sales";
  const rate = useSalePrice
    ? Number(product.sellingPrice) || 0
    : Number(product.rentalPrice) || Number(product.sellingPrice) || 0;

  return {
    productId: String(product._id),
    equipmentType: product.name || "",
    equipmentCode: product.itemCode || "",
    description: product.description || "",
    specifications: product.specifications || product.dimensions || "",
    unit: product.unit || "Nos",
    ratePerUnit: rate,
    quantity: 1,
    currentStock: Number(product.currentStock) ?? 0,
  };
}

export function isStockInsufficient(line, quantity) {
  const stock = Number(line?.currentStock);
  const qty = Number(quantity);
  if (Number.isNaN(stock) || stock <= 0) return false;
  return qty > stock;
}

/** Map product to sales order / invoice line form fields. */
export function mapProductToSalesLine(product, pricingMode = "rental") {
  if (!product) return null;

  const useSalePrice = pricingMode === "sales";
  const rate = useSalePrice
    ? Number(product.sellingPrice) || 0
    : Number(product.rentalPrice) || Number(product.sellingPrice) || 0;

  const name = product.name || "";
  return {
    productId: String(product._id),
    equipmentType: name,
    description: product.description ? `${name} — ${product.description}` : name,
    unit: product.unit || "Nos",
    unitPrice: rate,
    quantity: 1,
    currentStock: Number(product.currentStock) ?? 0,
  };
}
