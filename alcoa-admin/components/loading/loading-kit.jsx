"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AdminRouteSkeleton,
  AuthRouteSkeleton,
  PageBlockSkeleton,
  DetailRecordSkeleton,
  DashboardChartSkeleton,
} from "@/components/loading/skeleton-kit";

/** Spinner sizes — buttons, icon slots, save overlay accent (kept small / fast feedback). */
const SPINNER_SIZE = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function BrandSpinner({ size = "md", className }) {
  return (
    <Loader2
      className={cn("animate-spin text-primary shrink-0", SPINNER_SIZE[size], className)}
      aria-hidden
    />
  );
}

/**
 * Route / RSC segment loading — skeleton layouts (admin, auth, embedded list).
 */
export function RouteLoadingView({ variant = "admin" }) {
  if (variant === "auth") return <AuthRouteSkeleton />;
  if (variant === "embedded") return <PageBlockSkeleton />;
  return <AdminRouteSkeleton />;
}

/** Detail pages while the main record query is loading */
export function DetailPageLoading({ className }) {
  return <DetailRecordSkeleton className={className} />;
}

/**
 * Chart-sized panel skeleton (keeps `CompactLoading` import sites working).
 */
export function CompactLoading({ className }) {
  return <DashboardChartSkeleton className={className} />;
}

/**
 * Full-screen save overlay — skeleton pulse + readable status text.
 */
export function BlockingSaveOverlay({ title, description }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex min-w-[280px] max-w-sm flex-col items-center gap-4 rounded-xl border border-border/80 bg-card px-10 py-8 shadow-lg">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 pt-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-2 w-4/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export {
  PageBlockSkeleton,
  AdminRouteSkeleton,
  AuthRouteSkeleton,
  DetailRecordSkeleton,
  FormEditSkeleton,
  QuotationFormEditSkeleton,
  DashboardStatCardsSkeleton,
  DashboardChartSkeleton,
  DashboardActivityListSkeleton,
  InlineSkeleton,
} from "@/components/loading/skeleton-kit";
