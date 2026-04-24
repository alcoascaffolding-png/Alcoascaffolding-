"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
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
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

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
      { name: "Sales Invoices", href: "/sales-invoices", icon: Receipt },
    ],
  },
  {
    label: "Purchases",
    items: [
      { name: "Vendors", href: "/vendors", icon: Truck },
      { name: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
      { name: "Purchase Invoices", href: "/purchase-invoices", icon: ClipboardList },
    ],
  },
  {
    label: "Inventory",
    items: [
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
];

function NavGroup({ group, collapsed, onNavigate }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              onClick={onNavigate}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg mx-auto transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
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
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground transition-colors"
      >
        <span>{group.label}</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
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

export function AppSidebar({ collapsed = false, mobileOpen = false, onNavigate }) {
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
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4 shrink-0", collapsed && "justify-center px-2")}>
        <Link href="/" className="flex items-center gap-2 min-w-0" onClick={onNavigate}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            A
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground truncate text-sm tracking-tight">
              Alcoa Admin
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-4", collapsed ? "px-2" : "px-3")}>
          {navigation.map((group) => (
            <NavGroup key={group.label} group={group} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
