import { redirect } from 'next/navigation';

import { renderProductCategoryPage } from '../renderProductCategoryPage';

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ group?: string; subcategory?: string; q?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const selectedCategoryGroupSlug = resolvedSearchParams?.group?.trim() || null;
    const selectedSubcategorySlug = resolvedSearchParams?.subcategory?.trim() || null;

    if (selectedCategoryGroupSlug || selectedSubcategorySlug) {
        const segments = ['/product-category', slug];
        if (selectedCategoryGroupSlug) {
            segments.push(selectedCategoryGroupSlug);
        }
        if (selectedSubcategorySlug) {
            segments.push(selectedSubcategorySlug);
        }

        const cleanPath = segments.join('/');
        const search = resolvedSearchParams?.q?.trim() ? `?q=${encodeURIComponent(resolvedSearchParams.q.trim())}` : '';
        redirect(`${cleanPath}${search}`);
    }

    return renderProductCategoryPage({
        categorySlug: slug,
        searchQuery: resolvedSearchParams?.q?.trim() || null,
    });
}
