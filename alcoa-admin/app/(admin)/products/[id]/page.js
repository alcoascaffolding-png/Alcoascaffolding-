import { ProductDetail } from "@/components/domain/products/ProductDetail";

export const metadata = { title: "Product" };

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
