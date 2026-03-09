import CatalogListingPage from '@/components/catalog/CatalogListingPage';
import { fetchPayloadCatalogCategories } from '@/lib/payload-categories';
import { fetchPayloadProducts } from '@/lib/payload-products';

type ShopPageProps = {
    searchParams?: Promise<{ q?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const [products, categoryItems] = await Promise.all([
        fetchPayloadProducts(),
        fetchPayloadCatalogCategories(),
    ]);

    return (
        <CatalogListingPage
            title="Obchod"
            breadcrumbs={[{ label: 'Obchod' }]}
            products={products}
            categoryItems={categoryItems}
            searchQuery={resolvedSearchParams?.q?.trim() || null}
        />
    );
}
