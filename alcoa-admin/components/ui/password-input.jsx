"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordVisibilityToggle({ show, onToggle, disabled, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/** Standalone password input (e.g. login form with react-hook-form register). */
export const PasswordInput = forwardRef(function PasswordInput(
  { className, disabled, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-10", className)}
        {...props}
      />
      <PasswordVisibilityToggle
        show={showPassword}
        disabled={disabled}
        onToggle={() => setShowPassword((visible) => !visible)}
      />
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
