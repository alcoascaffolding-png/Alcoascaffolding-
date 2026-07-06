/** Human-readable labels for admin routes (breadcrumb / topbar). */
export const NAV_LABELS = {
  "/": "Dashboard",
  "/contact-messages": "Contact Messages",
  "/customers": "Customers",
  "/quotations": "Quotations",
  "/sales-orders": "Sales Orders",
  "/sales-invoices": "Tax Invoices",
  "/delivery-notes": "Delivery Notes",
  "/vendors": "Vendors",
  "/vendors/categories": "Vendor Categories",
  "/purchase-orders": "Purchase Orders",
  "/purchase-invoices": "Purchase Invoices",
  "/products": "Products",
  "/products/categories": "Product Categories",
  "/stock-adjustments": "Stock Adjustments",
  "/bank-accounts": "Bank Accounts",
  "/receipts": "Receipts",
  "/payments": "Payments",
  "/users": "Users",
  "/audit-log": "Audit Log",
  "/categories": "Categories",
};

const SEGMENT_LABELS = {
  new: "New",
  edit: "Edit",
  categories: "Categories",
};

/**
 * Resolve breadcrumb segments from pathname.
 * @returns {{ label: string; href?: string }[]}
 */
export function getBreadcrumbs(pathname) {
  if (!pathname || pathname === "/") {
    return [{ label: "Dashboard" }];
  }

  const exact = NAV_LABELS[pathname];
  if (exact) {
    const parent = pathname.includes("/") ? pathname.split("/").slice(0, -1).join("/") || "/" : null;
    if (parent && parent !== "/" && NAV_LABELS[parent]) {
      return [
        { label: NAV_LABELS[parent], href: parent },
        { label: exact },
      ];
    }
    return [{ label: "Dashboard", href: "/" }, { label: exact }];
  }

  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Dashboard", href: "/" }];

  let path = "";
  for (let i = 0; i < parts.length; i++) {
    path += `/${parts[i]}`;
    const label =
      NAV_LABELS[path] ||
      SEGMENT_LABELS[parts[i]] ||
      (parts[i].length === 24 ? "Details" : parts[i].replace(/-/g, " "));
    const isLast = i === parts.length - 1;
    crumbs.push(isLast ? { label } : { label, href: path });
  }

  return crumbs;
}

export function getPageTitle(pathname) {
  const crumbs = getBreadcrumbs(pathname);
  return crumbs[crumbs.length - 1]?.label || "Dashboard";
}
