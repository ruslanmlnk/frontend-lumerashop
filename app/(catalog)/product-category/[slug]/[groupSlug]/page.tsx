import { redirect } from 'next/navigation';

import { renderProductCategoryPage } from '../../renderProductCategoryPage';

type CategoryGroupPageProps = {
    params: Promise<{ slug: string; groupSlug: string }>;
    searchParams?: Promise<{ subcategory?: string; q?: string }>;
};

export default async function CategoryGroupPage({ params, searchParams }: CategoryGroupPageProps) {
    const { slug, groupSlug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const selectedSubcategorySlug = resolvedSearchParams?.subcategory?.trim() || null;

    if (selectedSubcategorySlug) {
        const search = resolvedSearchParams?.q?.trim() ? `?q=${encodeURIComponent(resolvedSearchParams.q.trim())}` : '';
        redirect(`/product-category/${slug}/${groupSlug}/${selectedSubcategorySlug}${search}`);
    }

    return renderProductCategoryPage({
        categorySlug: slug,
        categoryGroupSlug: groupSlug,
        searchQuery: resolvedSearchParams?.q?.trim() || null,
    });
}
