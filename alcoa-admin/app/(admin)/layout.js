import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Providers } from "@/components/providers";
import { SessionProvider } from "@/components/auth/session-provider";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Providers>
      <SessionProvider session={session}>
        <AdminShell>{children}</AdminShell>
      </SessionProvider>
    </Providers>
  );
}
