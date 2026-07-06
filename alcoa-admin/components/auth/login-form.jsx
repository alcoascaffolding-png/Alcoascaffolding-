"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandSpinner } from "@/components/loading/loading-kit";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { loginSchema, LOGIN_FIELD_LIMITS } from "@/lib/schemas/login";

const ERROR_MESSAGES = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  Configuration:
    "Cannot connect to database right now. Check MongoDB Atlas network access/IP allowlist, then try again.",
  DatabaseUnavailable:
    "Cannot connect to database right now. Check MongoDB Atlas network access/IP allowlist, then try again.",
  Default: "Sign in failed. Please try again.",
  RateLimited: "Too many sign-in attempts. Please wait and try again later.",
};

/** NextAuth middleware passes a full URL; App Router navigation needs a same-origin path. */
function resolveCallbackPath(callbackUrl) {
  const fallback = "/";
  if (!callbackUrl) return fallback;

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  try {
    const parsed = new URL(callbackUrl, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path || fallback;
  } catch {
    return fallback;
  }
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setAuthError(null);

    const honeypot = document.getElementById("website")?.value;
    if (honeypot?.trim()) {
      await new Promise((r) => setTimeout(r, 800));
      const message = ERROR_MESSAGES.CredentialsSignin;
      setAuthError(message);
      toast.error(message);
      setIsLoading(false);
      return;
    }

    const target = resolveCallbackPath(callbackUrl);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: target,
      });

      if (result?.error) {
        const message = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default;
        setAuthError(message);
        toast.error(message);
        return;
      }

      if (!result?.ok) {
        const message = ERROR_MESSAGES.Default;
        setAuthError(message);
        toast.error(message);
        return;
      }

      toast.success("Signed in successfully");
      window.location.assign(result.url || target);
    } catch (e) {
      const message = e?.message || ERROR_MESSAGES.Default;
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {authError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={LOGIN_FIELD_LIMITS.email}
          placeholder="admin@alcoascaffolding.ae"
          {...register("email")}
          aria-invalid={!!errors.email}
          className="h-11 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700">
          Password
        </Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          maxLength={LOGIN_FIELD_LIMITS.password}
          placeholder="••••••••"
          {...register("password")}
          aria-invalid={!!errors.password}
          className="h-11 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
        />
        {errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading || undefined}
        className="h-11 w-full gap-2 bg-[#1D3A6C] hover:bg-[#152d56] text-white"
      >
        {isLoading ? (
          <>
            <BrandSpinner size="sm" className="mr-0" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}
