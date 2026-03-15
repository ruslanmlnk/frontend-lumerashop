import { NavItem, Category, Product, Feature, BlogPost } from '../types/site';

export const NAV_ITEMS: NavItem[] = [
    { label: 'Domů', href: '/' },
    { label: 'Dámské kabelky', href: '/product-category/dmsk-kabelky' },
    { label: 'Pánské tašky', href: '/product-category/pnsk-taky' },
    {
        label: 'Batohy',
        href: '/product-category/batohy',
        children: [
            { label: 'Kožené batohy', href: '/product-category/batohy?type=kozene' },
            { label: 'Mestske batohy', href: '/product-category/batohy?type=mestske' }
        ]
    },
    {
        label: 'Doplňky',
        href: '/product-category/doplky',
        children: [
            { label: 'Peněženky', href: '/product-category/doplky?type=penezenky' },
            { label: 'Pasky', href: '/product-category/doplky?type=pasky' }
        ]
    },
    { label: 'O obchodě', href: '/o-nas' },
    { label: 'Blog', href: '/blog' },
    { label: 'Kontakt', href: '/kontakt' }
];

export const HERO_CATEGORIES: Category[] = [
    { name: 'Dámské Kabelky', bg: '/assets/bg/damske-kabelky.webp', product: '/assets/icons/cat-kabelky.webp', href: '/product-category/dmsk-kabelky' },
    { name: 'Pánské tašky', bg: '/assets/bg/panske-tasky.webp', product: '/assets/icons/cat-tasky.webp', href: '/product-category/pnsk-taky' },
    { name: 'Batohy', bg: '/assets/bg/batohynew.webp', product: '/assets/icons/cat-batohy.webp', href: '/product-category/batohy' },
    { name: 'Doplňky', bg: '/assets/bg/doplnky.webp', product: '/assets/icons/cat-doplnky.webp', href: '/product-category/doplky' }
];

export const FEATURED_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Italská shopper kabelka z pravé kuže Olivia růžová',
        price: '2 199 Kč',
        image: '/assets/products/olivia-ruzova-1.webp',
        slug: 'olivia-ruzova',
        category: 'Kabelky',
        sku: '00044rz',
        description: 'Italská kabelka z pravé kůže Olivia v růžové barvě spojuje moderní eleganci a vysoce praktický design. Tato praktická, damská kabelka je vybavena dvojitými uchy, která umožňují pohodlné nošení v ruce i přes rameno. Díky vnitřnímu zapínání můžete snadno měnit její tvar podle aktuálního obsahu či nálady. Hlavní prostor se bezpečně uzavírá na zip a obsahuje jednu velkou kapsu na zip a tři menší kapsičky. Do kabelky se pohodlně vejdou i dokumenty formátu A4.',
        gallery: [
            '/assets/products/olivia-ruzova-1.webp',
            '/assets/products/olivia-ruzova-2.webp',
            '/assets/products/olivia-ruzova-3.webp',
            '/assets/products/olivia-ruzova-4.webp'
        ],
        specifications: {
            'Rozměry': 'Š 45 cm x V 30 cm x H 14 cm',
            'Materiál': 'Kůže',
            'Barva': 'Růžová',
            'Délka uší': '2x 35 cm, 2x 70 cm',
            'Kování': 'Stříbrná barva',
            'Vyrobeno v': 'Itálii',
            'A4': 'Ano'
        }
    },
    { id: '2', name: 'Pásek tmavo hnědý', price: '890 Kč', image: '/assets/products/pasek-tmavo-hnedy.webp', slug: 'pasek-tmavo-hnedy', category: 'Doplňky' },
    { id: '3', name: 'Pásek hnědý', price: '890 Kč', image: '/assets/products/pasek-hnedy.webp', slug: 'pasek-hnedy', category: 'Doplňky' },
    { id: '4', name: 'Pásek černý', price: '890 Kč', image: '/assets/products/pasek-cerny.webp', slug: 'pasek-cerny', category: 'Doplňky' }
];

export const RECOMMENDED_PRODUCTS: Product[] = [
    { id: '5', name: 'Pásek taupe', price: '890 Kč', image: '/assets/products/pasek-taupe.webp', slug: 'pasek-taupe', category: 'Doplňky' },
    { id: '6', name: 'Elis béžova', price: '2 490 Kč', image: '/assets/products/elis-bezova.webp', slug: 'elis-bezova', category: 'Kabelky' },
    { id: '7', name: 'Elis taupe', price: '2 490 Kč', image: '/assets/products/elis-taupe.webp', slug: 'elis-taupe', category: 'Kabelky' },
    { id: '8', name: 'Viko černá', price: '2 190 Kč', image: '/assets/products/viko-cerna.webp', slug: 'viko-cerna', category: 'Kabelky' },
    { id: '9', name: 'Pásek hnědý II', price: '890 Kč', image: '/assets/products/pasek-hnedy.webp', slug: 'pasek-hnedy-2', category: 'Doplňky' },
    { id: '10', name: 'Elis béžova II', price: '2 490 Kč', image: '/assets/products/elis-bezova.webp', slug: 'elis-bezova-2', category: 'Kabelky' },
    { id: '11', name: 'Olivia růžová II', price: '2 890 Kč', image: '/assets/products/olivia-ruzova.webp', slug: 'olivia-ruzova-2', category: 'Kabelky' },
    { id: '12', name: 'Viko černá II', price: '2 190 Kč', image: '/assets/products/viko-cerna.webp', slug: 'viko-cerna-2', category: 'Kabelky' }
];

export const ALL_PRODUCTS: Product[] = [
    ...FEATURED_PRODUCTS,
    ...RECOMMENDED_PRODUCTS,
    { id: '13', name: 'Batoh City', price: '3 290 Kč', image: '/assets/products/elis-bezova.webp', slug: 'batoh-city', category: 'Batohy' },
    { id: '14', name: 'Pánská taška Blue', price: '4 190 Kč', image: '/assets/products/viko-cerna.webp', slug: 'panska-taska-blue', category: 'Pánské tašky' }
];

export const FEATURES_DATA: Feature[] = [
    { id: '1', title: 'Italský původ', description: 'Kabelky přímo od menších výrobců z Itálie.', icon: '/assets/icons/features/italian-origin.png' },
    { id: '2', title: 'Pečlivý výběr', description: 'Každý model vybíráme osobně s důrazem na kvalitu a styl.', icon: '/assets/icons/features/curated-selection.png' },
    { id: '3', title: 'Doprava zdarma', description: 'Pro objednávky nad 1500 Kč doprava zdarma. Rychlé a bezpečné doručení po celé ČR.', icon: '/assets/icons/features/free-delivery.png' },
    { id: '4', title: 'Osobní přístup', description: 'Malý obchod, velká vášeň pro krásu a design.', icon: '/assets/icons/features/personal-touch.png' }
];

export const TESTIMONIALS = [
    { text: "Stylové, originální a precizně zpracované produkty. Doporučuji!", author: "Marie N.", location: "Praha" },
    { text: "Kabelka přišla nádherně zabalená, kvalita mě mile překvapila.", author: "Jana S.", location: "Brno" },
    { text: "Rychlé doručení a perfektní komunikace. Kabelka je nádherná.", author: "Lucie B.", location: "Ostrava" }
];

export const BLOG_POSTS: BlogPost[] = [
    {
        title: "Jak vybrat tu pravou kabelku?",
        excerpt: "Průvodce světem stylů, materiálů a velikostí.",
        date: "14. února 2026",
        content: `
            <p>Výběr kabelky je pro každou ženu důležitým rozhodnutím. Nejde jen o praktický doplněk, ale o součást vyjádření vaší osobnosti a stylu. V tomto průvodci vám pomůžeme orientovat se v široké nabídce materiálů a tvarů.</p>
            <h3>1. Zvažte příležitost</h3>
            <p>Pro každodenní nošení do práce je ideální prostorná shopper taška nebo elegantní kabelka do ruky, do které se vejdou dokumenty formátu A4 i osobní věci. Pro večerní akce sáhněte po menším psaníčku nebo crossbody kabelce.</p>
            <h3>2. Kvalita materiálu</h3>
            <p>V Lumeře sázíme na pravou italskou kůži. Je to investice, která se vyplatí – kůže s časem získává na kráse a při správné péči vám vydrží desítky let.</p>
            <p>Nezapomeňte také na barvu. Černá a hnědá jsou klasiky, ale nebojte se experimentovat s pastelovými tóny pro oživení vašeho outfitu.</p>
        `,
        image: "/assets/blog/vybrat-kabelku.jpg",
        slug: "jak-vybrat-kabelku"
    },
    {
        title: "Péče o kožené výrobky",
        excerpt: "Jak udržet vaše doplňky dlouho jako nové.",
        date: "20. ledna 2026",
        content: `
            <p>Kožené výrobky jsou přírodní materiál, který vyžaduje specifickou péči. Správným zacházením zajistíte, že vaše oblíbená kabelka bude vypadat skvěle i po letech používání.</p>
            <h3>Základní pravidla péče:</h3>
            <ul>
                <li><strong>Impregnace:</strong> Před prvním použitím doporučujeme kabelku naimpregnovat vhodným přípravkem na kůži.</li>
                <li><strong>Čištění:</strong> Vyhněte se agresivním chemikáliím. Používejte pouze speciální mýdla na kůži nebo lehce navlhčený hadřík.</li>
                <li><strong>Skladování:</strong> Pokud kabelku delší dobu nenosíte, vycpěte ji papírem, aby si zachovala svůj tvar, a uložte ji do prachového sáčku.</li>
            </ul>
        `,
        image: "/assets/blog/pece-o-kuzi.jpg",
        slug: "pece-o-kozi"
    },
    {
        title: "Barvy, které ovládnou sezónu",
        excerpt: "Inspirujte se nejnovějšími trendy z Itálie.",
        date: "5. ledna 2026",
        content: `
            <p>Nová sezóna přináší svěží pohled na barevné kombinace. V Itálii, kolébce módy, se letos vsází na harmonii přírodních tónů s odvážnými akcenty.</p>
            <h3>Trendy tóny pro tento rok:</h3>
            <p><strong>Zemitá hnědá a taupe:</strong> Tyto barvy jsou symbolem elegance a klidu. Skvěle se kombinují s bílou nebo krémovou barvou.</p>
            <p><strong>Pastelově růžová:</strong> Dodává outfitu jemnost a ženskost. Je ideální volbou pro jarní a letní měsíce.</p>
            <p><strong>Olivově zelená:</strong> Netradiční, ale velmi stylová barva, která vynikne zejména na hladké kůži.</p>
        `,
        image: "/assets/blog/barvy.jpg",
        slug: "trendy-barvy"
    }
];

