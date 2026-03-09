import type { Product } from '@/types/site';

export const getProductPurchaseCount = (product: Product): number => {
    const value = typeof product.purchaseCount === 'number' ? product.purchaseCount : Number(product.purchaseCount);
    return Number.isFinite(value) && value > 0 ? value : 0;
};

const getPopularityScore = (product: Product): number => {
    let score = getProductPurchaseCount(product) * 100;

    if (product.isFeatured) score += 10;
    if (product.isRecommended) score += 5;

    return score;
};

export const compareProductsByPopularity = (a: Product, b: Product): number =>
    getPopularityScore(b) - getPopularityScore(a);

export const sortProductsByPopularity = (products: Product[]): Product[] =>
    [...products].sort(compareProductsByPopularity);
