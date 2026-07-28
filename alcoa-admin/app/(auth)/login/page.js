import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/auth/brand-logo";
import { Providers } from "@/components/providers";
import { SessionProvider } from "@/components/auth/session-provider";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <Providers forcedTheme="light">
      <SessionProvider>
        <div className="login-surface min-h-screen grid lg:grid-cols-2">
        {/* Left — brand */}
        <div className="relative hidden lg:flex flex-col items-center justify-center bg-primary px-12 py-16 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <div className="rounded-2xl bg-white px-8 py-6 shadow-2xl shadow-black/20">
              <BrandLogo variant="desktop" priority />
            </div>
            <p className="mt-10 text-lg font-medium text-white/95 tracking-wide">
              Administration Portal
            </p>
            <p className="mt-2 text-sm text-white/70 max-w-xs leading-relaxed">
              Secure access for quotations, sales, inventory, and accounts management.
            </p>
          </div>
        </div>

        {/* Right — sign in */}
        <div className="relative flex min-h-screen flex-col bg-white">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
            <div className="w-full max-w-[400px] space-y-8">
              <div className="flex justify-center lg:hidden">
                <BrandLogo variant="mobile" priority />
              </div>

              <div className="space-y-1 text-center lg:text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
                  Sign in
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your credentials to access the admin panel
                </p>
              </div>

              <Suspense fallback={<RouteLoadingView variant="auth" />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-100 px-6 py-5 text-center">
            <p className="text-xs text-slate-400">
              © {year} Alcoa Aluminium Scaffolding L.L.C
            </p>
          </footer>
        </div>
        </div>
      </SessionProvider>
    </Providers>
  );
}
