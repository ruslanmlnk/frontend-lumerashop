import { renderProductCategoryPage } from '../../../renderProductCategoryPage';

type SubcategoryPageProps = {
    params: Promise<{ slug: string; groupSlug: string; subcategorySlug: string }>;
    searchParams?: Promise<{ q?: string }>;
};

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
    const { slug, groupSlug, subcategorySlug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;

    return renderProductCategoryPage({
        categorySlug: slug,
        categoryGroupSlug: groupSlug,
        subcategorySlug,
        searchQuery: resolvedSearchParams?.q?.trim() || null,
    });
}
