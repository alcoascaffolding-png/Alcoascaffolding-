"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCog,
  FileText,
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
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessNavPath, canManageUsers } from "@/lib/permissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SIDEBAR_GROUPS_KEY = "alcoa-sidebar-groups";

function readGroupOpenState(groupLabel) {
  try {
    const raw = localStorage.getItem(SIDEBAR_GROUPS_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    return parsed[groupLabel] !== false;
  } catch {
    return true;
  }
}

function persistGroupOpenState(groupLabel, open) {
  try {
    const raw = localStorage.getItem(SIDEBAR_GROUPS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[groupLabel] = open;
    localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(parsed));
  } catch {
    // ignore storage errors
  }
}

const navItemClass = (isActive) =>
  cn(
    "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );

const navItemCollapsedClass = (isActive) =>
  cn(
    "flex h-9 w-9 items-center justify-center rounded-lg mx-auto transition-colors",
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );

const navigation = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
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
      { name: "Vendors", href: "/vendors", icon: Truck },
      { name: "Vendor Categories", href: "/vendors/categories", icon: Tags },
      { name: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
      { name: "Purchase Invoices", href: "/purchase-invoices", icon: ClipboardList },
    ],
  },
  {
    label: "Inventory",
    items: [
      { name: "Products", href: "/products", icon: Package },
      { name: "Product Categories", href: "/products/categories", icon: Tags },
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
  {
    label: "Settings",
    items: [
      { name: "Users", href: "/users", icon: UserCog, adminOnly: true },
      { name: "Audit Log", href: "/audit-log", icon: ScrollText, adminOnly: true },
    ],
  },
];

function NavGroup({ group, collapsed, onNavigate, user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => readGroupOpenState(group.label));

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      persistGroupOpenState(group.label, next);
      return next;
    });
  }

  const visibleItems = group.items.filter((item) => {
    if (item.adminOnly && !canManageUsers(user)) return false;
    return canAccessNavPath(user, item.href);
  });

  function isNavItemActive(item) {
    if (pathname === item.href) return true;
    if (item.href === "/") return false;

    const childActive = visibleItems.some(
      (other) =>
        other.href !== item.href &&
        other.href.startsWith(`${item.href}/`) &&
        (pathname === other.href || pathname.startsWith(`${other.href}/`))
    );
    if (childActive) return false;

    return pathname.startsWith(`${item.href}/`);
  }

  if (collapsed) {
    return (
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              onClick={onNavigate}
              className={navItemCollapsedClass(isActive)}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground transition-colors"
      >
        <span>{group.label}</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={navItemClass(isActive)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AppSidebar({ collapsed = false, mobileOpen = false, onNavigate, onCloseMobile }) {
  const { data: session } = useSession();
  const user = session?.user;
  const effectiveCollapsed = mobileOpen ? false : collapsed;

  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly && !canManageUsers(user)) return false;
        return canAccessNavPath(user, item.href);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar z-50 shadow-sm md:shadow-none",
        "transition-[transform,width] duration-300 ease-out",
        "fixed inset-y-0 left-0 md:relative md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-[60px]" : "md:w-[240px]",
        "w-[min(280px,85vw)]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0",
          effectiveCollapsed ? "justify-center px-2" : "justify-between gap-2"
        )}
      >
        <Link
          href="/"
          className={cn("flex items-center gap-2 min-w-0", effectiveCollapsed && "justify-center")}
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            A
          </div>
          {!effectiveCollapsed && (
            <span className="font-semibold text-foreground truncate text-sm tracking-tight">
              Alcoa Admin
            </span>
          )}
        </Link>
        {mobileOpen && onCloseMobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 md:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-4", effectiveCollapsed ? "px-2" : "px-3")}>
          {visibleNavigation.map((group) => (
            <NavGroup
              key={group.label}
              group={group}
              collapsed={effectiveCollapsed}
              onNavigate={onNavigate}
              user={user}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
