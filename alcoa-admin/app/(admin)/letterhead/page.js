import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { LetterheadClient } from "@/components/domain/documents/LetterheadClient";

export const metadata = { title: "Letterhead" };

export default function LetterheadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Letterhead"
        description="Blank A4 letterhead with the company header and footer — for offer letters, undertakings, and other official documents."
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <LetterheadClient />
      </Suspense>
    </div>
  );
}
