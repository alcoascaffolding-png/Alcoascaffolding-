"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BrandSpinner } from "@/components/loading/loading-kit";
import { cn } from "@/lib/utils";

/**
 * Action button — locks synchronously at click time (not pointer-down).
 * Disabling before the click event fires cancels the click in browsers.
 */
export function AsyncButton({
  idleLabel,
  pendingLabel,
  loading = false,
  children,
  className,
  spinnerSize = "sm",
  onClick,
  disabled,
  type = "button",
  ...props
}) {
  const lockRef = useRef(false);
  const [localBusy, setLocalBusy] = useState(false);
  const isSubmit = type === "submit";

  const handleClick = useCallback(
    async (e) => {
      if (isSubmit) return;

      if (loading || disabled || lockRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      lockRef.current = true;
      setLocalBusy(true);

      try {
        const result = onClick?.(e);
        if (result && typeof result.then === "function") {
          await result;
        }
      } finally {
        lockRef.current = false;
        setLocalBusy(false);
      }
    },
    [isSubmit, onClick, loading, disabled]
  );

  const isBusy = loading || localBusy;
  const label = isBusy ? (pendingLabel ?? idleLabel) : (children ?? idleLabel);

  return (
    <Button
      type={type}
      {...props}
      disabled={isBusy || disabled}
      aria-busy={isBusy || undefined}
      className={cn(className)}
      onClick={isSubmit ? onClick : handleClick}
    >
      {isBusy && <BrandSpinner size={spinnerSize} className="mr-2" />}
      {label}
    </Button>
  );
}
