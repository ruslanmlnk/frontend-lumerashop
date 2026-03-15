import { NextRequest, NextResponse } from 'next/server';
import { fetchPayloadProducts } from '@/lib/payload-products';
import { matchesProductSearch } from '@/lib/product-search';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');
    const recommended = searchParams.get('recommended');
    const category = searchParams.get('category');
    const categoryGroup = searchParams.get('group');
    const subcategory = searchParams.get('subcategory');
    const query = searchParams.get('q');
    const products = await fetchPayloadProducts({ includeDetails: Boolean(slug) });

    let result = products;

    if (slug) {
        result = result.filter((product) => product.slug === slug);
    }

    if (featured === '1' || featured === 'true') {
        result = result.filter((product) => product.isFeatured);
    }

    if (recommended === '1' || recommended === 'true') {
        result = result.filter((product) => product.isRecommended);
    }

    if (category) {
        result = result.filter((product) => product.category === category);
    }

    if (categoryGroup) {
        result = result.filter((product) => product.categoryGroupSlug === categoryGroup);
    }

    if (subcategory) {
        result = result.filter((product) => product.subcategorySlugs?.includes(subcategory));
    }

    if (query) {
        result = result.filter((product) => matchesProductSearch(product, query));
    }

    return NextResponse.json({ products: result });
}
