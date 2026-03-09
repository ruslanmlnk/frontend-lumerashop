import CatalogListingPage from '@/components/catalog/CatalogListingPage';
import { notFound } from 'next/navigation';
import {
    fetchPayloadCatalogCategories,
    findCatalogCategoryBySlug,
    findCatalogSubcategoryBySlug,
} from '@/lib/payload-categories';
import { fetchPayloadProducts } from '@/lib/payload-products';

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ subcategory?: string; q?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const selectedSubcategorySlug = resolvedSearchParams?.subcategory?.trim() || null;

    const [products, categoryItems] = await Promise.all([
        fetchPayloadProducts(),
        fetchPayloadCatalogCategories(),
    ]);

    const category = findCatalogCategoryBySlug(categoryItems, slug);
    if (!category) {
        notFound();
    }

    const subcategory = findCatalogSubcategoryBySlug(categoryItems, slug, selectedSubcategorySlug);
    const title = subcategory?.name ?? category.name;

    return (
        <CatalogListingPage
            title={title}
            breadcrumbs={[
                { label: 'Obchod', href: '/shop' },
                { label: category.name, href: subcategory ? category.href : undefined },
                ...(subcategory ? [{ label: subcategory.name }] : []),
            ]}
            products={products}
            categoryItems={categoryItems}
            initialCategorySlug={slug}
            initialSubcategorySlug={subcategory?.slug ?? null}
            searchQuery={resolvedSearchParams?.q?.trim() || null}
        />
    );
}
