import { PublicQuotationView } from "@/components/domain/quotations/PublicQuotationView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quotation",
  robots: { index: false, follow: false },
};

export default async function PublicQuotationPage({ params, searchParams }) {
  const { token } = await params;
  const sp = (await searchParams) || {};
  const initialAction = sp.action === "accept" || sp.action === "reject" ? sp.action : null;
  return <PublicQuotationView token={token} initialAction={initialAction} />;
}
