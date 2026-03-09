import GeneralInfoLayout from '@/components/info/GeneralInfoLayout';

export default function CookiesPage() {
    return (
        <GeneralInfoLayout
            title="Cookies"
            breadcrumbs={[{ label: 'Cookies' }]}
        >
            <h2>Co jsou to cookies?</h2>
            <p>
                Cookies jsou malé textové soubory, které se ukládají do vašeho prohlížeče a pomáhají nám zajistit správné fungování webu a zlepšovat váš zážitek z nákupu.
            </p>

            <h2>Jaké typy cookies používáme?</h2>
            <ul>
                <li><strong>Nezbytné:</strong> Nutné pro fungování košíku a přihlášení.</li>
                <li><strong>Analytické:</strong> Pomáhají nám pochopit, jak web používáte (Google Analytics).</li>
                <li><strong>Marketingové:</strong> Slouží pro personalizaci reklam.</li>
            </ul>

            <h2>Správa cookies</h2>
            <p>
                Nastavení cookies můžete kdykoliv změnit ve vašem prohlížeči. Vezměte prosím na vědomí, že zakázání nezbytných cookies může omezit funkčnost webu.
            </p>
        </GeneralInfoLayout>
    );
}
