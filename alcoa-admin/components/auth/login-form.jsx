"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LOGIN_FIELD_LIMITS } from "@/lib/schemas/login";

const ERROR_MESSAGES = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  Configuration:
    "Cannot connect to database right now. Check MongoDB Atlas network access/IP allowlist, then try again.",
  Default: "Sign in failed. Please try again.",
  RateLimited: "Too many sign-in attempts. Please wait and try again later.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setAuthError(null);

    const honeypot = document.getElementById("website")?.value;
    if (honeypot?.trim()) {
      await new Promise((r) => setTimeout(r, 800));
      setAuthError(ERROR_MESSAGES.CredentialsSignin);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setAuthError(ERROR_MESSAGES.Default);
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

      {/* Honeypot — hidden from users, bots often fill this */}
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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            maxLength={LOGIN_FIELD_LIMITS.password}
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
            className="h-11 border-slate-200 bg-slate-50/50 pr-10 focus-visible:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full gap-2 bg-[#1D3A6C] hover:bg-[#152d56] text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <InlineSkeleton />
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
