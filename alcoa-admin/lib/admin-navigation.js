import {
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCog,
  FileText,
  // FileSignature,
  ShoppingCart,
  Receipt,
  Package,
  Truck,
  ClipboardList,
  Landmark,
  CreditCard,
  Wallet,
  BarChart3,
  Tags,
  ScrollText,
  Plus,
} from "lucide-react";

/** Sidebar + command palette navigation (grouped). */
export const ADMIN_NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Leads",
    items: [
      { name: "Contact Messages", href: "/contact-messages", icon: MessageSquare },
      { name: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Quotations", href: "/quotations", icon: FileText },
      { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { name: "Tax Invoices", href: "/sales-invoices", icon: Receipt },
      { name: "Delivery Notes", href: "/delivery-notes", icon: Truck },
    ],
  },
  {
    label: "Purchases",
    items: [
      { name: "Vendor Categories", href: "/vendors/categories", icon: Tags },
      { name: "Vendors", href: "/vendors", icon: Truck },
      { name: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
      { name: "Purchase Invoices", href: "/purchase-invoices", icon: ClipboardList },
    ],
  },
  {
    label: "Inventory",
    items: [
      { name: "Product Categories", href: "/products/categories", icon: Tags },
      { name: "Products", href: "/products", icon: Package },
      { name: "Stock Adjustments", href: "/stock-adjustments", icon: BarChart3 },
    ],
  },
  {
    label: "Accounts",
    items: [
      { name: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
      { name: "Receipts", href: "/receipts", icon: CreditCard },
      { name: "Payments", href: "/payments", icon: Wallet },
    ],
  },
  // {
  //   label: "Documents",
  //   items: [{ name: "Letterhead", href: "/letterhead", icon: FileSignature }],
  // },
  {
    label: "Settings",
    items: [
      { name: "Users", href: "/users", icon: UserCog, adminOnly: true },
      { name: "Audit Log", href: "/audit-log", icon: ScrollText, adminOnly: true },
    ],
  },
];

/**
 * Quick-create shortcuts (command palette). `resource` gates write permission.
 */
export const COMMAND_QUICK_ACTIONS = [
  {
    name: "New quotation",
    href: "/quotations/new",
    icon: Plus,
    resource: "quotations",
    keywords: ["create", "quote", "sales"],
  },
  {
    name: "New customer",
    href: "/customers/new",
    icon: Plus,
    resource: "customers",
    keywords: ["create", "client"],
  },
  {
    name: "New sales order",
    href: "/sales-orders/new",
    icon: Plus,
    resource: "sales-orders",
    keywords: ["create", "order"],
  },
  {
    name: "New tax invoice",
    href: "/sales-invoices/new",
    icon: Plus,
    resource: "sales-invoices",
    keywords: ["create", "invoice"],
  },
  {
    name: "New delivery note",
    href: "/delivery-notes/new",
    icon: Plus,
    resource: "delivery-notes",
    keywords: ["create", "delivery"],
  },
  {
    name: "Low stock products",
    href: "/products?stock=low",
    icon: Package,
    resource: "products",
    keywords: ["inventory", "alert"],
  },
  {
    name: "Overdue invoices",
    href: "/sales-invoices?paymentStatus=overdue",
    icon: Receipt,
    resource: "sales-invoices",
    keywords: ["unpaid", "finance"],
  },
];

/** Flat list of all nav pages for search indexing. */
export function flattenNavItems(groups = ADMIN_NAV_GROUPS) {
  return groups.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.label }))
  );
}
