"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Loader2 } from "lucide-react";

/**
 * Convert ▾ dropdown for document detail toolbars.
 * items: { key, label, icon?, disabled?, done?, onSelect }
 */
export function DocumentConvertMenu({
  items = [],
  triggerLabel = "Convert",
  menuLabel = "Create from this document",
  loading = false,
  disabled = false,
  title,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={disabled || loading}
          title={title}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {triggerLabel}
          <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuLabel ? (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {menuLabel}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.key}
              disabled={!!item.disabled || loading}
              className="cursor-pointer gap-2"
              onSelect={() => {
                if (!item.disabled && item.onSelect) item.onSelect();
              }}
            >
              {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
              <span className="flex-1">{item.label}</span>
              {item.done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
