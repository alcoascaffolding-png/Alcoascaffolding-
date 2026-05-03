import { Suspense } from "react";
import { ContactMessagesClient } from "@/components/domain/contact-messages/ContactMessagesClient";
import { RouteLoadingView } from "@/components/loading/loading-kit";

export const metadata = { title: "Contact Messages" };

export default function ContactMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">Customer inquiries and quote requests</p>
        </div>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ContactMessagesClient />
      </Suspense>
    </div>
  );
}
