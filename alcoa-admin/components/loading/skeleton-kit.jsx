"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Default block for Suspense / main list area */
export function PageBlockSkeleton({ className }) {
  return <Skeleton className={cn("h-96 w-full rounded-lg", className)} role="status" aria-busy="true" />;
}

/** Icon-sized pulse for buttons, toolbar chips, and inline actions */
export function InlineSkeleton({ className }) {
  return <Skeleton className={cn("h-4 w-4 shrink-0 rounded-full", className)} aria-hidden />;
}

/** Full admin segment (route `loading.js`) */
export function AdminRouteSkeleton() {
  return (
    <div className="space-y-6 py-4" role="status" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-[90%]" />
        <Skeleton className="h-4 w-80 max-w-[70%]" />
      </div>
      <Skeleton className="min-h-[50vh] w-full rounded-xl" />
    </div>
  );
}

/** Auth layout route + login Suspense */
export function AuthRouteSkeleton() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-12"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="mt-4 h-52 w-full max-w-md rounded-xl" />
    </div>
  );
}

/** Customer / quotation detail while fetching */
export function DetailRecordSkeleton({ className }) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 max-w-[min(100%,24rem)]" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[72%]" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

/** Edit customer / quotation — form shell */
export function FormEditSkeleton({ className }) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 max-w-[min(100%,20rem)]" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-10 md:col-span-2" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10 md:col-span-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </CardContent>
      </Card>
      <Skeleton className="h-24 rounded-lg" />
    </div>
  );
}

/** Quotation form has extra line-items block */
export function QuotationFormEditSkeleton({ className }) {
  return (
    <div className={cn("space-y-6", className)} role="status" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-10 md:col-span-2" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </CardContent>
      </Card>
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

export function DashboardStatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" role="status" aria-busy="true">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

export function DashboardChartSkeleton({ className }) {
  return <Skeleton className={cn("h-48 w-full rounded-lg", className)} role="status" aria-busy="true" />;
}

export function DashboardActivityListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}
