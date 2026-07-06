"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessNavPath, canManageUsers } from "@/lib/permissions";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const SIDEBAR_GROUPS_KEY = "alcoa-sidebar-groups";

function readGroupOpenState(groupLabel) {
  if (typeof window === "undefined") return true;
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

const navigation = ADMIN_NAV_GROUPS;

function NavGroup({ group, collapsed, onNavigate, user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(readGroupOpenState(group.label));
  }, [group.label]);

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
