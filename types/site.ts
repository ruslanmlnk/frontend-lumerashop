export interface ProductFilterValue {
    group: string;
    option: string;
    groupSlug?: string;
    optionSlug?: string;
}

export interface CatalogFilterReference {
    id: string;
    name: string;
    slug: string;
}

export interface ProductVariant {
    id: string;
    image: string;
    slug: string;
    name: string;
}

export interface ProductMedia {
    type: 'image' | 'video';
    url: string;
    alt?: string;
}

export interface ProductReview {
    id: string;
    author: string;
    rating: number;
    comment: string;
    submittedAt?: string;
}

export interface Product {
    id: string;
    name: string;
    price: string;
    oldPrice?: string;
    purchaseCount?: number;
    image: string;
    slug: string;
    category: string;
    categorySlug?: string;
    categoryGroup?: string;
    categoryGroupSlug?: string;
    subcategorySlugs?: string[];
    sku?: string;
    description?: string;
    descriptionHtml?: string;
    shortDescription?: string;
    gallery?: string[];
    mediaGallery?: ProductMedia[];
    specifications?: Record<string, string>;
    filterValues?: ProductFilterValue[];
    highlights?: string[];
    stockQuantity?: number;
    deliveryTime?: number;
    variants?: ProductVariant[];
    reviews?: ProductReview[];
    isFeatured?: boolean;
    isRecommended?: boolean;
}

export interface NavItem {
    label: string;
    href: string;
    children?: NavItem[];
}

export interface HeaderMenus {
    desktopMenuItems: NavItem[];
    desktopOverflowMenuItems: NavItem[];
    mobileMenuItems: NavItem[];
}

export interface Category {
    name: string;
    bg: string;
    product?: string;
    href: string;
}

export interface CatalogSubcategoryNavItem {
    id: string;
    name: string;
    slug: string;
    href: string;
    image?: string;
    hiddenFilterGroups?: CatalogFilterReference[];
    hiddenFilterOptions?: CatalogFilterReference[];
}

export interface CatalogCategoryGroupNavItem {
    id: string;
    name: string;
    slug: string;
    href: string;
    image?: string;
    hiddenFilterGroups?: CatalogFilterReference[];
    hiddenFilterOptions?: CatalogFilterReference[];
    children?: CatalogSubcategoryNavItem[];
}

export interface CatalogCategoryNavItem {
    id: string;
    name: string;
    slug: string;
    href: string;
    hiddenFilterGroups?: CatalogFilterReference[];
    hiddenFilterOptions?: CatalogFilterReference[];
    children?: CatalogCategoryGroupNavItem[];
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface Testimonial {
    text: string;
    author: string;
    location: string;
}

export interface BlogPost {
    title: string;
    excerpt: string;
    content?: string;
    date?: string;
    image: string;
    slug: string;
}
