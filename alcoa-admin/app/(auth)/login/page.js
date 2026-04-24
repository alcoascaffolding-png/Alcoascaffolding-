import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Providers>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
              A
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Alcoa Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access the admin panel
            </p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Providers>
  );
}
