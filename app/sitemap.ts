import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { fetchPayloadArticles } from '@/lib/payload-articles';
import { fetchPayloadCatalogCategories } from '@/lib/payload-categories';
import { fetchPayloadProducts } from '@/lib/payload-products';
import { getSiteUrl, toAbsoluteSiteUrl } from '@/lib/site-url';
import type { CatalogCategoryNavItem } from '@/types/site';

const SITEMAP_REVALIDATE_SECONDS = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

type StaticRouteDefinition = {
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
};

const STATIC_ROUTES: StaticRouteDefinition[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/shop', changeFrequency: 'daily', priority: 0.95 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/o-nas', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/kontakt', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/doprava-a-platba', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/reklamace-a-vraceni', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/obchodni-podminky', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/ochrana-osobnich-udaju', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.2 },
];

const flattenCategoryEntries = (
    categories: CatalogCategoryNavItem[],
    lastModified: Date,
    siteUrl: string,
): SitemapEntry[] => {
    const entries: SitemapEntry[] = [];

    for (const category of categories) {
        entries.push({
            url: toAbsoluteSiteUrl(category.href, siteUrl),
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.85,
        });

        for (const group of category.children ?? []) {
            entries.push({
                url: toAbsoluteSiteUrl(group.href, siteUrl),
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.75,
            });

            for (const subcategory of group.children ?? []) {
                entries.push({
                    url: toAbsoluteSiteUrl(subcategory.href, siteUrl),
                    lastModified,
                    changeFrequency: 'weekly',
                    priority: 0.65,
                });
            }
        }
    }

    return entries;
};

const dedupeEntries = (entries: SitemapEntry[]) => {
    const uniqueEntries = new Map<string, SitemapEntry>();

    for (const entry of entries) {
        uniqueEntries.set(entry.url, entry);
    }

    return Array.from(uniqueEntries.values());
};

const getCachedSitemapEntries = unstable_cache(
    async (siteUrl: string): Promise<MetadataRoute.Sitemap> => {
        const [products, categories, articles] = await Promise.all([
            fetchPayloadProducts(),
            fetchPayloadCatalogCategories(),
            fetchPayloadArticles(),
        ]);

        const lastModified = new Date();

        const staticEntries = STATIC_ROUTES.map<SitemapEntry>((route) => ({
            url: toAbsoluteSiteUrl(route.path, siteUrl),
            lastModified,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        }));

        const productEntries = products.map<SitemapEntry>((product) => ({
            url: toAbsoluteSiteUrl(`/product/${product.slug}`, siteUrl),
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        const articleEntries = articles.map<SitemapEntry>((article) => ({
            url: toAbsoluteSiteUrl(`/blog/${article.slug}`, siteUrl),
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.6,
        }));

        return dedupeEntries([
            ...staticEntries,
            ...flattenCategoryEntries(categories, lastModified, siteUrl),
            ...productEntries,
            ...articleEntries,
        ]);
    },
    ['sitemap-entries'],
    { revalidate: SITEMAP_REVALIDATE_SECONDS },
);

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return getCachedSitemapEntries(getSiteUrl());
}
