import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactMessagesClient } from "@/components/domain/contact-messages/ContactMessagesClient";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = { title: "Contact Messages" };

export default function ContactMessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description="Customer inquiries and quote requests"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ContactMessagesClient />
      </Suspense>
    </div>
  );
}
