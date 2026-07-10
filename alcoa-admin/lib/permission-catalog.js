/**
 * Permission catalog for admin panel modules.
 * Keys: `{resource}:{action}` — read | write | delete
 */

export const PERMISSION_ACTIONS = ["read", "write", "delete"];

export const PERMISSION_MODULES = [
  { id: "dashboard", label: "Dashboard", group: "Overview", actions: ["read"] },
  { id: "contact-messages", label: "Contact Messages", group: "Leads", actions: ["read", "write", "delete"] },
  { id: "customers", label: "Customers", group: "Leads", actions: ["read", "write", "delete"] },
  { id: "quotations", label: "Quotations", group: "Sales", actions: ["read", "write", "delete"] },
  { id: "sales-orders", label: "Sales Orders", group: "Sales", actions: ["read", "write", "delete"] },
  { id: "sales-invoices", label: "Tax Invoices", group: "Sales", actions: ["read", "write", "delete"] },
  { id: "delivery-notes", label: "Delivery Notes", group: "Sales", actions: ["read", "write", "delete"] },
  { id: "vendors", label: "Vendors", group: "Purchases", actions: ["read", "write", "delete"] },
  { id: "purchase-orders", label: "Purchase Orders", group: "Purchases", actions: ["read", "write", "delete"] },
  { id: "purchase-invoices", label: "Purchase Invoices", group: "Purchases", actions: ["read", "write", "delete"] },
  { id: "products", label: "Products", group: "Inventory", actions: ["read", "write", "delete"] },
  { id: "stock-adjustments", label: "Stock Adjustments", group: "Inventory", actions: ["read", "write", "delete"] },
  { id: "bank-accounts", label: "Bank Accounts", group: "Accounts", actions: ["read", "write", "delete"] },
  { id: "receipts", label: "Receipts", group: "Accounts", actions: ["read", "write", "delete"] },
  { id: "payments", label: "Payments", group: "Accounts", actions: ["read", "write", "delete"] },
  { id: "users", label: "Users", group: "Settings", actions: ["read", "write", "delete"] },
  { id: "audit-log", label: "Audit Log", group: "Settings", actions: ["read"] },
];

/** Map nav href → permission resource id */
export const PATH_TO_RESOURCE = {
  "/": "dashboard",
  "/contact-messages": "contact-messages",
  "/customers": "customers",
  "/quotations": "quotations",
  "/sales-orders": "sales-orders",
  "/sales-invoices": "sales-invoices",
  "/delivery-notes": "delivery-notes",
  "/vendors": "vendors",
  "/vendors/categories": "vendors",
  "/purchase-orders": "purchase-orders",
  "/purchase-invoices": "purchase-invoices",
  "/products": "products",
  "/products/categories": "products",
  "/stock-adjustments": "stock-adjustments",
  "/bank-accounts": "bank-accounts",
  "/receipts": "receipts",
  "/payments": "payments",
  "/users": "users",
  "/audit-log": "audit-log",
};

export function permissionKey(resource, action) {
  return `${resource}:${action}`;
}

const VALID_KEYS = new Set(
  PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permissionKey(m.id, a)))
);

export function isValidPermissionKey(key) {
  return VALID_KEYS.has(String(key));
}

export function sanitizePermissionList(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map((p) => String(p).trim()).filter(isValidPermissionKey))];
}

export function resourceFromPathname(pathname) {
  if (!pathname) return null;
  const exact = PATH_TO_RESOURCE[pathname];
  if (exact) return exact;
  for (const [prefix, resource] of Object.entries(PATH_TO_RESOURCE)) {
    if (prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return resource;
    }
  }
  return null;
}

export const PERMISSION_ACTION_LABELS = {
  read: "View",
  write: "Create / Edit",
  delete: "Delete",
};
