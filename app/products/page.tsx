import ProductsPageClient from "./products-page-client";

type ProductsPageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const category = resolvedSearchParams?.category;
  const initialCategory = Array.isArray(category) ? category[0] : category;

  return <ProductsPageClient initialCategory={initialCategory} />;
}
