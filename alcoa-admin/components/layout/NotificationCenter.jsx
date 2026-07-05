"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, AlertTriangle, AlertCircle, Info, Package, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BrandSpinner } from "@/components/loading/loading-kit";
import { toast } from "sonner";

const TYPE_ICON = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TYPE_COLOR = {
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-primary",
};

async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to load notifications");
  const data = await res.json();
  return data.data;
}

async function patchNotifications(body) {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export function NotificationCenter() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 2 * 60 * 1000,
  });

  const dismissMut = useMutation({
    mutationFn: patchNotifications,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e) => toast.error(e.message),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;

  function handleClick(n) {
    if (!n.read) {
      dismissMut.mutate({ action: "read", ids: [n.id] });
    }
    if (n.href) router.push(n.href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {unreadCount} alert{unreadCount === 1 ? "" : "s"}
              </span>
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={dismissMut.isPending}
              onClick={() => dismissMut.mutate({ action: "dismiss_all" })}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[min(420px,60vh)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <BrandSpinner size="sm" />
              Loading alerts…
            </div>
          ) : isError ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Could not load notifications
            </p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Package className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
            </div>
          ) : (
            notifications.slice(0, 12).map((n) => {
              const Icon = TYPE_ICON[n.type] || Info;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-muted/30"
                  )}
                  onClick={() => handleClick(n)}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", TYPE_COLOR[n.type])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    {n.description ? (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                    ) : null}
                    {n.createdAt ? (
                      <p className="text-[10px] text-muted-foreground/80 mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
        {unreadCount > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="flex flex-wrap gap-3 px-4 py-2">
              <Link href="/products?stock=critical" className="text-xs text-primary hover:underline">
                View inventory alerts
              </Link>
              <Link href="/purchase-orders?from=low-stock" className="text-xs text-primary hover:underline">
                Create replenishment PO
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
