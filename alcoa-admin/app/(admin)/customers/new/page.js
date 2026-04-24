import { CustomerForm } from "@/components/domain/customers/CustomerForm";

export const metadata = { title: "New Customer" };

export default function NewCustomerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CustomerForm />
    </div>
  );
}
