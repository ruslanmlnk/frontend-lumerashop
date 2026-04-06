import CatalogListingPage from '@/components/catalog/CatalogListingPage';
import {
    fetchPayloadCatalogCategories,
    findCatalogCategoryBySlug,
    findCatalogCategoryGroupBySlug,
    findCatalogSubcategoryBySlug,
} from '@/lib/payload-categories';
import { fetchPayloadProducts } from '@/lib/payload-products';
import { notFound } from 'next/navigation';

type RenderProductCategoryPageArgs = {
    categorySlug: string;
    categoryGroupSlug?: string | null;
    subcategorySlug?: string | null;
    searchQuery?: string | null;
};

export async function renderProductCategoryPage({
    categorySlug,
    categoryGroupSlug = null,
    subcategorySlug = null,
    searchQuery = null,
}: RenderProductCategoryPageArgs) {
    const [products, categoryItems] = await Promise.all([
        fetchPayloadProducts(),
        fetchPayloadCatalogCategories(),
    ]);

    const category = findCatalogCategoryBySlug(categoryItems, categorySlug);
    if (!category) {
        notFound();
    }

    const categoryGroup = findCatalogCategoryGroupBySlug(categoryItems, categorySlug, categoryGroupSlug);
    if (categoryGroupSlug && !categoryGroup) {
        notFound();
    }

    const subcategory = findCatalogSubcategoryBySlug(
        categoryItems,
        categorySlug,
        categoryGroup?.slug ?? categoryGroupSlug,
        subcategorySlug,
    );
    if (subcategorySlug && !subcategory) {
        notFound();
    }

    const title = subcategory?.name ?? categoryGroup?.name ?? category.name;

    return (
        <CatalogListingPage
            title={title}
            breadcrumbs={[
                {
                    label: category.name,
                    href: categoryGroup || subcategory ? category.href : undefined,
                },
                ...(categoryGroup
                    ? [
                          {
                              label: categoryGroup.name,
                              href: subcategory ? categoryGroup.href : undefined,
                          },
                      ]
                    : []),
                ...(subcategory ? [{ label: subcategory.name }] : []),
            ]}
            products={products}
            categoryItems={categoryItems}
            initialCategorySlug={categorySlug}
            initialCategoryGroupSlug={categoryGroup?.slug ?? null}
            initialSubcategorySlug={subcategory?.slug ?? null}
            searchQuery={searchQuery}
        />
    );
}
