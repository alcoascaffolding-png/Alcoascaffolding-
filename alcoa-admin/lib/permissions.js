/** Role-based access for admin panel modules. */

export const ADMIN_ROLES = ["super_admin", "admin"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  accountant: "Accountant",
  sales: "Sales",
  inventory: "Inventory",
  viewer: "Viewer",
};

/** Nav href prefixes allowed per role (admin roles see all). */
export const ROLE_NAV_ACCESS = {
  super_admin: null,
  admin: null,
  manager: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes", "/products"],
  accountant: ["/", "/customers", "/sales-invoices", "/receipts", "/payments", "/bank-accounts", "/purchase-invoices", "/vendors"],
  sales: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes"],
  inventory: ["/", "/products", "/stock-adjustments", "/purchase-orders", "/vendors"],
  viewer: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes", "/products", "/vendors", "/purchase-orders", "/purchase-invoices", "/stock-adjustments", "/bank-accounts", "/receipts", "/payments"],
};

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function canManageUsers(role) {
  return isAdminRole(role);
}

export function canDeleteDocuments(role) {
  return ["super_admin", "admin", "manager"].includes(role);
}

export function canWriteResource(role, resource) {
  if (isAdminRole(role)) return true;
  if (role === "viewer") return false;
  if (role === "accountant") {
    return ["receipts", "payments", "bank-accounts", "sales-invoices", "purchase-invoices", "vendors", "customers"].includes(resource);
  }
  if (role === "inventory") {
    return ["products", "stock-adjustments", "purchase-orders", "vendors", "delivery-notes"].includes(resource);
  }
  if (role === "sales") {
    return ["quotations", "sales-orders", "sales-invoices", "delivery-notes", "customers", "contact-messages"].includes(resource);
  }
  if (role === "manager") return true;
  return false;
}

export function canAccessNavPath(role, pathname) {
  if (!role) return false;
  const allowed = ROLE_NAV_ACCESS[role];
  if (allowed == null) return true;
  if (pathname === "/users" || pathname === "/audit-log") return canManageUsers(role);
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
