"use client";

import { Button } from "@/components/ui/button";
import { BrandSpinner } from "@/components/loading/loading-kit";
import { cn } from "@/lib/utils";

/**
 * Submit/action button with spinner, dynamic pending label, and disabled state.
 *
 * @param {string} idleLabel - Label when not loading
 * @param {string} pendingLabel - Label while loading (e.g. "Saving…")
 * @param {boolean} loading
 */
export function AsyncButton({
  idleLabel,
  pendingLabel,
  loading = false,
  children,
  className,
  spinnerSize = "sm",
  ...props
}) {
  const label = loading ? (pendingLabel ?? idleLabel) : (children ?? idleLabel);

  return (
    <Button
      disabled={loading || props.disabled}
      className={cn(className)}
      {...props}
    >
      {loading && <BrandSpinner size={spinnerSize} className="mr-2" />}
      {label}
    </Button>
  );
}
