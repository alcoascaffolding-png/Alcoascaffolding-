/**
 * Parallel global search across key list APIs (read-only).
 * Each source is optional — skipped when the user lacks read permission.
 */

const SEARCH_SOURCES = [
  {
    id: "customers",
    label: "Customers",
    resource: "customers",
    buildUrl: (q) => `/api/customers?search=${encodeURIComponent(q)}&limit=5`,
    mapItem: (row) => ({
      id: String(row._id),
      title: row.companyName || row.name || "Customer",
      subtitle: row.email || row.phone || "",
      href: `/customers/${row._id}`,
    }),
  },
  {
    id: "products",
    label: "Products",
    resource: "products",
    buildUrl: (q) => `/api/products?search=${encodeURIComponent(q)}&limit=5`,
    mapItem: (row) => ({
      id: String(row._id),
      title: row.name || row.itemCode,
      subtitle: row.itemCode ? `${row.itemCode} · ${row.currentStock ?? 0} in stock` : "",
      href: `/products/${row._id}`,
    }),
  },
  {
    id: "quotations",
    label: "Quotations",
    resource: "quotations",
    buildUrl: (q) => `/api/quotations?search=${encodeURIComponent(q)}&limit=5`,
    mapItem: (row) => ({
      id: String(row._id),
      title: row.quoteNumber || "Quotation",
      subtitle: row.customerName || "",
      href: `/quotations/${row._id}`,
    }),
  },
  {
    id: "sales-orders",
    label: "Sales Orders",
    resource: "sales-orders",
    buildUrl: (q) => `/api/sales-orders?search=${encodeURIComponent(q)}&limit=5`,
    mapItem: (row) => ({
      id: String(row._id),
      title: row.orderNumber || "Sales order",
      subtitle: row.customerName || "",
      href: `/sales-orders/${row._id}`,
    }),
  },
  {
    id: "sales-invoices",
    label: "Tax Invoices",
    resource: "sales-invoices",
    buildUrl: (q) => `/api/sales-invoices?search=${encodeURIComponent(q)}&limit=5`,
    mapItem: (row) => ({
      id: String(row._id),
      title: row.invoiceNumber || "Invoice",
      subtitle: row.customerName || "",
      href: `/sales-invoices/${row._id}`,
    }),
  },
];

/**
 * @param {string} query
 * @param {(resource: string) => boolean} canRead
 * @returns {Promise<{ id: string; label: string; items: { id: string; title: string; subtitle?: string; href: string }[] }[]>}
 */
export async function searchAdminRecords(query, canRead) {
  const term = String(query || "").trim();
  if (term.length < 2) return [];

  const allowed = SEARCH_SOURCES.filter((s) => canRead(s.resource));
  if (!allowed.length) return [];

  const results = await Promise.all(
    allowed.map(async (source) => {
      try {
        const res = await fetch(source.buildUrl(term));
        const data = await res.json();
        if (!data.success) return { id: source.id, label: source.label, items: [] };
        const items = (data.data?.items || []).map(source.mapItem);
        return { id: source.id, label: source.label, items };
      } catch {
        return { id: source.id, label: source.label, items: [] };
      }
    })
  );

  return results.filter((group) => group.items.length > 0);
}
