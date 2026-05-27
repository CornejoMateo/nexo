import ProductsPageClient from "./products-page-client";

type ProductsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const category = searchParams?.category;
  const initialCategory = Array.isArray(category) ? category[0] : category;

  return <ProductsPageClient initialCategory={initialCategory} />;
}
