export type MarketingSlide = {
    title: string;
    description: string;
    button: string;
    link: string;
    bg: string;
    overlayImage: string;
    layout: {
        paddingTop: number;
        titleMaxWidth: number;
        descMaxWidth: number;
        img: {
            w: number;
            h: number;
            top: number;
            right: number;
        };
    };
};

export const DEFAULT_MARKETING_SLIDES: MarketingSlide[] = [
    {
        title: 'Každodenní elegance z Itálie',
        description: 'Kabelky, které doplní váš den - stylové, lehké a vždy připravené vyrazit s vámi.',
        button: 'Prohlédnout kabelky',
        link: '/product-category/kabelky',
        bg: '/assets/bg/hero-slider-1.webp',
        overlayImage: '/assets/products/cutout-1.webp',
        layout: {
            paddingTop: 160,
            titleMaxWidth: 540,
            descMaxWidth: 600,
            img: { w: 269, h: 565, top: 105, right: 64 },
        },
    },
    {
        title: 'Lehkost v pohybu',
        description: 'Pro chvíle, kdy potřebujete mít styl i pohodlí. Italské kabelky a batohy pro váš volný den.',
        button: 'Objevte batohy',
        link: '/product-category/batohy',
        bg: '/assets/bg/hero-slider-2.webp',
        overlayImage: '/assets/products/cutout-2.png',
        layout: {
            paddingTop: 219,
            titleMaxWidth: 335,
            descMaxWidth: 453,
            img: { w: 343, h: 561, top: 83, right: 120 },
        },
    },
    {
        title: 'Síla elegance',
        description: 'Klasický design, pravá kůže, dokonalé zpracování. Kabelky, které podtrhnou vaši sebedůvěru.',
        button: 'Vyberte si svůj styl',
        link: '/shop',
        bg: '/assets/bg/hero-slider-3.webp',
        overlayImage: '/assets/products/cutout-3.png',
        layout: {
            paddingTop: 136,
            titleMaxWidth: 300,
            descMaxWidth: 453,
            img: { w: 177, h: 467, top: 160, right: 151 },
        },
    },
];
