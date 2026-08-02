"use client";

import { Loader2 } from "lucide-react";
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
 * Compact full-screen save overlay — spinner + short status (no bulky card chrome).
 */
export function BlockingSaveOverlay({ title, description }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/95 px-4 py-3 shadow-md animate-in fade-in zoom-in-95 duration-150">
        <BrandSpinner size="sm" className="text-primary" />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
              {description}
            </p>
          ) : null}
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
