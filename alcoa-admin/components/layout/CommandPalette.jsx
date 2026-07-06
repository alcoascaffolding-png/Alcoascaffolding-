"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ADMIN_NAV_GROUPS,
  COMMAND_QUICK_ACTIONS,
  flattenNavItems,
} from "@/lib/admin-navigation";
import {
  canAccessNavPath,
  canManageUsers,
  canReadResource,
  canWriteResource,
} from "@/lib/permissions";
import { searchAdminRecords } from "@/lib/command-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Global command palette — navigation, quick actions, and record search (Ctrl/Cmd+K).
 */
export function CommandPalette({ open, onOpenChange }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [searchGroups, setSearchGroups] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent));
  }, []);

  const canRead = useCallback((resource) => canReadResource(user, resource), [user]);
  const canWrite = useCallback((resource) => canWriteResource(user, resource), [user]);

  const navItems = flattenNavItems(ADMIN_NAV_GROUPS).filter((item) => {
    if (item.adminOnly && !canManageUsers(user)) return false;
    return canAccessNavPath(user, item.href);
  });

  const quickActions = COMMAND_QUICK_ACTIONS.filter((action) => canWrite(action.resource));

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchGroups([]);
      setSearching(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || debouncedQuery.trim().length < 2) {
      setSearchGroups([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    searchAdminRecords(debouncedQuery, canRead).then((groups) => {
      if (!cancelled) {
        setSearchGroups(groups);
        setSearching(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, canRead]);

  function go(href) {
    onOpenChange(false);
    router.push(href);
  }

  const showRecordSearch = debouncedQuery.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, records, or actions…"
        value={query}
        onValueChange={setQuery}
        aria-label="Search admin panel"
      />
      <CommandList>
        <CommandEmpty>
          {searching
            ? "Searching records…"
            : showRecordSearch
              ? "No records found."
              : "No results found."}
        </CommandEmpty>

        {quickActions.length > 0 && !showRecordSearch && (
          <CommandGroup heading="Quick actions">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <CommandItem
                  key={action.href}
                  value={[action.name, ...(action.keywords || [])].join(" ")}
                  onSelect={() => go(action.href)}
                >
                  <Icon className="text-muted-foreground" aria-hidden />
                  <span>{action.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {!showRecordSearch && quickActions.length > 0 && navItems.length > 0 && (
          <CommandSeparator />
        )}

        {!showRecordSearch &&
          ADMIN_NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => {
              if (item.adminOnly && !canManageUsers(user)) return false;
              return canAccessNavPath(user, item.href);
            });
            if (!items.length) return null;

            return (
              <CommandGroup key={group.label} heading={group.label}>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href}
                      value={`${item.name} ${group.label} ${item.href}`}
                      onSelect={() => go(item.href)}
                    >
                      <Icon className="text-muted-foreground" aria-hidden />
                      <span>{item.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}

        {showRecordSearch &&
          !searching &&
          searchGroups.map((group) => (
            <CommandGroup key={group.id} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={`${group.id}-${item.id}`}
                  value={`${group.label} ${item.title} ${item.subtitle || ""}`}
                  onSelect={() => go(item.href)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.subtitle ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
      </CommandList>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/80 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CommandShortcut>{isMac ? "⌘" : "Ctrl+"}K</CommandShortcut>
          <span>open</span>
        </span>
        <span>↑↓ navigate</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </CommandDialog>
  );
}

const CommandPaletteContext = createContext(null);

/** Registers Ctrl/Cmd+K and provides open state to the topbar trigger. */
export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return {
    ...ctx,
    toggle: () => ctx.setOpen((v) => !v),
  };
}
