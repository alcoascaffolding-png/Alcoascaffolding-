import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { STALE_SESSION_PARAM } from "@/lib/auth-constants";
import { AdminShell } from "@/components/layout/AdminShell";
import { Providers } from "@/components/providers";
import { SessionProvider } from "@/components/auth/session-provider";

export default async function AdminLayout({ children }) {
  const session = await auth();

  // The proxy only decodes the cookie; auth() additionally revokes it against the DB.
  // When they disagree the cookie is stale, so flag it for the login page to clear —
  // otherwise the proxy bounces /login straight back here and the two loop forever.
  if (!session?.user) {
    redirect(`/login?${STALE_SESSION_PARAM}=1`);
  }

  return (
    <Providers>
      <SessionProvider session={session}>
        <AdminShell>{children}</AdminShell>
      </SessionProvider>
    </Providers>
  );
}
