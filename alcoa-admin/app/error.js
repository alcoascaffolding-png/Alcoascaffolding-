"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <h1 className="text-4xl font-bold text-destructive">Error</h1>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">{error?.message || "An unexpected error occurred."}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
