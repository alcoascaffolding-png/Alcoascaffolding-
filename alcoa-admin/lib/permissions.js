/**
 * Role + per-user permission resolution for the admin panel.
 */

import {
  PERMISSION_MODULES,
  permissionKey,
  resourceFromPathname,
  sanitizePermissionList,
} from "@/lib/permission-catalog";

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

/** Nav href prefixes allowed per role (used to derive default read access). */
export const ROLE_NAV_ACCESS = {
  super_admin: null,
  admin: null,
  manager: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes", "/products"],
  accountant: ["/", "/customers", "/sales-invoices", "/receipts", "/payments", "/bank-accounts", "/purchase-invoices", "/vendors"],
  sales: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes"],
  inventory: ["/", "/products", "/stock-adjustments", "/purchase-orders", "/vendors"],
  viewer: ["/", "/contact-messages", "/customers", "/quotations", "/sales-orders", "/sales-invoices", "/delivery-notes", "/products", "/vendors", "/purchase-orders", "/purchase-invoices", "/stock-adjustments", "/bank-accounts", "/receipts", "/payments"],
};

const ALL_RESOURCE_IDS = PERMISSION_MODULES.map((m) => m.id);

/** @typedef {{ role?: string, permissions?: string[], useCustomPermissions?: boolean }} PermissionSubject */

export function normalizePermissionSubject(userOrRole) {
  if (typeof userOrRole === "string") {
    return { role: userOrRole, permissions: [], useCustomPermissions: false };
  }
  return {
    role: userOrRole?.role ?? "viewer",
    permissions: Array.isArray(userOrRole?.permissions) ? userOrRole.permissions : [],
    useCustomPermissions: !!userOrRole?.useCustomPermissions,
  };
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

function roleCanWriteLegacy(role, resource) {
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

function roleCanDeleteLegacy(role) {
  return ["super_admin", "admin", "manager"].includes(role);
}

/** Default permission keys granted by role (when custom permissions are off). */
export function getRoleDefaultPermissions(role) {
  const perms = new Set([permissionKey("dashboard", "read")]);

  if (isAdminRole(role)) {
    for (const mod of PERMISSION_MODULES) {
      for (const action of mod.actions) {
        perms.add(permissionKey(mod.id, action));
      }
    }
    return [...perms];
  }

  const paths = ROLE_NAV_ACCESS[role] ?? [];
  for (const path of paths) {
    const resource = resourceFromPathname(path);
    if (resource) perms.add(permissionKey(resource, "read"));
  }

  for (const resource of ALL_RESOURCE_IDS) {
    if (roleCanWriteLegacy(role, resource)) {
      perms.add(permissionKey(resource, "read"));
      perms.add(permissionKey(resource, "write"));
    }
  }

  if (roleCanDeleteLegacy(role)) {
    for (const resource of ALL_RESOURCE_IDS) {
      if (roleCanWriteLegacy(role, resource)) {
        perms.add(permissionKey(resource, "delete"));
      }
    }
  }

  if (canManageUsers(role)) {
    perms.add(permissionKey("users", "read"));
    perms.add(permissionKey("users", "write"));
    perms.add(permissionKey("users", "delete"));
    perms.add(permissionKey("audit-log", "read"));
  }

  return [...perms];
}

export function resolveEffectivePermissions(userOrRole) {
  const subject = normalizePermissionSubject(userOrRole);
  if (isAdminRole(subject.role)) {
    return new Set(getRoleDefaultPermissions(subject.role));
  }
  if (subject.useCustomPermissions) {
    return new Set(sanitizePermissionList(subject.permissions));
  }
  return new Set(getRoleDefaultPermissions(subject.role));
}

export function hasPermission(userOrRole, resource, action = "read") {
  const subject = normalizePermissionSubject(userOrRole);
  if (isAdminRole(subject.role)) return true;
  const perms = resolveEffectivePermissions(subject);
  return perms.has(permissionKey(resource, action));
}

export function canManageUsers(userOrRole) {
  const subject = normalizePermissionSubject(userOrRole);
  if (isAdminRole(subject.role)) return true;
  if (subject.useCustomPermissions) {
    return hasPermission(subject, "users", "write");
  }
  return false;
}

export function canDeleteDocuments(userOrRole, resource) {
  const subject = normalizePermissionSubject(userOrRole);
  if (isAdminRole(subject.role)) return true;
  if (resource) return hasPermission(subject, resource, "delete");
  return ALL_RESOURCE_IDS.some((id) => hasPermission(subject, id, "delete"));
}

export function canWriteResource(userOrRole, resource) {
  const subject = normalizePermissionSubject(userOrRole);
  if (resource === "users") return canManageUsers(subject);
  return hasPermission(subject, resource, "write");
}

export function canReadResource(userOrRole, resource) {
  return hasPermission(userOrRole, resource, "read");
}

export function canAccessNavPath(userOrRole, pathname) {
  const subject = normalizePermissionSubject(userOrRole);
  if (!subject.role) return false;

  if (pathname === "/users" || pathname.startsWith("/users/")) {
    return canManageUsers(subject) || hasPermission(subject, "users", "read");
  }
  if (pathname === "/audit-log" || pathname.startsWith("/audit-log/")) {
    return hasPermission(subject, "audit-log", "read");
  }

  const resource = resourceFromPathname(pathname);
  if (!resource) return isAdminRole(subject.role);
  return hasPermission(subject, resource, "read");
}

export { PERMISSION_MODULES, permissionKey, sanitizePermissionList } from "@/lib/permission-catalog";
export { PERMISSION_ACTION_LABELS } from "@/lib/permission-catalog";
